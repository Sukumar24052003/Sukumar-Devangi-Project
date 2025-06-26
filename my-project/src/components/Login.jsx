import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import logo1 from '../assets/d3.png';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault(); 

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
    }
  };

  return (
    // UPDATED: Use `fixed inset-0` to force the layout to cover the entire screen,
    // ensuring the login card is always perfectly centered.
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