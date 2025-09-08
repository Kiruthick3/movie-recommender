import { useEffect, useState } from "react";
import { searchMovies } from "../api";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // default movies on page load
  useEffect(() => {
    searchMovies("Avengers").then(setMovies).catch(console.error);
  }, []);

  // auto-search while typing (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await searchMovies(query);
        setSuggestions(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500); // wait 500ms after typing

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const results = await searchMovies(query);
    setMovies(results);
    setSuggestions([]); 
  };

  return (
    <div className="p-4 sm:p-6 relative">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Search Movies</h1>

      {/* search bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a movie name..."
          className="flex-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto hover:bg-blue-700 transition cursor-pointer"
        >
          Search
        </button>

        {/* dropdown suggestions */}
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white/40 shadow-lg border rounded-lg mt-1 max-h-60 overflow-y-auto z-10 backdrop-blur-sm">
            {suggestions.map((s) => (
              <li key={s.tmdb_id || s.id} className="p-2 hover:bg-gray-100">
                <Link
                  to={`/movie/${s.tmdb_id || s.id}`}
                  onClick={() => setSuggestions([])}
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {loading && (
          <div className="absolute top-full left-0 mt-1 p-2 text-gray-500">
            Searching...
          </div>
        )}
      </form>

      {/* results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((m) => (
          <Link key={m.tmdb_id || m.id} to={`/movie/${m.tmdb_id || m.id}`}>
            <MovieCard movie={m} />
          </Link>
        ))}
      </div>
    </div>
  );
}
