import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'customers', user.uid, 'subscriptions'),
      where('status', 'in', ['trialing', 'active', 'past_due', 'canceled'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      const doc = snapshot.docs[0];
      setSubscription({
        id: doc.id,
        ...doc.data()
      });
      setLoading(false);
    }, (error) => {
      console.error('Error fetching subscription:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { subscription, loading };
} 