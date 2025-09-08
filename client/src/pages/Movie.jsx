import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMovie, fetchRecommendations, addToFavorites, removeFromFavorites, fetchFavorites, } from "../api";
import MovieCard from "../components/MovieCard";
import MovieRating from "../components/MovieRating";
import { AuthContext } from "../context/AuthContext";

export default function Movie() {
  const { id } = useParams();
  const { user, updateFavorites } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [recs, setRecs] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchMovie(id);
      setMovie(data);

      const recData = await fetchRecommendations(id);
      setRecs(recData.items || []);

      if (user) {
        try {
          const favRes = await fetchFavorites();
          updateFavorites(favRes); 
          const isFav = favRes.some((item) => item.tmdb_id === (data.tmdb_id || data.id));
          setAdded(isFav);
        } catch (err) {
          console.error("Failed to fetch favorites:", err);
        }
      }
    }
    load();
  }, [id, user]);

  async function handleAddFavorite() {
    if (!user) {
      alert("Please login first!");
      return;
    }

    try {
      if (added) {
        await removeFromFavorites(movie.tmdb_id || movie.id);
        setAdded(false);
      } else {
        await addToFavorites(movie.tmdb_id || movie.id);
        setAdded(true);
      }
      const favRes = await fetchFavorites();
      updateFavorites(favRes);
    } catch (err) {
      alert("Failed to update favorites.");
      console.error(err);
    }
  }

  if (!movie) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 space-y-8 sm:space-y-10">
      {/* Movie details */}
      <div className="flex flex-col md:flex-row gap-6">
        {movie.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            alt={movie.title}
            className="rounded-xl shadow-lg mx-auto md:mx-0 w-48 sm:w-60 md:w-72"
          />
        )}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">{movie.title}</h1>
          <p className="text-gray-600 text-justify mt-2 text-sm sm:text-base">{movie.overview}</p>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Release Date: {movie.release_date || "N/A"}
          </p>
          {movie.genres && (
            <p className="mt-1 text-xs sm:text-sm">
              Genres: {movie.genres.map((g) => g.name || g).join(", ")}
            </p>
          )}

          {/* Favorites button */}
          <button
            onClick={handleAddFavorite}
            className={`mt-3 px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition cursor-pointer ${
              added ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {added ? "Added ✓" : "Add to Favorites"}
          </button>
        </div>
      </div>

      {/* Cast */}
      {movie.credits?.cast && (
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center md:text-left">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movie.credits?.cast.slice(0, 12).map((actor) => (
              <div key={actor.id} className="bg-white rounded-xl shadow-md p-2 text-center">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                    alt={actor.name}
                    className="rounded-lg mx-auto mb-2 w-24 sm:w-28 md:w-32"
                  />
                ) : (
                  <div className="w-20 sm:w-24 h-28 sm:h-32 bg-gray-300 rounded-lg mx-auto mb-2" />
                )}
                <p className="font-semibold text-sm sm:text-sm">{actor.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ratings & Reviews */}
      <MovieRating tmdb_id={movie.tmdb_id || movie.id} />

      {/* Recommendations */}
      {recs.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center md:text-left">Recommended Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recs.map((rec) => (
              <Link key={rec.tmdb_id} to={`/movie/${rec.tmdb_id || rec.id}`}>
                <MovieCard movie={rec} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
