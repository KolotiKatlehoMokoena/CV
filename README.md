# CV Website (React + Vite)

This project is an interactive CV built with React + Vite, storing contact submissions in Firebase Firestore and (optionally) sending email notifications via Firebase Cloud Functions + SendGrid.

## Frontend setup
- Install deps: `npm install`
- Run dev: `npm run dev`
- Environment: create `.env` with your Firebase config:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## Email notifications (Firebase Functions + SendGrid)
The frontend saves contacts to Firestore (`contacts` collection). A Cloud Function triggers on create and emails you.

### Prereqs
- Firebase project (`cv-awesome`) with Firestore enabled
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- SendGrid account and API key

### Deploy steps
```powershell
firebase login
firebase use cv-awesome
cd functions
npm install
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"
firebase deploy --only functions
```

After deployment, new Firestore docs in `contacts` will trigger an email to `katlehokmokoena@outlook.com`.
