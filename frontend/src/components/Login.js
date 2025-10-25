import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Education-related image placeholder
const loginBg =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    localStorage.getItem("rememberedUsername") || "",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberedUsername"),
  );
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        localStorage.setItem("rememberMe", "true");
        // For Remember Me, we don't set a login timestamp (won't expire)
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberMe");
        // For regular sessions, set login timestamp for expiration check
        localStorage.setItem("loginTime", Date.now().toString());
      }

      if (response.data.user) {
        localStorage.setItem("token", response.data.token || "logged-in");
        localStorage.setItem("userRole", response.data.user.role);

        if (response.data.user.role === "Administrator") {
          navigate("/admin/dashboard");
        } else if (response.data.user.role === "student") {
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      className="h-5 w-5 text-gray-500 hover:text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {showPassword ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      )}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
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
              <p className="text-center text-sm text-gray-600 mb-4">
                Don't have an account?{" "}
                <Link to="/signup" className="text-orange-500 hover:underline">
                  Sign up here
                </Link>
              </p>
              <p className="text-center text-xs text-gray-500">
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
            <h3 className="text-lg font-bold mb-4 text-black">Reset Password</h3>
            <p className="text-sm text-gray-700 mb-4">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 text-black hover:text-gray-800"
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
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
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
