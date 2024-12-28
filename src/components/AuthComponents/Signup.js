import React, { useState, useContext } from "react"; // Add useContext import here
import axios from "axios";
import iziToast from "izitoast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Make sure your context path is correct

import "./Signup.css";
import 'izitoast/dist/css/iziToast.min.css';

const Signup = () => {
  const { setLoggedInUser, setIsAuthenticated } = useContext(AuthContext);  // Now useContext will work

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",  // Added confirm password
  });

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {

      iziToast.error({
        title: "Error",
        message: "Passwords do not match!",
        position: "topRight",
      });
      return;
    }

    try {
      const baseURL = process.env.REACT_APP_BASE_URL;

      const res = await axios.post(baseURL + "/auth/signup", formData);

      iziToast.success({
        title: "Success",
        message: "Signup successful!",
        position: "topRight",
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedInUser", JSON.stringify(res.data.user));

      setLoggedInUser(res.data.user);
      setIsAuthenticated(true);
      navigate("/chatRoom");

    } catch (error) {
      iziToast.error({
        title: "Error",
        message: error.response.data.message,
        position: "topRight",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">Sign up for a new account</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="login-input"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="login-input"
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="login-input"
          />


          <button type="submit" className="login-button">
            Signup
          </button>
        </form>
        <p className="login-footer">
          Already have an account? <a href="/">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
