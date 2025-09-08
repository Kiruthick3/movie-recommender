import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await signup(form); 
      setMsg("Signup successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(true);
      setMsg(err.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button
          disabled={loading}
          className={`bg-green-600 cursor-pointer text-white w-full py-2 rounded hover:bg-green-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
      {msg && (
        <p className={`mt-3 ${error ? "text-red-600" : "text-green-600"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
