import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setPassword, setEmail, setToken, setIs_active } from "../store/userSlice"
import axios from "axios";

export const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = useSelector(state => state.user.email);
  const password = useSelector(state => state.user.password);

  const BACKEND_URL = process.env.BACKEND_URL;
  console.log(BACKEND_URL)

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
  console.log("email: ", email);
  console.log("password: ", password);
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email) {
      console.error('Email is required');
      return;
    }
  
    try {
      // Call signup API endpoint
      const response = await axios.post(`${BACKEND_URL}/signup`, {
        email,
        password,
      }, { headers });
  
      // Dispatch login action with email and token
      console.log(response.data);
      dispatch(setToken(response.data.token));
      dispatch(setIs_active(response.data.is_active));
  
      // Navigate to private page
      navigate("/private");
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="col-md-6">
        <h2 className="text-center mb-4">Sign up</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="email">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => dispatch(setEmail(e.target.value))}
              required
              className="mb-2"
            />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => dispatch(setPassword(e.target.value))}
              required
              className="mb-2"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-3">
            Sign up
          </Button>
        </Form>

        <div className="mt-3 text-center">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};
