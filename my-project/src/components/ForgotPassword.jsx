// src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    // NOTE: This assumes your backend has an endpoint to handle password resets this way.
    // A more secure flow would involve sending a token to the user's email first.
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
        email,
        newPassword,
      });

      toast.success("Password has been reset successfully. Please log in with your new password.");
      navigate('/login'); // Redirect to login page on success

    } catch (error) {
      toast.error(`Failed to reset password: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    // UPDATED: Use `fixed inset-0` to force the layout to cover the entire screen,
    // ensuring the password reset card is always perfectly centered.
    <div className="fixed inset-0 bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Reset Password
        </h2>

        <form onSubmit={handlePasswordReset} className="space-y-5">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="new-password" className="sr-only">New Password</label>
            <input
              id="new-password"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            Update Password
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-orange-600 hover:text-orange-800">
                Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;