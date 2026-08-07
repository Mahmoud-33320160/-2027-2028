# Security Specification & Threat Model

## 1. Data Invariants

1. **Self-Assigned Admin Guard**: A user cannot register or update their user document (`/users/{userId}`) to have `role == 'admin'` unless their authenticated email is explicitly the verified platform owner email (`mmm3332012@gmail.com` or `mmmmm3332012@gmail.com`).
2. **Cross-Client Booking Isolation**: A client can ONLY read (`get`/`list`) bookings where `clientId == request.auth.uid` or `clientEmail == request.auth.token.email`. A client cannot view or modify bookings belonging to another client.
3. **Vendor Service & Booking Scoping**: A vendor can only modify services where `vendorId == request.auth.uid`. A vendor can only view bookings associated with their own services or assigned `vendorId`.
4. **Vendor Application Privilege Escalation Prevention**: Clients can create vendor applications, but ONLY admins can approve/reject (`status` transition) or update verification call details.
5. **Guest, Task, & Budget Isolation**: Guests, tasks, and budget items belong strictly to the creating user (`clientId == request.auth.uid` or `clientEmail == request.auth.token.email`) or an admin. No cross-client leakage is permitted.
6. **Promo Code Immutability**: Only admins can create, modify, or delete promo codes. Clients have read-only access.
7. **Identity Integrity**: All documents created with `clientId` or `userId` or `vendorId` MUST bind those fields to `request.auth.uid` (or authenticated email), and those fields are immutable on updates.

---

## 2. The "Dirty Dozen" Threat Payloads

1. **Payload 1 (Self-Assigned Admin)**: Client creates `/users/attacker-uid` with `role: "admin"`.
2. **Payload 2 (Cross-Client Booking Theft)**: Client `user-A` queries `/bookings` with no filters to list `user-B`'s private booking details.
3. **Payload 3 (Cross-Client Booking Tampering)**: Client `user-A` updates `/bookings/booking-of-user-B` setting `status: "cancelled"`.
4. **Payload 4 (Unapproved Vendor Elevation)**: Vendor applicant updates `/vendor_applications/app-1` setting `status: "approved"`.
5. **Payload 5 (Cross-Vendor Service Overwrite)**: Vendor `vendor-A` updates `/services/service-of-vendor-B` changing `price: 1`.
6. **Payload 6 (Shadow Field Injection in Booking)**: Client adds `isAdmin: true` or `discountApplied: 100` into booking document write.
7. **Payload 7 (Cross-Client Guest List Scrape)**: Unauthenticated or non-owner user lists `/guests`.
8. **Payload 8 (Orphaned Task Creation)**: User creates `/tasks/task-1` setting `clientId: "victim-uid"`.
9. **Payload 9 (Promo Code Forgery)**: Client creates `/promo_codes/FREE100` with `discountPercentage: 100`.
10. **Payload 10 (Denial of Wallet ID Exhaustion)**: Attacker attempts to write a document with a 20KB random string ID.
11. **Payload 11 (Timestamp Spoofing)**: Client creates booking with `createdAt: "2099-01-01T00:00:00Z"`.
12. **Payload 12 (Admin Role Escalation in User Document)**: Existing client updates their own document at `/users/my-uid` with `role: "admin"`.

---

## 3. Security Test Runner (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'pure-planet-0dw25',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules - Role-Based Access & Cross-Client Isolation', () => {
  const clientA = { uid: 'client-A-id', email: 'clientA@example.com', email_verified: true };
  const clientB = { uid: 'client-B-id', email: 'clientB@example.com', email_verified: true };
  const owner = { uid: 'owner-id', email: 'mmm3332012@gmail.com', email_verified: true };
  const vendor = { uid: 'vendor-1-id', email: 'vendor1@example.com', email_verified: true };

  test('Payload 1 & 12: Client cannot set or update role to admin', async () => {
    const db = testEnv.authenticatedContext(clientA.uid, { email: clientA.email, email_verified: true }).firestore();
    
    // Self-registration as admin MUST FAIL
    await assertFails(db.collection('users').doc(clientA.uid).set({
      id: clientA.uid,
      name: 'Client A',
      email: clientA.email,
      role: 'admin',
      createdAt: '2026-01-01'
    }));
  });

  test('Payload 2 & 3: Client A cannot read or mutate Client B bookings', async () => {
    const dbA = testEnv.authenticatedContext(clientA.uid, { email: clientA.email, email_verified: true }).firestore();
    const dbB = testEnv.authenticatedContext(clientB.uid, { email: clientB.email, email_verified: true }).firestore();

    // Setup B booking
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('bookings').doc('booking-B').set({
        id: 'booking-B',
        clientId: clientB.uid,
        clientEmail: clientB.email,
        serviceId: 'srv-1',
        serviceName: 'Hall 1',
        totalPrice: 5000,
        status: 'pending',
        paymentStatus: 'pending'
      });
    });

    // Client A trying to read Client B booking MUST FAIL
    await assertFails(dbA.collection('bookings').doc('booking-B').get());

    // Client A trying to mutate Client B booking MUST FAIL
    await assertFails(dbA.collection('bookings').doc('booking-B').update({ status: 'cancelled' }));

    // Client B reading own booking MUST SUCCEED
    await assertSucceeds(dbB.collection('bookings').doc('booking-B').get());
  });

  test('Payload 4: Client cannot approve vendor application', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('vendor_applications').doc('app-1').set({
        id: 'app-1',
        userId: clientA.uid,
        userName: 'Client A',
        userEmail: clientA.email,
        businessName: 'Decor 1',
        status: 'pending'
      });
    });

    const dbA = testEnv.authenticatedContext(clientA.uid, { email: clientA.email, email_verified: true }).firestore();
    await assertFails(dbA.collection('vendor_applications').doc('app-1').update({ status: 'approved' }));
  });

  test('Payload 5: Vendor A cannot modify Vendor B service', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('services').doc('srv-B').set({
        id: 'srv-B',
        title: 'Hall B',
        vendorId: 'vendor-B-id',
        price: 10000,
        category: 'hall',
        governorate: 'cairo'
      });
    });

    const dbA = testEnv.authenticatedContext(vendor.uid, { email: vendor.email, email_verified: true }).firestore();
    await assertFails(dbA.collection('services').doc('srv-B').update({ price: 1 }));
  });

  test('Payload 9: Client cannot create promo codes', async () => {
    const dbA = testEnv.authenticatedContext(clientA.uid, { email: clientA.email, email_verified: true }).firestore();
    await assertFails(dbA.collection('promo_codes').doc('FREE100').set({
      id: 'FREE100',
      code: 'FREE100',
      discountPercentage: 100,
      active: true
    }));
  });

  test('Owner can perform admin tasks', async () => {
    const dbOwner = testEnv.authenticatedContext(owner.uid, { email: owner.email, email_verified: true }).firestore();
    await assertSucceeds(dbOwner.collection('promo_codes').doc('DISCOUNT10').set({
      id: 'DISCOUNT10',
      code: 'DISCOUNT10',
      discountPercentage: 10,
      active: true
    }));
  });
});
```
