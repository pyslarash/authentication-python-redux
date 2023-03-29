import React, { useState, useEffect } from "react";
import { setToken } from "../store/userSlice";
import { useSelector } from "react-redux";

export const Private = () => {
  const token = useSelector(state => state.user.token);

  if (!token) {
    return <div>You are not allowed here</div>;
  }

  return <div>Your token is: {token}</div>;
};