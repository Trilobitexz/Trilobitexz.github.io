import { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where, updateDoc, deleteDoc } from 'firebase/firestore';

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      
      if (u) {
        // Ensure user profile exists
        const userRef = doc(db, 'users', u.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
             await setDoc(userRef, { email: u.email });
          }
        } catch (err) {
          console.error("Firebase Auth Profile Error:", err);
        }
      }
    });
    return unsub;
  }, []);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return { user, authLoading, login, logout };
}

export function useCloudWatchlist(user: User | null, initialTW: string[], initialUS: string[]) {
  const [cloudTW, setCloudTW] = useState<string[]>(initialTW);
  const [cloudUS, setCloudUS] = useState<string[]>(initialUS);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!user) {
      setCloudTW(initialTW);
      setCloudUS(initialUS);
      return;
    }
    
    const ref = doc(db, 'watchlists', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
           if (data.symbolsTW && Array.isArray(data.symbolsTW)) setCloudTW(data.symbolsTW);
           else if (data.symbols && Array.isArray(data.symbols)) setCloudTW(data.symbols); // fallback for schema migration
           if (data.symbolsUS && Array.isArray(data.symbolsUS)) setCloudUS(data.symbolsUS);
        }
      } else {
        setDoc(ref, { 
          userId: user.uid, 
          symbolsTW: initialTW,
          symbolsUS: initialUS,
          symbols: initialTW,
          updatedAt: serverTimestamp() 
        }).catch(err => console.error("Initial watchlist creation failed", err));
      }
    }, (error) => {
      console.error(JSON.stringify({ error: error.message, operationType: "get", path: "watchlists", authInfo: { userId: user.uid }}));
    });

    return unsub;
  }, [user]);

  const updateCloudWatchlist = async (tw: string[], us: string[]) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const ref = doc(db, 'watchlists', user.uid);
      await setDoc(ref, {
        userId: user.uid,
        symbolsTW: tw,
        symbolsUS: us,
        symbols: tw, // maintain schema compatibility
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error: any) {
      console.error(JSON.stringify({ error: error.message, operationType: "update", path: "watchlists", authInfo: { userId: user.uid }}));
    } finally {
      setIsSyncing(false);
    }
  };

  return { cloudTW, cloudUS, updateCloudWatchlist, isSyncing };
}

export function usePriceAlerts(user: User | null) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  
  useEffect(() => {
    if (!user) {
      setAlerts([]);
      return;
    }
    
    const alertsRef = collection(db, 'priceAlerts');
    const q = query(alertsRef, where('userId', '==', user.uid));
    
    const unsub = onSnapshot(q, (snap) => {
      const loadedAlerts: PriceAlert[] = [];
      snap.forEach(docSnap => {
        loadedAlerts.push({ id: docSnap.id, ...docSnap.data() } as PriceAlert);
      });
      setAlerts(loadedAlerts);
    }, (error) => {
      console.error(JSON.stringify({ error: error.message, operationType: "list", path: "priceAlerts", authInfo: { userId: user.uid }}));
    });
    
    return unsub;
  }, [user]);

  const addAlert = async (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    if (!user) return;
    const newDocRef = doc(collection(db, 'priceAlerts'));
    try {
      await setDoc(newDocRef, {
        userId: user.uid,
        symbol,
        targetPrice,
        condition,
        isActive: true,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message, operationType: "create", path: "priceAlerts", authInfo: { userId: user.uid }}));
    }
  };

  const setAlertActive = async (alertId: string, isActive: boolean) => {
    if (!user) return;
    const alertRef = doc(db, 'priceAlerts', alertId);
    try {
      await updateDoc(alertRef, { isActive });
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message, operationType: "update", path: `priceAlerts/${alertId}`, authInfo: { userId: user.uid }}));
    }
  };
  
  const deleteAlert = async (alertId: string) => {
    if (!user) return;
    const alertRef = doc(db, 'priceAlerts', alertId);
    try {
      await deleteDoc(alertRef);
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message, operationType: "delete", path: `priceAlerts/${alertId}`, authInfo: { userId: user.uid }}));
    }
  };

  return { alerts, addAlert, setAlertActive, deleteAlert };
}
