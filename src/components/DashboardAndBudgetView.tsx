import React, { useState, useEffect } from 'react';
import { TaskItem, BudgetItem, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { StorageManager } from '../lib/storage';
import { CheckSquare, Square, Plus, Trash2, DollarSign, PieChart, TrendingUp, AlertCircle, Sparkles, CheckCircle2, Sliders, Save, Target } from 'lucide-react';

interface DashboardAndBudgetViewProps {
  tasks: TaskItem[];
  budget: BudgetItem[];
  language: Language;
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onUpdateBudget: (budget: BudgetItem[]) => void;
}

export const DashboardAndBudgetView: React.FC<DashboardAndBudgetViewProps> = ({
  tasks,
  budget,
  language,
  onUpdateTasks,
  onUpdateBudget,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Client Target Budget
  const [clientTargetBudget, setClientTargetBudget] = useState<number>(() => StorageManager.getClientTargetBudget());
  const [editingTargetBudget, setEditingTargetBudget] = useState<string>(() => String(StorageManager.getClientTargetBudget()));
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  const convertArabicDigits = (val: string): string => {
    const map: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    };
    return val.replace(/[٠-٩]/g, (char) => map[char] || char).replace(/[^0-9]/g, '');
  };

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('عام');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-08-20');

  // New expense form state
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<'hall' | 'photographer' | 'decor' | 'catering' | 'music' | 'makeup' | 'other'>('hall');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('5000');

  // Calculate task progress
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Calculate budget stats
  const totalAllocated = budget.reduce((acc, item) => acc + item.estimatedCost, 0);
  const totalSpent = budget.reduce((acc, item) => acc + item.actualCost, 0);
  const totalPaidDeposit = budget.reduce((acc, item) => acc + item.paidAmount, 0);
  const remainingBudget = totalAllocated - totalSpent;
  const remainingTargetBudget = clientTargetBudget - totalSpent;
  const budgetUsagePercentage = clientTargetBudget > 0 ? Math.min(100, Math.round((totalSpent / clientTargetBudget) * 100)) : 0;

  const handleSaveTargetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = convertArabicDigits(editingTargetBudget);
    const num = Number(cleaned);
    if (isNaN(num) || num <= 0) {
      alert('يرجى إدخال مبلغ ميزانية صحيح بالأرقام (مثال: 100000)');
      return;
    }
    StorageManager.saveClientTargetBudget(num);
    setClientTargetBudget(num);
    setEditingTargetBudget(String(num));
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((tk) => (tk.id === taskId ? { ...tk, completed: !tk.completed } : tk));
    onUpdateTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      title: newTaskTitle.trim(),
      titleEn: newTaskTitle.trim(),
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
      completed: false,
      category: newTaskCategory,
      priority: 'medium',
    };

    onUpdateTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter((tk) => tk.id !== taskId));
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(convertArabicDigits(newExpenseAmount));
    if (!newExpenseName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newExpense: BudgetItem = {
      id: 'bdg-' + Date.now(),
      name: newExpenseName.trim(),
      nameEn: newExpenseName.trim(),
      category: newExpenseCategory,
      estimatedCost: amountNum,
      actualCost: amountNum,
      paidAmount: Math.round(amountNum * 0.1), // 10% deposit default
    };

    onUpdateBudget([newExpense, ...budget]);
    setNewExpenseName('');
    setNewExpenseAmount('5000');
  };

  const handleDeleteExpense = (expenseId: string) => {
    onUpdateBudget(budget.filter((b) => b.id !== expenseId));
  };

  return (
    <div className="space-y-6">
      {/* Custom Client Budget Specification Card */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 border border-amber-500/30 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>الميزانية المخصصة والمحددة بواسطة العميل</span>
            </span>
            <h3 className="text-xl font-bold font-serif text-amber-200">
              تحديد سقف الميزانية الكلية لمناسبتك
            </h3>
            <p className="text-xs text-slate-300">
              قم بإدخال الميزانية الكلية التي تود عدم تجاوزها، وسيقوم النظام بتتبع مصروفاتك وإشعارك بالمتبقي.
            </p>
          </div>

          <form onSubmit={handleSaveTargetBudget} className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-amber-500/30 shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-amber-400 w-full sm:w-52">
              <input
                type="text"
                inputMode="numeric"
                placeholder="ادخل الميزانية"
                value={editingTargetBudget}
                onChange={(e) => setEditingTargetBudget(convertArabicDigits(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="bg-transparent text-amber-300 font-mono font-black text-sm w-full focus:outline-none"
              />
              <span className="text-xs text-slate-400 font-bold shrink-0">ج.م</span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 shrink-0 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الميزانية</span>
            </button>
          </form>
        </div>

        {/* Budget Health Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">
              المصروفات الحالية ({totalSpent.toLocaleString()} ج.م) من أصل ميزانيتك الكلية المحددة ({clientTargetBudget.toLocaleString()} ج.م)
            </span>
            <span className={remainingTargetBudget >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
              {remainingTargetBudget >= 0 ? `متبقي: ${remainingTargetBudget.toLocaleString()} ج.م` : `تنبيه تجاوزت الميزانية بـ ${Math.abs(remainingTargetBudget).toLocaleString()} ج.م!`}
            </span>
          </div>

          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercentage > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
              }`}
              style={{ width: `${budgetUsagePercentage}%` }}
            />
          </div>
        </div>

        {isSavedNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>تم حفظ الميزانية الكلية التي حددتها بنجاح!</span>
          </div>
        )}
      </div>

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>{t('completionRate')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{completionPercentage}%</span>
            <span className="text-xs text-slate-400">({completedTasksCount} من {totalTasksCount} مهام)</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Total Allocated Budget */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>{t('totalBudget')}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {totalAllocated.toLocaleString()} <span className="text-sm font-normal text-slate-400">{t('egp')}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">إجمالي تقدير مصروفات القاعة والخدمات</p>
        </div>

        {/* Spent & Deposits */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>{t('spentBudget')} + العربون</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300">
            {totalSpent.toLocaleString()} <span className="text-sm font-normal text-slate-400">{t('egp')}</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-bold mt-3">
            تم سداد {totalPaidDeposit.toLocaleString()} ج.م عربون (10%)
          </p>
        </div>

        {/* Remaining Budget */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>{t('remainingBudget')}</span>
            <PieChart className="w-4 h-4 text-purple-400" />
          </div>
          <div className={`text-2xl font-black ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {remainingBudget.toLocaleString()} <span className="text-sm font-normal text-slate-400">{t('egp')}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">المتبقي من الميزانية المخصصة</p>
        </div>
      </div>

      {/* Main Grid: Tasks Checklist & Expense Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-amber-300 font-serif flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-400" />
              <span>{t('tasksChecklist')}</span>
            </h3>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">
              {completedTasksCount}/{totalTasksCount} مكتملة
            </span>
          </div>

          {/* Add Task Input */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="إضافة مهمة جديدة للتجهيزات..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addTask')}</span>
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {tasks.map((tk) => (
              <div
                key={tk.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  tk.completed
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-500 line-through'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-slate-600'
                }`}
              >
                <div
                  onClick={() => handleToggleTask(tk.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  {tk.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-bold truncate">{language === 'en' ? tk.titleEn : tk.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">{tk.category}</span>
                      <span>موعد الإنجاز: {tk.dueDate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(tk.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-amber-300 font-serif flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span>جدول المصروفات والمدفوعات</span>
            </h3>
            <span className="text-xs font-bold text-rose-300">
              مجموع المدفوع: {totalPaidDeposit.toLocaleString()} ج.م
            </span>
          </div>

          {/* Add Expense Form */}
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              placeholder="اسم المصروف / الخِدْمة"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="المبلغ (جنيه)"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(convertArabicDigits(e.target.value))}
              onFocus={(e) => e.target.select()}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addExpense')}</span>
            </button>
          </form>

          {/* Expenses List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {budget.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-white text-xs">{language === 'en' ? item.nameEn : item.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>التكلفة الفعلية: {item.actualCost.toLocaleString()} ج.م</span>
                    <span className="text-emerald-400 font-bold">العربون المدفوع (10%): {item.paidAmount.toLocaleString()} ج.م</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-400 text-sm">{item.estimatedCost.toLocaleString()} ج.م</span>
                  <button
                    onClick={() => handleDeleteExpense(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
