import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    if (db && typeof db.insert === 'function') {
      const result = await db.insert(users)
        .values({
          uid,
          email,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email,
          },
        })
        .returning();

      if (result && result.length > 0) {
        return result[0];
      }
    }
  } catch (err) {
    console.warn('[AI Studio] getOrCreateUser DB fallback active:', err);
  }
  return { id: 1, uid, email, role: 'client' };
}
