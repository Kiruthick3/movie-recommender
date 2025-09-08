const API_URL = import.meta.env.VITE_API_URL;

// -------------------- Movies --------------------
export async function fetchMovies() {
  const res = await fetch(`${API_URL}/movies`);
  return res.json();
}

export async function searchMovies(query, page = 1) {
  const res = await fetch(
    `${API_URL}/movies/search?q=${encodeURIComponent(query)}&page=${page}`
  );
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }
  const data = await res.json();
  return data.items || [];
}


export async function fetchMovie(id) {
  const res = await fetch(`${API_URL}/movies/${id}`);
  return res.json();
}

export async function fetchRecommendations(movieId) {
  const res = await fetch(`${API_URL}/movies/${movieId}/recommendations`);
  return res.json();
}

// -------------------- User --------------------
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found. Please login.");
  return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function fetchUserProfile() {
  try {
    const res = await fetch(`${API_URL}/user/profile`, { method: "GET", headers: getAuthHeaders() });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Profile fetch failed: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error("fetchUserProfile error:", err);
    throw err;
  }
}

export async function fetchPersonalizedRecs() {
  try {
    const res = await fetch(`${API_URL}/user/recs`, { method: "GET", headers: getAuthHeaders() });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Personalized recs fetch failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("fetchPersonalizedRecs error:", err);
    return [];
  }
}

// -------------------- Favorites --------------------
export async function addToFavorites(tmdb_id) {
  try {
    const res = await fetch(`${API_URL}/user/favorites`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ tmdb_id }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Add to favorites failed: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error("addToFavorites error:", err);
    throw err;
  }
}

export async function removeFromFavorites(tmdb_id) {
  try {
    const res = await fetch(`${API_URL}/user/favorites/${tmdb_id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error("Failed to remove from favorites");
    }

    return await res.json();
  } catch (err) {
    console.error("Error in removeFromFavorites:", err);
    throw err; 
  }
}

export async function fetchFavorites() {
  try {
    const res = await fetch(`${API_URL}/user/favorites`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Fetch favorites failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("fetchFavorites error:", err);
    return [];
  }
}

// -------------------- Ratings --------------------
export async function submitRating({ tmdb_id, rating, review }) {
  try {
    const res = await fetch(`${API_URL}/user/ratings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ tmdb_id, rating, review }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Submit rating failed: ${res.status} ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("submitRating error:", err);
    throw err;
  }
}

export async function fetchRatings(tmdb_id) {
  try {
    const res = await fetch(`${API_URL}/user/ratings/${tmdb_id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch ratings");
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("fetchRatings error:", err);
    return [];
  }
}

// -------------------- Auth --------------------
export async function loginUser(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function signupUser(data) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
}
