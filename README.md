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
- UploadThing for authenticated, quota-limited PAO image storage
- Local browser persistence for the no-configuration preview
- Plain CSS and self-hosted variable font assets; no UI framework
- Vitest for deterministic domain tests

The application is primarily client-side. A single Vercel Function verifies Firebase ID tokens and manages PAO images through UploadThing without exposing its server token.

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
5. Deploy the Firestore rules. They restrict each progress document to its authenticated owner.

```bash
npx firebase-tools deploy --only firestore --project YOUR_PROJECT_ID
```

The app uses these environment keys:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
UPLOADTHING_TOKEN
```

`UPLOADTHING_TOKEN` is server-only. Add it to Vercel as a secret for Production, Preview and Development; never prefix it with `VITE_` or expose it in client code. Signed-in image uploads are compressed below roughly 300 KB, rejected above 384 KB, limited to one current image per PAO number, and blocked once account usage reaches 75% of the provider quota or 1.5 GB—whichever comes first. With UploadThing's 2 GB free plan, this keeps at least 512 MB in reserve. Replacements delete the prior image before storing the new one.

Files on UploadThing's free plan are public through their generated URLs. Use reference art rather than sensitive personal photos.

Use `vercel dev` when testing signed-in uploads locally. Plain `npm run dev` still supports the local demo but does not run the image API function.

Firebase Hosting configuration and SPA rewrites are included in `firebase.json`. The application also works on any static host that rewrites unknown routes to `index.html`.

## Data model

Cloud progress is stored at `users/{uid}` as a single small document. Compressed PAO reference images are stored in UploadThing while their URLs and provider markers live with the corresponding PAO entries; externally linked images remain at their original URL. The user can export or import the complete expedition as JSON from **Field notes**. The dedicated PAO codex also supports its own portable JSON export.
