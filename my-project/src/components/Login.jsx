import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import logo1 from '../assets/d3.png';
import { useAuth } from '../context/AuthContext';
import { FiRefreshCw } from 'react-icons/fi'; // Using a popular icon library for the refresh icon

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- CAPTCHA STATE ---
  const [captcha, setCaptcha] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  
  const { setAuth } = useAuth();

  // --- CAPTCHA GENERATION LOGIC ---
  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  }, []);

  // Generate the first CAPTCHA when the component loads
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleLogin = async (e) => {
    e.preventDefault(); 

    // --- CAPTCHA VALIDATION ---
    // Compare user input with the generated captcha (case-insensitive)
    if (userCaptcha.toLowerCase() !== captcha.toLowerCase()) {
      toast.error('Incorrect CAPTCHA. Please try again.');
      generateCaptcha(); // Generate a new captcha on failure
      setUserCaptcha(''); // Clear the user's input
      return; // Stop the login process
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { email, password });
      const { accessToken, user } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      
      toast.success('Login successful!');
      setAuth({ token: accessToken, userName: user.name, role: user.role });
      navigate('/home');

    } catch (error) {
      toast.error(`Login failed: ${error.response?.data?.message || error.message}`);
      // Also regenerate captcha on failed login attempt for security
      generateCaptcha();
      setUserCaptcha('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        
        <img className="w-40 mx-auto mb-6" src={logo1} alt="Company Logo" />

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Log in
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* --- NEW: CAPTCHA SECTION --- */}
          <div>
            <label htmlFor="captcha" className="sr-only">CAPTCHA</label>
            <div className="flex items-center space-x-2">
              <div className="w-1/2 h-12 flex items-center justify-center bg-gray-200 rounded-lg">
                <span 
                  className="text-2xl font-bold tracking-widest text-gray-700 select-none"
                  style={{ textDecoration: 'line-through', fontStyle: 'italic' }}
                >
                  {captcha}
                </span>
              </div>
              <button 
                type="button" 
                onClick={generateCaptcha} 
                className="p-3 text-gray-600 hover:text-orange-500"
                aria-label="Regenerate CAPTCHA"
              >
                <FiRefreshCw size={24} />
              </button>
            </div>
            <input
              id="captcha"
              type="text"
              placeholder="Enter CAPTCHA"
              value={userCaptcha}
              onChange={(e) => setUserCaptcha(e.target.value)}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="text-right">
             <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-800">
                Forgot password?
             </Link>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;