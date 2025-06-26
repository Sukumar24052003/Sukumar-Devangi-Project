

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

export default function Gallery() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('accessToken');
     console.log("Token sent is",token);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`,{ headers: { Authorization: `Bearer ${token}` }});
        if (response.status === 403) {
      const errorData = await response.json();
      if (errorData.message === 'Invalid or expired token') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        navigate('/login'); // or use router.navigate('/login') if using React Router
        return;
      }
    }
        const data = await response.json();
        const sorted = data.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sorted);
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
    item.campaigns?.some(c => c.campaignName?.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filteredData.length / perPage);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAnimated(true);
    }, 50);
    return () => clearTimeout(timeout);
  }, [paginatedData]);

  return (
    <div className="min-h-screen bg-[#fafafb] h-screen w-screen bg-white text-black flex flex-col lg:flex-row overflow-hidden">
      <Navbar />
      <main className="flex-1 h-full overflow-y-auto px-4 md:px-6 py-6 ml-0 lg:ml-64">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h2 className="text-2xl md:text-3xl font-sans font-normal">Gallery</h2>
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
            {/* <button className="border border-gray-300 px-3 py-1 rounded mr-2">Filter</button> */}
          </div>
          
        </div>

        <div className={`mt-6 grid grid-cols-1 gap-4 w-full transform transition-all duration-700 ease-out ${
          isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          {paginatedData.map((item) => (
            <Card key={item._id} className="transition hover:shadow-md cursor-pointer">
              <CardContent className="flex flex-col gap-4">
                <div className="text-md font-semibold text-black">
                  {(item.campaigns[0]?.campaignName) || 'No Campaign Name'}
                </div>

                {/* Artwork Images from all pipelines */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(item.campaigns || []).flatMap((campaign, cIdx) =>
                    (Array.isArray(campaign.pipeline) ? campaign.pipeline : [campaign.pipeline]).map((pipe, pIdx) => {
                      const url = pipe?.artwork?.documentUrl;
                      return url ? (
                        <img
                          key={`${cIdx}-${pIdx}`}
                          src={url}
                          alt={`Artwork ${campaign.campaignName || 'Campaign'}`}
                          className="rounded w-full h-32 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/fallback.jpg';
                          }}
                        />
                      ) : null;
                    })
                  )}
                </div>

                {/* Booking Info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-sm  break-words">{item.companyName}</div>
                    <div className="text-xs text-gray-600">Client: {item.clientName || 'No Client'}</div>
                    <div className="text-xs text-gray-600">Campaign: {item.campaigns[0]?.campaignName || 'No Campaign'}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs px-2 py-1 rounded bg-green-200">
                      {item.clientType || 'Client Type'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-purple-100">
                      {item.industry || 'Industry'}
                    </span>
                  </div>
                </div>

                {/* Download Artwork Images */}
                <div className="flex justify-end">
               <button
  onClick={async () => {
    for (const campaign of item.campaigns || []) {
      const pipelines = Array.isArray(campaign.pipeline)
        ? campaign.pipeline
        : [campaign.pipeline];

      for (const pipe of pipelines) {
        const artworkUrl = pipe?.artwork?.documentUrl;
        if (artworkUrl) {
          try {
            const response = await fetch(artworkUrl, {
              mode: 'cors', // Ensure CORS is respected
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch: ${artworkUrl}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = artworkUrl.split('/').pop() || 'artwork.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch (err) {
            console.error('Download failed:', err.message);
          }
        }
      }
    }
  }}
  className="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
>
  Download Images
</button>

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