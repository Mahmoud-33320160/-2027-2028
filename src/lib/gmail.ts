import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.addScope('https://www.googleapis.com/auth/gmail.labels');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
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

export const googleSignInForGmail = async (): Promise<{ user: User; accessToken: string } | null> => {
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
    console.error('Gmail Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGmailAccessToken = (): string | null => {
  return cachedAccessToken;
};

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  bodyHtml?: string;
  bodyText?: string;
  labelIds?: string[];
  isUnread?: boolean;
}

export async function listGmailMessages(token: string, query: string = ''): Promise<GmailMessage[]> {
  try {
    let url = 'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20';
    if (query.trim()) {
      url += `&q=${encodeURIComponent(query.trim())}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`فشل استعلام الرسائل من Gmail (${res.status})`);
    }

    const data = await res.json();
    if (!data.messages || !Array.isArray(data.messages)) {
      return [];
    }

    // Fetch message header details concurrently
    const detailedMessages = await Promise.all(
      data.messages.slice(0, 15).map(async (msg: { id: string }) => {
        return await getGmailMessageDetails(token, msg.id);
      })
    );

    return detailedMessages.filter(Boolean) as GmailMessage[];
  } catch (error) {
    console.error('Error listing Gmail messages:', error);
    throw error;
  }
}

export async function getGmailMessageDetails(token: string, messageId: string): Promise<GmailMessage | null> {
  try {
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return null;

    const data = await res.json();
    const headers = data.payload?.headers || [];

    const getHeader = (name: string) => {
      const h = headers.find((item: { name: string; value: string }) => item.name.toLowerCase() === name.toLowerCase());
      return h ? h.value : '';
    };

    const subject = getHeader('Subject') || 'بدون عنوان';
    const from = getHeader('From') || 'غير معروف';
    const to = getHeader('To') || '';
    const date = getHeader('Date') || '';
    const labelIds = data.labelIds || [];
    const isUnread = labelIds.includes('UNREAD');

    // Extract body snippet or body text
    let bodyText = data.snippet || '';
    if (data.payload?.body?.data) {
      bodyText = decodeBase64Url(data.payload.body.data);
    } else if (data.payload?.parts) {
      const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain' || p.mimeType === 'text/html');
      if (textPart?.body?.data) {
        bodyText = decodeBase64Url(textPart.body.data);
      }
    }

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet || '',
      subject,
      from,
      to,
      date,
      bodyText,
      labelIds,
      isUnread
    };
  } catch (err) {
    console.error(`Error fetching Gmail message ${messageId}:`, err);
    return null;
  }
}

function decodeBase64Url(base64UrlStr: string): string {
  try {
    const base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      escape(window.atob(base64))
    );
  } catch {
    return base64UrlStr;
  }
}

export async function sendGmailMessage(
  token: string,
  params: { to: string; subject: string; body: string }
): Promise<boolean> {
  try {
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
    const emailLines = [
      `To: ${params.to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      params.body
    ];

    const email = emailLines.join('\r\n');
    const base64Encoded = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: base64Encoded })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || `فشل إرسال البريد الإلكتروني (${res.status})`);
    }

    return true;
  } catch (error) {
    console.error('Error sending Gmail message:', error);
    throw error;
  }
}

export async function deleteGmailMessage(token: string, messageId: string): Promise<boolean> {
  try {
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`فشل حذف البريد الإلكتروني (${res.status})`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting Gmail message:', error);
    throw error;
  }
}
