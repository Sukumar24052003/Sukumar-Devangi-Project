import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Button = ({ children, className = '', ...props }) => (
  <button className={`px-4 py-2 rounded bg-black text-white hover: transition ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className = '', ...props }) => (
  <input className={`border px-3 py-2 rounded w-full ${className}`} {...props} />
);

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white border shadow-sm rounded-xl w-full ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Pagination = ({ children }) => <div className="flex justify-center">{children}</div>;
const PaginationContent = ({ children, className = '' }) => (
  <div className={`flex gap-2 mt-4 flex-wrap ${className}`}>{children}</div>
);
const PaginationItem = ({ children }) => <div>{children}</div>;
const PaginationLink = ({ children, isActive = false, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded ${isActive ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'} transition`}
  >
    {children}
  </button>
);

export default function finances() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
 const [isAnimated, setIsAnimated] = useState(false);
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`);
        const data = await response.json();
        data.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(data.bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  const filteredData = bookings.filter((item) =>
    item.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    item.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    item.brandDisplayName?.toLowerCase().includes(search.toLowerCase()) ||
    item.campaignName?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filteredData.length / perPage);
   useEffect(() => {
      const timeout = setTimeout(() => {
        setIsAnimated(true);
      }, 50); // Small delay ensures animation is triggered
      return () => clearTimeout(timeout);
    }, [paginatedData]); // Re-animate on pagination change

  return (
    <div className="min-h-screen h-screen w-screen bg-white text-black flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto px-4 md:px-6 py-6 ml-0 lg:ml-64">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-1xl md:text-2xl font-semibold">Bookings</h1>
        </div>

        <div className="mt-6 text-sm flex flex-col md:flex-row justify-between gap-4 items-stretch md:items-center">
          <Input
            className="md:w-[25%] h-[2rem]"
            placeholder="Search Bookings"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex justify-between mt-[2%] items-center mb-4">
        <div className='text-xs'>
    
          <button className="border border-gray-300 px-3 py-1 rounded mr-2">Filter</button>
        </div>
        <button onClick={()=>navigate('/create-booking')} className="bg-black text-xs text-white px-3 py-2 rounded transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">+ Create Order</button>
      </div>

        <div className={`mt-6 grid grid-cols-1 gap-4 w-full transform transition-all duration-700 ease-out ${
  isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
}`}>
          {paginatedData.map((item) => (
            <Card key={item._id} className="transition hover:shadow-md cursor-pointer" onClick={() => navigate(`/pipeline/${item._id}`)}>
              <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Booking Info */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-sm font-semibold break-words">Year 2025</div>

                </div>


              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Pagination>
            <PaginationContent className="gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      </main>
    </div>
  );
}
