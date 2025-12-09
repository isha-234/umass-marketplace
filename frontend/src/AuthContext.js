import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext({
  user: null,
  idToken: null,
  loading: true,
  isVerified: false,
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener for auth state: keeps UI in sync with Firebase sessions.
    const unsubUser = onAuthStateChanged(auth, async (firebaseUser) => {
      // If the Firebase session exists but email is unverified, log out to enforce campus-only access.
      if (firebaseUser && !firebaseUser.emailVerified) {
        await signOut(auth);
        setUser(null);
        setIdToken(null);
        setLoading(false);
        return;
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    // Listener for token changes: captures refreshes and email verification changes.
    const unsubToken = onIdTokenChanged(auth, async (firebaseUser) => {
      // Keep user in sync here too so we pick up emailVerified changes after reloads.
      if (firebaseUser && !firebaseUser.emailVerified) {
        await signOut(auth);
        setUser(null);
        setIdToken(null);
        return;
      }
      setUser(firebaseUser);
      const token =
        firebaseUser && firebaseUser.emailVerified
          ? await firebaseUser.getIdToken()
          : null;
      setIdToken(token);
    });

    return () => {
      unsubUser();
      unsubToken();
    };
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setIdToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      idToken,
      loading,
      isVerified: !!(user && user.emailVerified),
      logout,
    }),
    [user, idToken, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
