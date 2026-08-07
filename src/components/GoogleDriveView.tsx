import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Upload, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Folder, 
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogOut,
  Sparkles
} from 'lucide-react';
import { 
  initAuth, 
  googleSignInForDrive, 
  listDriveFiles, 
  uploadFileToDrive, 
  createDriveFolder, 
  deleteDriveFile, 
  DriveFile,
  getDriveAccessToken
} from '../lib/googleDrive';
import { User } from 'firebase/auth';

export const GoogleDriveView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mandatory Delete Confirmation Modal State
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadFiles = async (accessToken: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const driveFiles = await listDriveFiles(accessToken);
      setFiles(driveFiles);
    } catch (error: any) {
      console.error('Error loading files:', error);
      setStatusMessage({ type: 'error', text: 'فشل جلب الملفات من Google Drive. يرجى إعادة تسجيل الدخول.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignInForDrive();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        loadFiles(result.accessToken);
        setStatusMessage({ type: 'success', text: 'تم تسجيل الدخول والربط بـ Google Drive بنجاح!' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setStatusMessage({ type: 'error', text: 'فشل تسجيل الدخول باستخدام Google.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      await createDriveFolder(token, newFolderName.trim());
      setNewFolderName('');
      setStatusMessage({ type: 'success', text: 'تم إنشاء المجلد بنجاح في Google Drive!' });
      loadFiles(token);
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'تعذر إنشاء المجلد.' });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !token) return;

    setUploading(true);
    setStatusMessage(null);
    try {
      await uploadFileToDrive(token, selectedFile);
      setStatusMessage({ type: 'success', text: `تم رفع الملف (${selectedFile.name}) إلى Google Drive بنجاح!` });
      loadFiles(token);
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'فشل رفع الملف إلى Google Drive.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete || !token) return;
    const targetFile = fileToDelete;
    setFileToDelete(null);
    try {
      await deleteDriveFile(token, targetFile.id);
      setStatusMessage({ type: 'success', text: `تم حذف الملف (${targetFile.name}) من Google Drive.` });
      loadFiles(token);
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'تعذر حذف الملف من Google Drive.' });
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="w-5 h-5 text-amber-400 shrink-0" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />;
    return <FileText className="w-5 h-5 text-sky-400 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
              <HardDrive className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  ربط السحابة المباشر
                </span>
              </div>
              <h2 className="text-2xl font-black mt-1 font-serif text-sky-100">
                إدارة عقود ومستندات المناسبات عبر Google Drive
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                احفظ عقود القاعات، تصاميم الديكور، ومستندات الضيوف بأمان كامل في حسابك السحابي.
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
              <img src={user.photoURL || undefined} alt="Avatar" className="w-8 h-8 rounded-full border border-sky-400" />
              <div className="text-xs">
                <span className="block font-bold text-white">{user.displayName || 'مستخدم Google'}</span>
                <span className="text-[10px] text-sky-300 font-mono">{user.email}</span>
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
        /* Sign in with Google card */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-xl space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto border border-sky-500/20">
            <Lock className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-sky-200">ربط حساب Google Drive الخاص بك</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              قم بتسجيل الدخول باستخدام حساب Google الخاص بك لتمكين التطبيق من استعراض، رفع، وحفظ ملفات المناسبات والعقود مباشرة في المجلد السحابي بطلب منك.
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
              <span>{isLoggingIn ? 'جاري الاتصال بـ Google...' : 'تسجيل الدخول باستخدام Google (Sign in with Google)'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Google Drive Toolbar & File Explorer */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
          {/* Actions Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-800">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في ملفات Google Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Create Folder Form */}
            <form onSubmit={handleCreateFolder} className="flex gap-2">
              <input
                type="text"
                placeholder="اسم مجلد جديد..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                <FolderPlus className="w-4 h-4" />
                <span>إنشاء</span>
              </button>
            </form>

            {/* Upload File Input */}
            <div className="flex items-center gap-2">
              <label className="w-full cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'جاري الرفع...' : 'رفع ملف إلى Google Drive'}</span>
                <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>

              <button
                onClick={() => token && loadFiles(token)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 shrink-0"
                title="تحديث القائمة"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Files List */}
          <div>
            <h3 className="text-sm font-bold text-sky-200 mb-3 flex items-center justify-between">
              <span>ملفاتك المحفوظة في Google Drive ({filteredFiles.length})</span>
              {isLoading && <span className="text-xs text-slate-400 font-normal">جاري التحميل...</span>}
            </h3>

            {filteredFiles.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800">
                <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">لا توجد ملفات حالياً. يمكنك رفع العقود أو المستندات أعلاه.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-3 group">
                    <div className="flex items-start gap-3">
                      {getFileIcon(file.mimeType)}
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-sky-300" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 dir-ltr text-right">
                          {file.createdTime ? new Date(file.createdTime).toLocaleDateString('ar-EG') : 'Google Drive File'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                      {file.webViewLink ? (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-sky-300 font-bold text-[11px] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>فتح في Drive</span>
                        </a>
                      ) : (
                        <span className="text-slate-600 text-[10px]">مجلد</span>
                      )}

                      <button
                        onClick={() => setFileToDelete(file)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="حذف الملف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Explicit User Confirmation Modal for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white space-y-4 animate-in fade-in zoom-in">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold font-serif">تأكيد حذف الملف من Google Drive</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت أخيرًا متأكد من رغبتك في حذف الملف المسمى <span className="font-bold text-amber-300 dir-ltr inline-block">"{fileToDelete.name}"</span> بشكل دائم من حساب Google Drive الخاص بك؟
            </p>
            <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              ملاحظة: هذا الإجراء لا يمكن التراجع عنه وسيقوم بحذف الملف من السحابة.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30"
              >
                تأكيد الحذف الدائم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
