import { useState, useEffect, useContext } from "react";
import { addToFavorites as apiAddToFavorites, removeFromFavorites as apiRemoveFromFavorites } from "../api";
import { AuthContext } from "../context/AuthContext";

export default function MovieCard({ movie }) {
  const { user, favorites, updateFavorites } = useContext(AuthContext);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function checkFavorite() {
      if (!user) return;
      try {
        const isFav = favorites.some(
          (item) => item.tmdb_id === (movie.tmdb_id || movie.id)
        );
        setAdded(isFav);
      } catch (err) {
        console.error("Failed to check favorites", err);
      }
    }
    checkFavorite();
  }, [movie, favorites, user]);

  async function handleAddFavorite() {
    if (!user) {
      alert("Please login first!");
      return;
    }
    try {
      const res = added
        ? await apiRemoveFromFavorites(movie.tmdb_id || movie.id)
        : await apiAddToFavorites(movie.tmdb_id || movie.id);

      setAdded(!added);
      
      await updateFavorites(res.items);

    } catch (err) {
      alert("Failed to update favorites.");
      console.error(err);
    }
  }


  return (
    <div className="bg-white rounded-2xl shadow-md p-3 hover:scale-105 transition transform w-full sm:w-54 md:w-50 lg:w-64 mx-auto">
      <img
        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
        alt={movie.title}
        className="rounded-lg mb-2 w-full h-auto object-cover"
      />
      <h3 className="font-bold text-base sm:text-lg md:text-xl truncate">{movie.title}</h3>
      <p className="text-gray-600 text-xs sm:text-sm md:text-base truncate">{movie.genres?.join(", ")}</p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleAddFavorite();
        }}
        className={`mt-2 w-full sm:w-auto px-3 py-1 rounded-lg text-sm sm:text-base font-semibold cursor-pointer ${
          added ? "bg-green-500 text-white hover:bg-green-600" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {added ? "Added ✓" : "Add to Favorites"}
      </button>
    </div>
  );
}
