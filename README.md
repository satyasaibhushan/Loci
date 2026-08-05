# Loci

Loci is a lightweight mnemonic training game. It teaches a shared Major System and personal PAO codebook, then branches into two measurable expeditions: recalling 100 digits of π and reconstructing a shuffled deck of cards.

## Product structure

1. Learn the Major System sound families.
2. Drill sounds, digits and two-digit pairs.
3. Author a personal `00–99` Person–Action–Object codex.
4. Drill the codex in both directions.
5. Choose the π or deck expedition.

The user owns all imagery, narratives and memory palaces. Loci stores definitions, presents deliberate practice, times attempts and verifies results.

## Stack

- Vite, React and TypeScript
- Firebase modular SDK for Google Authentication and Firestore
- Local browser persistence for the no-configuration preview
- Plain CSS and self-hosted variable font assets; no UI framework
- Vitest for deterministic domain tests

There is no custom backend. Firebase is loaded through its tree-shakeable modular API, and route content is entirely client-side.

## Development

```bash
npm install
npm run dev
```

The development build offers **Preview this expedition locally**. Progress is stored under a local demo profile.

Verification:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Google sign-in and cloud progress

1. Create a Firebase web project.
2. Enable Google under **Authentication → Sign-in method**.
3. Create a Firestore database.
4. Copy `.env.example` to `.env.local` and fill in the Firebase web configuration.
5. Deploy `firestore.rules`. It restricts each progress document to its authenticated owner.

The app uses these environment keys:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Firebase Hosting configuration and SPA rewrites are included in `firebase.json`. The application also works on any static host that rewrites unknown routes to `index.html`.

## Data model

Cloud progress is stored at `users/{uid}` as a single small document. The user can export or import the complete expedition as JSON from **Field notes**. The dedicated PAO codex also supports its own portable JSON export.
