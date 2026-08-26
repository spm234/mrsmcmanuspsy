// Fill this in with your own Firebase project's config to turn on cross-device
// sync. Until you do, the app works exactly as it does today — everything
// stays on this device only, nothing changes.
export const firebaseConfig = {
  apiKey: "AIzaSyAwHSHdkIVP7lOOB5np8W6wMIh37cqXMTU",
  authDomain: "caseloads-410c6.firebaseapp.com",
  projectId: "caseloads-410c6",
  storageBucket: "caseloads-410c6.firebasestorage.app",
  messagingSenderId: "179907093778",
  appId: "1:179907093778:web:44d779dff617a5d618bfcb",
};

// True once the placeholder values above have actually been replaced.
export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.apiKey) && !firebaseConfig.apiKey.startsWith("YOUR_");
