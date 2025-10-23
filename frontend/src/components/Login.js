import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Education-related image placeholder
const loginBg =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    localStorage.getItem("rememberedUsername") || "",
  );
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberedUsername"),
  );
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const response = await axios.post(
        `${apiUrl}/login`,
        { email, password },
        { withCredentials: true },
      );

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", email);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      if (response.data.user) {
        localStorage.setItem("token", response.data.token || "logged-in");
        localStorage.setItem("userRole", response.data.user.role);

        if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        setError("No user data received from server");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto p-4 flex">
        {/* Left Side */}
        <div className="w-1/2 text-white p-8 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
          <p className="mb-8">
            Our system is designed to efficiently assign students to buildings
            and rooms. Good luck!
          </p>
          <div className="flex space-x-4">
            {/* Social Media Icons can be added here */}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 p-8 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-2 border-gray-200">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Sign in
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Email Address
                </label>
                <input
                  type="text"
                  id="username"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2">Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-orange-500 hover:underline"
                >
                  Lost your password?
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-xs italic mb-4">{error}</p>
              )}
              <div className="mb-6">
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Sign in now
                </button>
              </div>
              <p className="text-center text-sm text-gray-600">
                By clicking on "Sign in now" you agree to
                <button
                  type="button"
                  className="text-orange-500 hover:underline"
                  onClick={() => alert("Terms of Service would open here")}
                >
                  Terms of Service
                </button>{" "}
                |
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

      {showForgotPassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
            />
            {resetMessage && (
              <p
                className={`text-sm mb-4 ${resetMessage.includes("success") ? "text-green-600" : "text-red-600"}`}
              >
                {resetMessage}
              </p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setResetMessage("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!forgotPasswordEmail) {
                    setResetMessage("Please enter your email address");
                    return;
                  }
                  try {
                    const apiUrl =
                      process.env.REACT_APP_API_URL || "http://localhost:5000";
                    await axios.post(`${apiUrl}/forgot-password`, {
                      email: forgotPasswordEmail,
                    });
                    setResetMessage(
                      "Password reset email sent successfully. Please check your email.",
                    );
                  } catch (error) {
                    setResetMessage(
                      error.response?.data?.error ||
                        "Failed to send reset email",
                    );
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
