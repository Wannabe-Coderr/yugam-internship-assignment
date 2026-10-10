# Internship Registration & Validation App

A mobile-friendly registration and profile-validation application built with React, TypeScript, Vite, Firebase Authentication, and Cloud Firestore. The app supports account creation, secure profile submission, protected routes, and logout behavior.

## Features

- Registration with Name, Email, and Password
- Firebase Authentication account creation with display-name update
- Protected profile page for authenticated users only
- Prefilled registration data for the validation flow
- Five-field validation with inline, field-specific errors
- Firestore profile persistence keyed by Firebase UID
- Logout flow and protected-route enforcement
- Responsive layout for mobile, tablet, and desktop
- Automated validation tests via Vitest

## Technology Stack

- React 19
- TypeScript
- Vite
- React Router
- Firebase Authentication
- Cloud Firestore
- Lucide React
- Vitest + Testing Library

## Prerequisites

- Node.js 22 or newer recommended
- A Firebase project with Authentication and Firestore enabled
- A browser for local testing

## Local Installation

```bash
npm install
cp .env.example .env
npm run dev
```

## Firebase Setup

1. Create a Firebase project in the Firebase console.
2. Enable Authentication and select the Email/Password provider.
3. Create a Firestore database in production or test mode.
4. Add a web app to the project and copy the configuration values.
5. Add the values to your local `.env` file using the variables below.

## Environment Variables

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Firestore Security Rules

The application stores profile documents at `profiles/{authenticated-user-uid}`.
Publish the rules from the included `firestore.rules` file in the Firebase
Console by opening the `yugam-project` project, selecting **Firestore Database
> Rules**, replacing the editor contents with `firestore.rules`, and clicking
**Publish**. Confirm the project selector shows `yugam-project` before
publishing.

Alternatively, when the Firebase CLI is configured for this project, deploy with:

```bash
firebase deploy --only firestore:rules
```

The rules enforce:

- authenticated access only
- profile access restricted to the current authenticated user
- no password field in profile documents
- required profile field types and structure

## Development Commands

```bash
npm run dev
npm run test
npm run build
npm run lint
```

## Production Build

```bash
npm run build
```

## Deployment

1. Run `npm run build`.
2. Deploy the generated `dist/` folder to your preferred host.
3. Ensure Firebase environment variables are available in the deployment environment.
4. Keep Firestore rules deployed before exposing the app.

## Application Limitations and Design Decisions

- Username uniqueness is not guaranteed in this client-only implementation unless a backend reservation strategy is added.
- Firebase credentials are configured in the environment and are not hardcoded.
- Password data is kept only in transient app memory during the immediate registration flow and is never written to Firestore.
- Real Firebase behavior depends on proper project configuration and rules deployment.

## Screenshots

No screenshots were captured during this session. Add screenshots to this section after running the app locally.

## Demo Walkthrough

1. Open the registration page.
2. Create a new user with a valid name, email, and password.
3. Confirm the redirect to the profile form.
4. Fill in the remaining required fields.
5. Click Validate to save the profile to Firestore.
6. Sign out and confirm the app returns to registration.
