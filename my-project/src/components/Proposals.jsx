import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Button = ({ children, className = '', ...props }) => (
  <button className={`px-4 py-2 rounded bg-black text-white hover: transition ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className = '', ...props }) => (
  <input className={`border px-3 py-2 rounded w-full  ${className}`} {...props} />
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

export default function ProposalsDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
const [isAnimated, setIsAnimated] = useState(false);
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/proposals`);
        const data = await response.json();
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProposals(data); 
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    };

    fetchProposals();
  }, []);

  const filteredData = proposals.filter((item) =>
    item.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    item.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    item.brandDisplayName?.toLowerCase().includes(search.toLowerCase()) ||
    item.campaignName?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
   useEffect(() => {
      const timeout = setTimeout(() => {
        setIsAnimated(true);
      }, 50); // Small delay ensures animation is triggered
      return () => clearTimeout(timeout);
    }, [paginatedData]);
  const totalPages = Math.ceil(filteredData.length / perPage);

  return (
    <div className="min-h-screen bg-[#fafafb] h-screen w-screen bg-white text-black flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto px-4 md:px-6 py-6 ml-0 lg:ml-64">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h2 className="text-2xl md:text-3xl font-sans font-normal">Proposals</h2>
          
        </div>

        <div className="mt-6 text-sm flex flex-col md:flex-row justify-between gap-4 items-stretch md:items-center">
          <Input
            className="md:w-[25%] h-[1.8rem]"
            placeholder="Search Proposals"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={`mt-6 grid grid-cols-1 gap-4 w-full transform transition-all duration-700 ease-out ${
  isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
}`}>
          {paginatedData.map((item) => (
            <Card key={item._id} className="transition hover:shadow-md cursor-pointer" onClick={() => navigate(`/proposal/${item._id}`)}>
              <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Proposal Info */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-sm font-semibold break-words">{item.companyName}</div>
                  <div className="text-xs text-gray-600">Client: {item.clientName || 'No Client'}</div>
                  <div className="text-xs text-gray-600">Campaign: {item.campaignName || 'No Campaign'}</div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs px-2 py-1 rounded bg-green-200">
                    {item.clientType || 'Client Type'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-purple-100">
                    {item.industry || 'Industry'}
                  </span>
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
