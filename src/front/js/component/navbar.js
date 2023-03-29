import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setToken } from "../store/userSlice";
import axios from "axios";

export const Navbar = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  const handleLogout = async () => {
    try {
      const BACKEND_URL = process.env.BACKEND_URL;
      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      };

      // Call logout API endpoint
      await axios.post(`${BACKEND_URL}/logout`, {}, { headers });

      // Dispatch logout action and clear user data from store
      dispatch(setToken(null));
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link to="/">
          <span className="navbar-brand mb-0 h1">React Boilerplate</span>
        </Link>
        <div className="ml-auto">
          {token ? (
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login">
              <button className="btn btn-primary">Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
