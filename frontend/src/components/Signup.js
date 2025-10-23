import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Education-related image placeholder
const signupBg =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const response = await axios.post(`${apiUrl}/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: true
      });

      setSuccess("Account created successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto p-4 flex">
        {/* Left Side */}
        <div className="w-1/2 text-white p-8 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-4">Join Our System</h1>
          <p className="mb-8">
            Create your account to access the Smart Room Assignment system.
            Get started managing assignments or viewing your exam locations.
          </p>
          <div className="flex space-x-4">
            {/* Social Media Icons can be added here */}
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-1/2 p-8 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-2 border-gray-200">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Sign up
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Create a password (6+ characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>



              {error && (
                <p className="text-red-500 text-xs italic mb-4">{error}</p>
              )}

              {success && (
                <p className="text-green-500 text-xs italic mb-4">{success}</p>
              )}

              <div className="mb-4">
                <button
                  type="submit"
                  disabled={!!success}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {success ? "Account Created!" : "Create Account"}
                </button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-orange-500 hover:underline">
                  Sign in here
                </Link>
              </p>

              <p className="text-center text-xs text-gray-500 mt-4">
                By creating an account, you agree to our{" "}
                <button
                  type="button"
                  className="text-orange-500 hover:underline"
                  onClick={() => alert("Terms of Service would open here")}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-orange-500 hover:underline"
                  onClick={() => alert("Privacy Policy would open here")}
                >
                  Privacy Policy
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
