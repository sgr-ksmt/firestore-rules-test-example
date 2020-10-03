import { assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import 'jest'
import * as helper from './rule_helper'
import { firestore } from '@firebase/rules-unit-testing'
import { firestore as adminFirestore } from 'firebase-admin'

describe('articles', () => {
  let projectID: string
  beforeEach(async () => {
    projectID = helper.makeTestProjectID()
    await helper.loadRules(projectID)
  })

  describe('`get` operation', () => {
    describe('user is not authenticated', () => {
      let ref: firestore.DocumentReference
      beforeEach(async () => {
        const adminDB = helper.adminApp(projectID).firestore()
        ref = adminDB.collection('articles').doc()
        await ref.set({
          title: 'foo',
          body: 'foobarbaz',
          categoryName: 'tech',
          authorID: 'xxx',
          publishedAt: adminFirestore.FieldValue.serverTimestamp(),
          createdAt: adminFirestore.FieldValue.serverTimestamp(),
        })
      })

      test('should be failed', async () => {
        const db = helper.app(projectID).firestore()
        await assertFails(db.doc(ref.path).get())
      })
    })

    describe('user is authenticated', () => {
      describe('try to get valid data', () => {
        let ref: firestore.DocumentReference
        beforeEach(async () => {
          const adminDB = helper.adminApp(projectID).firestore()
          ref = adminDB.collection('articles').doc()
          await ref.set({
            title: 'foo',
            body: 'foobarbaz',
            categoryName: 'tech',
            authorID: 'xxx',
            publishedAt: adminFirestore.FieldValue.serverTimestamp(),
            createdAt: adminFirestore.FieldValue.serverTimestamp(),
          })
        })

        test('should be succeeded', async () => {
          const db = helper.app(projectID, { uid: 'bob' }).firestore()
          await assertSucceeds(db.doc(ref.path).get())
        })
      })

      describe('try to get invalid data whose `publishedAt` is a future timestamp', () => {
        let ref: firestore.DocumentReference
        beforeEach(async () => {
          const adminDB = helper.adminApp(projectID).firestore()
          ref = adminDB.collection('articles').doc()
          const futureDate = (() => {
            const date = new Date()
            date.setDate(date.getDate() + 1)
            return date
          })()
          await ref.set({
            title: 'foo',
            body: 'foobarbaz',
            categoryName: 'tech',
            authorID: 'xxx',
            publishedAt: adminFirestore.Timestamp.fromDate(futureDate),
            createdAt: adminFirestore.FieldValue.serverTimestamp(),
          })
        })

        test('should be failed', async () => {
          const db = helper.app(projectID, { uid: 'bob' }).firestore()
          await assertFails(db.doc(ref.path).get())
        })
      })
    })
  })

  describe('`create` operation', () => {
    describe('user is not authenticated', () => {
      test('operation should be failed', async () => {
        const db = helper.app(projectID).firestore()
        const ref = db.collection('articles').doc()
        await assertFails(ref.set({
          title: 'foo',
          body: 'foobarbaz',
          categoryName: 'tech',
          authorID: 'xxx',
          publishedAt: firestore.FieldValue.serverTimestamp(),
          createdAt: firestore.FieldValue.serverTimestamp(),
        }))
      })
    })

    describe('user is authenticated', () => {
      let db: firestore.Firestore
      const uid = 'bob'
      beforeEach(async () => {
        db = helper.app(projectID, { uid }).firestore()
        await db.collection('users').doc(uid).set({ isActive: true })
      })

      describe('try to write valid data', () => {
        test('operation should be succeeded', async () => {
          const ref = db.collection('articles').doc()
          await assertSucceeds(ref.set({
            title: 'foo',
            body: 'foobarbaz',
            authorID: uid,
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))
        })
      })

      describe('try to write invalid data that does not have all necessary fields', () => {
        test('operation should be failed', async () => {
          const ref = db.collection('articles').doc()

          await assertFails(ref.set({
            body: 'foobarbaz',
            authorID: uid,
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))

          await assertFails(ref.set({
            title: 'foo',
            authorID: uid,
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))

          await assertFails(ref.set({
            title: 'foo',
            body: 'foobarbaz',
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))

          await assertFails(ref.set({
            title: 'foo',
            body: 'foobarbaz',
            authorID: uid,
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))

          await assertFails(ref.set({
            title: 'foo',
            body: 'foobarbaz',
            authorID: uid,
            categoryName: 'tech',
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))

          await assertFails(ref.set({
            title: 'foo',
            body: 'foobarbaz',
            authorID: uid,
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
          }))
        })
      })

      describe('try to write invalid data that has unneeded field', () => {
        test('operation should be failed', async () => {
          const ref = db.collection('articles').doc()

          await assertFails(ref.set({
            foobar: 'unneeded data',
            title: 'foo',
            body: 'foobarbaz',
            authorID: uid,
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))
        })
      })

      describe('try to write invalid data that has invalid title', () => {
        test('operation should be failed', async () => {
          const ref = db.collection('articles').doc()

          await assertFails(ref.set({
            title: '',
            body: 'foobarbaz',
            authorID: uid,
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))

          await assertFails(ref.set({
            title: null,
            body: 'foobarbaz',
            authorID: uid,
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))


          await assertFails(ref.set({
            title: 'x'.repeat(51),
            body: 'foobarbaz',
            authorID: uid,
            categoryName: 'tech',
            publishedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          }))
        })
      })
    })
  })

  afterAll(async () => await helper.cleanup())
})
