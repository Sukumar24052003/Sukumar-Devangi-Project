// src/pages/BookingsDashboard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import Navbar from './Navbar';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

// --- (No changes to Input, SortableHeader, or CompanyLogo components) ---

const Input = ({ className = '', ...props }) => (
  <input className={`border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 rounded-md w-full ${className}`} {...props} />
);

const SortableHeader = ({ children, columnKey, sortConfig, setSortConfig }) => {
  const isSorted = sortConfig.key === columnKey;
  const direction = isSorted ? sortConfig.direction : 'none';

  const onSort = () => {
    let newDirection = 'asc';
    if (isSorted && sortConfig.direction === 'asc') {
      newDirection = 'desc';
    }
    setSortConfig({ key: columnKey, direction: newDirection });
  };

  const getIcon = () => {
    if (!isSorted) {
      return <FaSort className="text-gray-400" />;
    }
    return direction === 'asc' ? <FaSortUp className="text-white" /> : <FaSortDown className="text-white" />;
  };

  return (
    <th
      scope="col"
      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer select-none"
      onClick={onSort}
    >
      <div className="flex items-center gap-2">
        {children}
        {getIcon()}
      </div>
    </th>
  );
};

const CompanyLogo = ({ logoUrl, companyName }) => {
    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.trim().split(/\s+/);
        if (words.length > 1) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (logoUrl) {
        return <img src={logoUrl} alt={`${companyName} logo`} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />;
    }

    return (
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
            {getInitials(companyName)}
        </div>
    );
};


export default function BookingsDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object from React Router
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [totalItems, setTotalItems] = useState(0); 
  const perPage = 10;
  
  // Get the status filter from the URL
  const statusFilter = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('status') || '';
  }, [location.search]);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
          navigate('/login');
          return;
      }
      try {
        // Build API URL with all parameters, including the new status filter
        let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/bookings/optimized?page=${currentPage}&limit=${perPage}&search=${search}`;
        if (statusFilter) {
          apiUrl += `&status=${statusFilter}`;
        }
        
        const response = await fetch(apiUrl, { 
          headers: { Authorization: `Bearer ${token}` } 
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          navigate('/login');
          return;
        }

        const data = await response.json();
        setBookings(data.bookings || []);
        setTotalItems(data.totalBookings || 0); 
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [search, currentPage, navigate, statusFilter]); // Add statusFilter to dependency array

  const sortedData = useMemo(() => {
    let itemsWithUpcomingDates = bookings.map(booking => {
        let upcomingCampaignStartDate = null;
        let upcomingCampaignEndDate = null;

        if (booking.campaigns && booking.campaigns.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const futureStartDates = booking.campaigns
                .map(c => c.startDate ? new Date(c.startDate) : null)
                .filter(date => date && date >= today)
                .sort((a, b) => a - b);
            
            if (futureStartDates.length > 0) {
                upcomingCampaignStartDate = futureStartDates[0];
            }

            const futureEndDates = booking.campaigns
                .map(c => c.endDate ? new Date(c.endDate) : null)
                .filter(date => date && date >= today)
                .sort((a, b) => a - b);
            
            if (futureEndDates.length > 0) {
                upcomingCampaignEndDate = futureEndDates[0];
            }
        }
        return { ...booking, upcomingCampaignStartDate, upcomingCampaignEndDate };
    });

    if (sortConfig.key) {
      itemsWithUpcomingDates.sort((a, b) => {
        if (sortConfig.key === 'upcomingCampaignStartDate' || sortConfig.key === 'upcomingCampaignEndDate') {
            const dateA = a[sortConfig.key];
            const dateB = b[sortConfig.key];
            if (dateA === null) return 1;
            if (dateB === null) return -1;
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'createdAt') {
            return sortConfig.direction === 'asc' 
                ? new Date(aVal) - new Date(bVal) 
                : new Date(bVal) - new Date(aVal);
        }
        
        const valA = aVal ?? '';
        const valB = bVal ?? '';

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return itemsWithUpcomingDates;
  }, [bookings, sortConfig]);
  
  const totalPages = Math.ceil(totalItems / perPage);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US');

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col lg:flex-row">
      <Navbar />

      <main className="flex-1 h-full overflow-y-auto px-4 md:px-8 py-8 ml-0 lg:ml-64">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-sans font-normal">Bookings</h2>
          <button
            onClick={() => navigate('/create-booking')}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition shadow-sm mt-2 md:mt-0"
          >
            + Create Booking
          </button>
        </div>

        <div className="mb-6">
            <Input
              className="md:w-1/3 h-10"
              placeholder="Search by company, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-800">
                    <tr>
                      <SortableHeader columnKey="_id" sortConfig={sortConfig} setSortConfig={setSortConfig}>Booking ID</SortableHeader>
                      <SortableHeader columnKey="companyName" sortConfig={sortConfig} setSortConfig={setSortConfig}>Company Name</SortableHeader>
                      <SortableHeader columnKey="clientName" sortConfig={sortConfig} setSortConfig={setSortConfig}>Client Name</SortableHeader>
                      <SortableHeader columnKey="clientContactNumber" sortConfig={sortConfig} setSortConfig={setSortConfig}>Contact Number</SortableHeader>
                      <SortableHeader columnKey="clientType" sortConfig={sortConfig} setSortConfig={setSortConfig}>Client Type</SortableHeader>
                      <SortableHeader columnKey="createdAt" sortConfig={sortConfig} setSortConfig={setSortConfig}>Booking Date</SortableHeader>
                      <SortableHeader columnKey="upcomingCampaignStartDate" sortConfig={sortConfig} setSortConfig={setSortConfig}>Upcoming Campaign Start</SortableHeader>
                      <SortableHeader columnKey="upcomingCampaignEndDate" sortConfig={sortConfig} setSortConfig={setSortConfig}>Upcoming Campaign End</SortableHeader>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.length > 0 ? (
                      sortedData.map((item) => (
                        <tr 
                          key={item._id} 
                          onClick={() => navigate(`/booking/${item._id}`)}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item._id?.substring(0, 6)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <CompanyLogo logoUrl={item.companyLogoUrl} companyName={item.companyName} />
                                <div className="ml-4">
                                    <div className="text-sm font-bold text-gray-900">{item.companyName || 'N/A'}</div>
                                </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.clientName || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.clientContactNumber || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.clientType || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.upcomingCampaignStartDate ? formatDate(item.upcomingCampaignStartDate) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.upcomingCampaignEndDate ? formatDate(item.upcomingCampaignEndDate) : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                          <td colSpan="8" className="text-center py-10 text-gray-500">
                              No bookings found.
                          </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center gap-2">
          {totalPages > 1 && Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                i + 1 === currentPage 
                ? 'bg-black text-white shadow-sm' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}