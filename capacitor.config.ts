// Native builds package the TanStack SPA and public catalog; never load the live site as the app shell.
const config = {
  appId: "com.salmanfares.app",
  appName: "موقع سلمان فارس",
  webDir: "dist/client",
  server: {
    cleartext: false,
  },
  plugins: {
    CapacitorHttp: { enabled: true },
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
