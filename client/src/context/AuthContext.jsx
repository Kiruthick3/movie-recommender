import { createContext, useState, useEffect } from "react";
import { fetchUserProfile, fetchFavorites, fetchPersonalizedRecs, loginUser, signupUser } from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [favorites, setFavorites] = useState([]);
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user info if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await fetchUserProfile();
        setUser(profile);

        const favs = await fetchFavorites();
        setFavorites(favs);

        const recs = await fetchPersonalizedRecs();
        setPersonalizedRecs(recs);
      } catch (err) {
        console.error("Failed to load user info:", err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  // Login function
  async function login(form) {
    const res = await loginUser(form);
    if (res.token) {
      localStorage.setItem("token", res.token);
      setToken(res.token);

      const profile = await fetchUserProfile();
      setUser(profile);

      const favs = await fetchFavorites();
      setFavorites(favs);

      const recs = await fetchPersonalizedRecs();
      setPersonalizedRecs(recs);

      return true;
    } else {
      throw new Error(res.message || "Login failed");
    }
  }

  // Signup function
  async function signup(form) {
    const res = await signupUser(form);
    if (res.token) {
      localStorage.setItem("token", res.token);
      setToken(res.token);

      const profile = await fetchUserProfile();
      setUser(profile);

      const favs = await fetchFavorites();
      setFavorites(favs);

      const recs = await fetchPersonalizedRecs();
      setPersonalizedRecs(recs);

      return true;
    } else {
      throw new Error(res.message || "Signup failed");
    }
  }

  // Logout function
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setFavorites([]);
    setPersonalizedRecs([]);
  }

  // Update favorites and refresh personalized recommendations
  function updateFavorites(newFavorites) {
    setFavorites(newFavorites);
    fetchPersonalizedRecs()
      .then(setPersonalizedRecs)
      .catch(err => console.error("Failed to refresh personalized recs:", err));
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      favorites,
      personalizedRecs,
      loading,
      login,
      signup,
      logout,
      updateFavorites
    }}>
      {children}
    </AuthContext.Provider>
  );
}
