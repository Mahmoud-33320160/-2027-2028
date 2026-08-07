import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/tasks');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initTasksAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken && onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn && onAuthFailure) {
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignInForTasks = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('لم يتم الحصول على رمز الوصول من حساب Google');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Tasks Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export interface TaskList {
  id: string;
  title: string;
  updated?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated?: string;
}

export async function listTaskLists(token: string): Promise<TaskList[]> {
  const url = 'https://tasks.googleapis.com/tasks/v1/users/@me/lists';
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`خطأ في جلب قوائم المهام من Google Tasks: ${errorText}`);
  }

  const data = await response.json();
  return data.items || [];
}

export async function listTasks(token: string, taskListId: string = '@default'): Promise<GoogleTask[]> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`خطأ في جلب المهام: ${errorText}`);
  }

  const data = await response.json();
  return data.items || [];
}

export async function createGoogleTask(
  token: string,
  taskListId: string = '@default',
  title: string,
  notes?: string,
  due?: string
): Promise<GoogleTask> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`;
  
  const body: any = {
    title,
    notes,
  };

  if (due) {
    // Format due date as RFC3339 string (e.g., 2026-12-31T00:00:00.000Z)
    body.due = new Date(due).toISOString();
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('فشل إضافة المهمة إلى Google Tasks');
  }

  return await response.json();
}

export async function updateTaskStatus(
  token: string,
  taskListId: string = '@default',
  taskId: string,
  completed: boolean
): Promise<GoogleTask> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: completed ? 'completed' : 'needsAction',
    }),
  });

  if (!response.ok) {
    throw new Error('فشل تحديث حالة المهمة في Google Tasks');
  }

  return await response.json();
}

export async function deleteGoogleTask(
  token: string,
  taskListId: string = '@default',
  taskId: string
): Promise<void> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('فشل حذف المهمة من Google Tasks');
  }
}
