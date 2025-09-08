import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function Nav() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
    setIsOpen(false); 
  }

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">🎬 Movie Recommender</h1>

        <button
          className="sm:hidden text-white text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>

        {/* Desktop menu */}
        <div className="hidden sm:flex space-x-4">
          <Link to="/" className="hover:text-yellow-400">Home</Link>
          {user ? (
            <>
              <Link to="/profile" className="hover:text-yellow-400">Profile</Link>
              <button onClick={handleLogout} className="hover:text-yellow-400 font-semibold  cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-yellow-400">Login</Link>
              <Link to="/signup" className="hover:text-yellow-400">Signup</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div  className={`sm:hidden mt-2 flex flex-col space-y-2 text-center overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}>
          <Link to="/" className="hover:text-yellow-400" onClick={() => setIsOpen(false)}>Home</Link>
          {user ? (
            <>
              <Link to="/profile" className="hover:text-yellow-400" onClick={() => setIsOpen(false)}>Profile</Link>
              <button
                onClick={handleLogout}
                className="hover:text-yellow-400 font-semibold cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-yellow-400" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/signup" className="hover:text-yellow-400" onClick={() => setIsOpen(false)}>Signup</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
