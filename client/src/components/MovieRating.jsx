import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { fetchRatings, submitRating } from "../api";

export default function MovieRating({ tmdb_id }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function loadReviews() {
      const data = await fetchRatings(tmdb_id);
      setReviews(data);
    }
    loadReviews();
  }, [tmdb_id, submitted]); 

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return;

    try {
      await submitRating({ tmdb_id, rating, review });
      setSubmitted(true);
      setRating(0);
      setReview("");
    } catch (err) {
      alert("Failed to submit rating. Please login first.");
    }
  }

  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((star) => (
            <FaStar
              key={star}
              size={24}
              className={`cursor-pointer transition ${
                star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            />
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review..."
          className="border p-2 rounded w-full mt-2"
        />

        <button
          type="submit"
          disabled={!rating}
          className="mt-2 px-4 py-2 bg-blue-500 cursor-pointer text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Submit
        </button>
      </form>

      {/* Reviews List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Reviews</h3>
        {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
        {reviews.map((r, idx) => (
          <div key={idx} className="mb-3 p-2 border rounded bg-white">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{r.username}</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <FaStar
                    key={star}
                    size={16}
                    className={star <= r.rating ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
            {r.review && <p className="text-sm mt-1 break-words whitespace-pre-wrap">{r.review}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
