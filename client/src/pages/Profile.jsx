import { useEffect, useState } from "react";
import { fetchUserProfile, fetchPersonalizedRecs } from "../api";
import MovieCard from "../components/MovieCard";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getData() {
      try {
        const u = await fetchUserProfile();
        setUser(u);
        const r = await fetchPersonalizedRecs();
        setRecs(r);
      } catch(err) {
        console.error(err);
        setError(err.message);
      }
    }
    getData();
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!user) return <p className="text-red-600">Please login to see your personalized recommendations.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>
      <div className="mb-6">
        <p>👤 {user.name}</p>
        <p>📧 {user.email}</p>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
      {recs.length === 0 ? (
        <p>No recommendations yet. Add some favorites to get personalized suggestions!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recs.map((m) => <MovieCard key={m.tmdb_id} movie={m} />)}
        </div>
      )}
    </div>
  );
}
