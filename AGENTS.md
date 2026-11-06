# Architecture rules
- Native Android packages use TanStack Start's SPA shell and a build-time public catalog snapshot, never `server.url`; the website keeps SSR.
- Native packaging stages downloaded catalog images under node_modules/.cache/native-media (outside dist, which Vite empties) and copies them into dist/client/native-cache; CI verifies packaged routes with internet blocked before creating the APK.
- Native server functions retain TanStack RPC serialization and bearer middleware, using Capacitor HTTP to the fixed hosted origin; AI credentials stay server-side.
- Offline catalog and user-scoped chat history use IndexedDB; native catalog images and fonts are packaged locally so first launch does not need the network.
- Uploaded chat images use validated typed image parts and are not persisted with conversation history, avoiding large private image copies.