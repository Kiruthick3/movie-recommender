import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Movie from "./pages/Movie";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen">
        <Nav />
        <div className="max-w-6xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<Movie />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
