import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(false);
    try {
      await login(form); 
      setMsg("Logged in successfully!");
      navigate("/"); 
    } catch (err) {
      setError(true);
      setMsg(err.message || "Login failed. Try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <button className="bg-blue-600 cursor-pointer text-white w-full py-2 rounded hover:bg-blue-700">
          Login
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
