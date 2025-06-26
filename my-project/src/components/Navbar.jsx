import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';// Import the useAuth hook
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
  FaBell, // Imported the bell icon
} from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth(); // Get the user information from AuthContext
  // console.log("Auth details are",auth);

  const navItems = [
    { label: 'Home', path: '/home', icon: <FaHome /> },
    // This is the new Notifications link
    { label: 'Inventories', path: '/inventory', icon: <FaBoxOpen /> },
    { label: 'Bookings', path: '/booking-dashboard', icon: <FaCalendarCheck /> },
    { label: 'Proposals', path: '/proposal-dashboard', icon: <FaFileAlt /> },
    { label: 'Users', path: '/users', icon: <FaUsers /> },
    { label: 'Reports', path: '/reports', icon: <FaChartBar /> },
    { label: 'Finances', path: '/finances', icon: <FaRupeeSign /> },
    { label: 'Gallery', path: '/gallery', icon: <FaImages /> },
  ];

  return (
    <aside className="w-[70%] lg:w-64 bg-[#fff] text-black py-6 space-y-4 overflow-y-auto fixed top-0 left-0 bottom-0 z-10 border border-gray-300 shadow-lg">
      <div className="flex flex-col items-center ml-[5%]">
        <img className="w-[60%] mr-auto "  src={logo1} alt="Logo" />
        
        {/* Display the user's name below the logo */}
        {auth && auth.userName && (
          <p className="mt-2 mr-auto px-2 text-sm text-black font-semibold">Welcome, {auth.userName}</p> // Display user name
        )}
      </div>

      <nav className="space-y-2 text-xs">
        {navItems.map((item) => (
          <div
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`cursor-pointer font-semibold px-3 pl-[10%] py-2 rounded transition ${location.pathname === item.path ? 'bg-orange-500' : 'hover:bg-gray-300 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </nav>
      
      <div className="pl-[5%] text-xs space-y-1">
        <div className="px-3">Privacy Policy</div>
        {/* <div className="px-3">Disclaimer Policy</div>
        <div className="px-3">Cookie Policy</div> */}
      </div>
    </aside>
  );
}