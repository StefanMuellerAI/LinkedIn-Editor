import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification
} from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        if (!user.emailVerified) {
          await signOut(auth);
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
        } else {
          try {
            const syncResponse = await fetch('http://localhost:5001/api/users/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: user.email,
                firebaseUid: user.uid
              })
            });

            if (syncResponse.ok) {
              const userData = await syncResponse.json();
              setUserRole(userData.role);
              setUser(user);
              setIsAuthenticated(true);
            } else {
              console.error('Failed to sync user');
            }
          } catch (error) {
            console.error('Error syncing user:', error);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    try {
      console.log('Starting signup process');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', result.user);
      
      await sendEmailVerification(result.user);
      
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: result.user.email,
          firebaseUid: result.user.uid,
          role: 'basis'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create user in database');
      }

      await signOut(auth);
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (!result.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in');
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    userRole,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 