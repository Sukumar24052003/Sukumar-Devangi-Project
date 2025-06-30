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
  FaBell, // Imported the bell icon
} from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth(); // Get the user information from AuthContext

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

  // Array for policy links for easier management and scalability
  const policyItems = [
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Cookie Policy', path: '/cookie-policy' },
    { label: 'Disclaimer Policy', path: '/disclaimer-policy' },
  ];

  return (
    // Added flex and flex-col to enable pushing content to the bottom
    <aside className="w-[70%] lg:w-64 bg-[#fff] text-black py-6 space-y-4 overflow-y-auto fixed top-0 left-0 bottom-0 z-10 border border-gray-300 shadow-lg flex flex-col">
      {/* Top section: Logo, Welcome message, and Main Navigation */}
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
                  ? 'bg-blue-600 text-white' // Style for the active link
                  : 'hover:bg-blue-100' // Style for inactive links on hover
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
      
      {/* This spacer div will grow to push the policy links to the bottom */}
      <div className="flex-grow"></div>

      {/* Bottom section: Policy links */}
      <div className="pl-[10%] text-xs space-y-2 font-semibold">
        {policyItems.map((policy) => (
           <div 
             key={policy.label}
             onClick={() => navigate(policy.path)}
             className="cursor-pointer px-3 py-1 hover:text-blue-600 transition"
           >
             {policy.label}
           </div>
        ))}
      </div>
    </aside>
  );
}