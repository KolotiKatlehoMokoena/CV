import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'
import sgMail from '@sendgrid/mail'

// Configure SendGrid
sgMail.setApiKey(functions.config().sendgrid.api_key)

initializeApp()
const db = getFirestore()

export const onContactCreate = functions.firestore
  .document('contacts/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const name = data?.name || 'Unknown'
    const email = data?.email || 'Unknown'
    const message = data?.message || ''
    const createdAt = data?.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()

    const msg = {
      to: 'katlehokmokoena@outlook.com',
      from: 'no-reply@cv-awesome.app',
      subject: `New contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nTime: ${createdAt}\n\nMessage:\n${message}`,
    }

    try {
      await sgMail.send(msg)
      await db.collection('contacts').doc(context.params.docId).set({ notified: true }, { merge: true })
      console.log('Notification email sent')
    } catch (err) {
      console.error('Failed to send email', err)
      await db.collection('contacts').doc(context.params.docId).set({ notifyError: String(err) }, { merge: true })
    }
  })
