import { useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

export function useFirebaseTest() {
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'system', 'connection_test'));
      } catch (error: any) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration: ", error);
        } else {
          // Expected to fail with missing permissions, meaning connection is successfully established.
          console.log("Firebase connection established.");
        }
      }
    }
    testConnection();
  }, []);
}
