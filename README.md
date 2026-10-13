# josephwangemann.com

Joseph Wangemann's personal site.

Live site: [josephwangemann.com](https://josephwangemann.com/)

## Run locally

Requires Node.js and npm.

```sh
npm install
npm run dev
```

Built with React, TypeScript, Vite, and Tailwind CSS. Deployed through Cloudflare Pages.

## Snake leaderboard setup

1. In your Firebase project, register a web app and create a Cloud Firestore **Standard edition** database in production mode.
2. Enable **Authentication → Sign-in method → Anonymous**. No visitor sign-in screen is required.
3. The site's public Firebase web configuration is included in `src/lib/leaderboard.ts`, so local and Cloudflare Pages builds connect without extra setup. To use another project, copy `.env.example` to `.env.local` and fill in the web app's `apiKey`, `projectId`, and `authDomain`, or set the same `VITE_FIREBASE_*` overrides in Cloudflare Pages. Never use service-account credentials here.
4. Publish `firestore.rules` using the Firebase console's Firestore Rules editor. For an existing database, merge this collection's rules into your existing rules, and remove any broad rule that grants unrestricted writes to `snakeScores`. Alternatively, with the Firebase CLI installed, deploy this file using `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`.

The game loads the five highest scores after game over. Positive scores must beat fifth place to qualify when the board is full; ties do not displace an existing score. Each submitted run is a separate, immutable entry, so one player can hold all five spots. Retrying a submission uses the same run ID to avoid duplicate entries. Scores outside the top five remain stored, but only five are displayed. ASS, FCK, SHT, and SEX are rejected by both the form and Firestore rules.

Leaderboard failures do not prevent restarting or hiding Snake. Firebase loads only when the leaderboard is opened. The personal high score remains separate and is saved in localStorage across visits in the same browser; clearing site data resets it. Development color previews do not save personal scores. Client-submitted scores are suitable for casual competition; these rules validate submissions and ownership, but do not verify gameplay or prevent someone creating multiple anonymous identities.
