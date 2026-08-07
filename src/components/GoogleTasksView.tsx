import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  AlertCircle, 
  Lock, 
  Sparkles,
  ListTodo,
  FileText
} from 'lucide-react';
import { 
  initTasksAuth, 
  googleSignInForTasks, 
  listTaskLists, 
  listTasks, 
  createGoogleTask, 
  updateTaskStatus, 
  deleteGoogleTask, 
  TaskList, 
  GoogleTask 
} from '../lib/googleTasks';
import { User } from 'firebase/auth';

export const GoogleTasksView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskNotes, setNewTaskNotes] = useState<string>('');
  const [newTaskDue, setNewTaskDue] = useState<string>('');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mandatory Delete Confirmation Modal State
  const [taskToDelete, setTaskToDelete] = useState<GoogleTask | null>(null);

  useEffect(() => {
    const unsubscribe = initTasksAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadTaskListsAndTasks(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadTaskListsAndTasks = async (accessToken: string, listId: string = '@default') => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const lists = await listTaskLists(accessToken);
      setTaskLists(lists);
      
      const items = await listTasks(accessToken, listId);
      setTasks(items);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      setStatusMessage({ type: 'error', text: 'فشل جلب المهام من Google Tasks. يرجى إكمال تسجيل الدخول.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignInForTasks();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        loadTaskListsAndTasks(result.accessToken);
        setStatusMessage({ type: 'success', text: 'تم تسجيل الدخول والربط بـ Google Tasks بنجاح!' });
      }
    } catch (error: any) {
      console.error('Tasks login error:', error);
      setStatusMessage({ type: 'error', text: 'فشل تسجيل الدخول باستخدام Google.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectList = async (listId: string) => {
    setSelectedListId(listId);
    if (token) {
      setIsLoading(true);
      try {
        const items = await listTasks(token, listId);
        setTasks(items);
      } catch (error) {
        setStatusMessage({ type: 'error', text: 'تعذر جلب مهام هذه القائمة.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTaskTitle.trim()) return;

    setIsAddingTask(true);
    setStatusMessage(null);
    try {
      await createGoogleTask(token, selectedListId, newTaskTitle.trim(), newTaskNotes.trim() || undefined, newTaskDue || undefined);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      setStatusMessage({ type: 'success', text: 'تم إضافة المهمة إلى Google Tasks بنجاح!' });
      const items = await listTasks(token, selectedListId);
      setTasks(items);
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'فشل إضافة المهمة إلى Google Tasks.' });
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: GoogleTask) => {
    if (!token) return;
    const isCompleted = task.status === 'completed';
    const newStatus = !isCompleted;

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus ? 'completed' : 'needsAction' } : t));

    try {
      await updateTaskStatus(token, selectedListId, task.id, newStatus);
      setStatusMessage({ type: 'success', text: newStatus ? 'تم إنجاز المهمة!' : 'تم إعادة المهمة لقائمة الانتظار.' });
    } catch (error) {
      // Revert on error
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: isCompleted ? 'completed' : 'needsAction' } : t));
      setStatusMessage({ type: 'error', text: 'فشل تحديث حالة المهمة.' });
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete || !token) return;
    const targetTask = taskToDelete;
    setTaskToDelete(null);

    try {
      await deleteGoogleTask(token, selectedListId, targetTask.id);
      setStatusMessage({ type: 'success', text: `تم حذف المهمة (${targetTask.title}) بنجاح.` });
      setTasks(prev => prev.filter(t => t.id !== targetTask.id));
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'تعذر حذف المهمة من Google Tasks.' });
    }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const pendingTasks = filteredTasks.filter(t => t.status !== 'completed');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <CheckSquare className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  مزامنة الملاحظات والمهام المباشرة
                </span>
              </div>
              <h2 className="text-2xl font-black mt-1 font-serif text-emerald-100">
                إدارة مهام وتجهيزات الفرح مع Google Tasks
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                نسق قائمة مهام العرس مباشرة وحافظ على مزامنتها مع هاتف وتطبيقات Google.
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
              <img src={user.photoURL || undefined} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-400" />
              <div className="text-xs">
                <span className="block font-bold text-white">{user.displayName || 'مستخدم Google'}</span>
                <span className="text-[10px] text-emerald-300 font-mono">{user.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-lg ${
          statusMessage.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {!token ? (
        /* Sign in card */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-xl space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-emerald-200">ربط قائمة مهام Google Tasks</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              سجل الدخول بحساب Google لمزامنة قائمة المشتريات، اختيار المصورين، ومواعيد تجربة الفستان مباشرة مع حسابك الرسمي.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-3.5 rounded-2xl shadow-xl transition-all border border-slate-200 text-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isLoggingIn ? 'جاري الاتصال بـ Google Tasks...' : 'تسجيل الدخول وربط Google Tasks'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Tasks Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Task Lists */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl space-y-4 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold font-serif text-emerald-300 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-400" />
                <span>قوائم المهام في حسابك</span>
              </h3>
              <button
                onClick={() => token && loadTaskListsAndTasks(token, selectedListId)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                title="تحديث القوائم"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => handleSelectList('@default')}
                className={`w-full text-right p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  selectedListId === '@default' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>القائمة الافتراضية (Default List)</span>
                {selectedListId === '@default' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>

              {taskLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleSelectList(list.id)}
                  className={`w-full text-right p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    selectedListId === list.id 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{list.title}</span>
                  {selectedListId === list.id && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Main Tasks Content */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
            {/* Create Task Form */}
            <form onSubmit={handleCreateTask} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>إضافة مهمة جديدة إلى Google Tasks</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="عنوان المهمة (مثال: دفع عربون المصور)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  required
                />

                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-8 pl-2 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="تفاصيل وملاحظات إضافية (اختياري)..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isAddingTask || !newTaskTitle.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingTask ? 'جاري الحفظ...' : 'إضافة'}</span>
                </button>
              </div>
            </form>

            {/* Filter/Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في مهام Google Tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Pending Tasks List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                <span>المهام المعلقة ({pendingTasks.length})</span>
                {isLoading && <span className="text-[10px] text-slate-400 font-normal">جاري التحديث...</span>}
              </h4>

              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">لا توجد مهام معلقة. أحسنت!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingTasks.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3 group">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => handleToggleTaskStatus(t)}
                          className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                          title="تحديد كمكتملة"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-100 block group-hover:text-emerald-300">
                            {t.title}
                          </span>
                          {t.notes && (
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{t.notes}</span>
                            </p>
                          )}
                          {t.due && (
                            <span className="inline-block mt-1 text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700">
                              تاريخ الاستحقاق: {new Date(t.due).toLocaleDateString('ar-EG')}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setTaskToDelete(t)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks Accordion / List */}
            {completedTasks.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400">
                  المهام المكتملة ({completedTasks.length})
                </h4>

                <div className="space-y-2">
                  {completedTasks.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800/60 opacity-75 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => handleToggleTaskStatus(t)}
                          className="mt-0.5 text-emerald-400 shrink-0"
                          title="إعادة للانتظار"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-400 line-through block">
                            {t.title}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setTaskToDelete(t)}
                        className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Explicit User Confirmation Modal for Destructive Delete Operation */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white space-y-4 animate-in fade-in zoom-in">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold font-serif">تأكيد حذف المهمة من Google Tasks</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت أخيرًا متأكد من رغبتك في حذف المهمة <span className="font-bold text-emerald-300 inline-block">"{taskToDelete.title}"</span> بشكل نهائي من Google Tasks؟
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
