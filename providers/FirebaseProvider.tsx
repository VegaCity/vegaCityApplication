// components/FirebaseProvider.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getStorage, FirebaseStorage } from "firebase/storage";

interface FirebaseContextType {
  app: FirebaseApp | null;
  analytics: Analytics | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      };

      let app: FirebaseApp;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      setFirebaseApp(app);

      if (typeof window !== "undefined") {
        const analyticsInstance = getAnalytics(app);
        setAnalytics(analyticsInstance);
      }

      const storageInstance = getStorage(app);
      setStorage(storageInstance);
    };

    initializeFirebase();
  }, []);

  if (!firebaseApp || !storage) {
    return <div>Loading Firebase...</div>;
  }

  return (
    <FirebaseContext.Provider value={{ app: firebaseApp, analytics, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
};
