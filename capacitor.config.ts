// Capacitor config for the native Android build (see .github/workflows/build-apk.yml).
// The app is server-rendered, so the native shell loads the live published site.
const config = {
  appId: "com.salmanfares.app",
  appName: "موقع سلمان فارس",
  webDir: "dist/client",
  server: {
    url: "https://salmanfares.lovable.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
