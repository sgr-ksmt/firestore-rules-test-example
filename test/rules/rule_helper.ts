import * as firebase from '@firebase/rules-unit-testing'
import * as fs from 'fs'

export const makeTestProjectID = (prefix = 'test') => {
  const hrTime = process.hrtime()
  return `${prefix}${(hrTime[0] * 1000000 + hrTime[1] / 1000) * 1000}`
}

export const adminApp = (projectID: string) =>
  firebase.initializeAdminApp({
    projectId: projectID,
  })

type AuthContext = { [key in 'uid' | 'email']?: string }

export const app = (projectID: string, auth: AuthContext | undefined = undefined) =>
  firebase.initializeTestApp({
    projectId: projectID,
    auth: auth,
  })

export const loadRules = (projectID: string, fileName: string = 'firestore.rules') =>
  firebase.loadFirestoreRules({
    projectId: projectID,
    rules: fs.readFileSync(fileName, 'utf8'),
  })

export const clearFirestoreData = (projectID: string) =>
  firebase.clearFirestoreData({ projectId: projectID })

export const cleanup = () => Promise.all(firebase.apps().map(app => app.delete()))
