let rawConfig: any = {};
try {
  rawConfig = (await import('../../firebase-applet-config.json')).default;
} catch (e) {
  rawConfig = {};
}

export const firebaseConfig = {
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) ||
    rawConfig.projectId ||
    'gen-lang-client-0648418690',
  appId:
    (import.meta.env.VITE_FIREBASE_APP_ID as string) ||
    rawConfig.appId ||
    '1:1066572318214:web:c3fe22e505a7c76b27e587',
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY as string) ||
    rawConfig.apiKey ||
    'AIzaSyCsxCGds6xfjugeChTYk3vQLSMsIcV28KM',
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) ||
    rawConfig.authDomain ||
    'gen-lang-client-0648418690.firebaseapp.com',
  firestoreDatabaseId:
    (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) ||
    rawConfig.firestoreDatabaseId ||
    'ai-studio-communevoterregi-d8da2e15-db24-470c-8af3-702f703dc25d',
  storageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) ||
    rawConfig.storageBucket ||
    'gen-lang-client-0648418690.firebasestorage.app',
  messagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) ||
    rawConfig.messagingSenderId ||
    '1066572318214',
  measurementId:
    (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) ||
    rawConfig.measurementId ||
    '',
  oAuthClientId:
    (import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string) ||
    rawConfig.oAuthClientId ||
    '1066572318214-4ic3aip7p1ivahfpdlgp6b8j53030b5f.apps.googleusercontent.com',
};

export default firebaseConfig;
