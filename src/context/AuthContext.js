import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

const buildAvatar = (name = 'Bruker') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.displayName || 'Bruker',
              role: userData.role || 'staff',
              phone: userData.phone || '',
              avatar: buildAvatar(userData.name || firebaseUser.displayName),
            });
          } else {
            const newUserData = {
              name: firebaseUser.displayName || 'Bruker',
              email: firebaseUser.email,
              role: 'staff',
              phone: '',
              createdAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);

            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: newUserData.name,
              role: newUserData.role,
              phone: newUserData.phone,
              avatar: buildAvatar(newUserData.name),
            });
          }
        } catch (error) {
          console.error('Feil ved henting av brukerdata:', error);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Bruker',
            role: 'staff',
            avatar: buildAvatar(firebaseUser.displayName),
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Feil ved innlogging:', error.code, error.message);

      let errorMessage = 'Feil ved innlogging. Prøv igjen.';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Bruker ikke funnet';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Feil passord';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Feil e-post eller passord';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ugyldig e-postadresse';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'For mange forsøk. Prøv igjen senere.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Nettverksfeil. Sjekk internettforbindelsen.';
          break;
      }

      return { success: false, error: errorMessage };
    }
  };

  const loginWithProvider = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error) {
      console.error('Feil ved provider-innlogging:', error);
      let message = 'Kunne ikke logge inn. Prøv igjen.';
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Innlogging avbrutt.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Nettverksfeil. Sjekk tilkoblingen og prøv igjen.';
      }
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return loginWithProvider(provider);
  };

  const loginWithMicrosoft = () => {
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ prompt: 'select_account' });
    return loginWithProvider(provider);
  };

  const register = async (email, password, name) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, { displayName: name });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        role: 'staff',
        phone: '',
        createdAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Feil ved registrering:', error);

      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('E-postadressen er allerede i bruk');
        case 'auth/invalid-email':
          throw new Error('Ugyldig e-postadresse');
        case 'auth/weak-password':
          throw new Error('Passordet er for svakt (minst 6 tegn)');
        default:
          throw new Error('Feil ved registrering. Prøv igjen.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Feil ved utlogging:', error);
    }
  };

  const updateUserData = async (updates) => {
    try {
      if (!user?.id) throw new Error('Ingen bruker innlogget');

      await setDoc(doc(db, 'users', user.id), updates, { merge: true });

      const updatedUser = { ...user, ...updates };
      if (updates.name) {
        updatedUser.avatar = buildAvatar(updates.name);
      }

      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Feil ved oppdatering av bruker:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    loginWithMicrosoft,
    logout,
    register,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth må brukes innenfor AuthProvider');
  }
  return context;
}
