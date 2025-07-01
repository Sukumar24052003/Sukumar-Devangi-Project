import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import logo1 from '../assets/d3.png';
import {
  FaHome,
  FaBoxOpen,
  FaCalendarCheck,
  FaFileAlt,
  FaUsers,
  FaChartBar,
  FaRupeeSign,
  FaImages,
  FaBell,
} from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();

  const navItems = [
    { label: 'Home', path: '/home', icon: <FaHome /> },
    { label: 'Inventories', path: '/inventory', icon: <FaBoxOpen /> },
    { label: 'Bookings', path: '/booking-dashboard', icon: <FaCalendarCheck /> },
    { label: 'Proposals', path: '/proposal-dashboard', icon: <FaFileAlt /> },
    { label: 'Users', path: '/users', icon: <FaUsers /> },
    { label: 'Reports', path: '/reports', icon: <FaChartBar /> },
    { label: 'Finances', path: '/finances', icon: <FaRupeeSign /> },
    { label: 'Gallery', path: '/gallery', icon: <FaImages /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[70%] lg:w-64 bg-[#fff] text-black py-6 space-y-4 overflow-y-auto fixed top-0 left-0 bottom-0 z-10 border border-gray-300 shadow-lg flex flex-col">
      {/* Top section */}
      <div>
        <div className="flex flex-col items-center ml-[5%]">
          <img className="w-[60%] mr-auto " src={logo1} alt="Logo" />
          <p className="mt-4 mr-auto px-2 text-lg text-black font-semibold">Welcome, Digiplus</p>
        </div>

        <nav className="space-y-2 text-xs mt-4">
          {navItems.map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`cursor-pointer font-semibold px-3 pl-[10%] py-2 rounded transition ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-blue-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </nav>
      </div>
      
      {/* Spacer div */}
      <div className="flex-grow"></div>

      {/* 
        Bottom section:
        - whitespace-nowrap: Forces the text onto a single line.
        - text-[11px]: Reduces font size to ensure the line fits within the navbar's width.
        - pr-4: Adds padding on the right for better spacing.
      */}
      <div className="pl-[10%] pr-4 py-1 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
        <span
          onClick={() => navigate('/privacy-policy')}
          className="cursor-pointer hover:text-blue-600 transition"
        >
          Privacy Policy
        </span>
        <span className="mx-1">/</span>
        <span
          onClick={() => navigate('/disclaimer-policy')}
          className="cursor-pointer hover:text-blue-600 transition"
        >
          Disclaimer Policy
        </span>
        <span className="mx-1">/</span>
        <span
          onClick={handleLogout}
          className="cursor-pointer hover:text-blue-600 transition"
        >
          Logout
        </span>
      </div>
    </aside>
  );
}