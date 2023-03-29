import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setEmail, setToken } from "../store/userSlice";
import axios from "axios";

const Login = () => {
  const [email, setEmailState] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const BACKEND_URL = process.env.BACKEND_URL;
  console.log(BACKEND_URL)

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email) {
      console.error('Email is required');
      return;
    }
  
    try {
      // Call login API endpoint
      const response = await axios.post(`${BACKEND_URL}/login`, {
        email,
        password,
      }, { headers });
  
      // Dispatch login action with email and token
      console.log(response.data);
      dispatch(setToken(response.data.token));
      dispatch(setEmail(response.data.email));
  
      // Navigate to private page
      navigate("/private");
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="col-md-6">
        <h2 className="text-center mb-4">Login</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="email">
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmailState(e.target.value)}
              required
              className="mb-2"
            />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-3">
            Submit
          </Button>
        </Form>

        <div className="mt-3 text-center">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
