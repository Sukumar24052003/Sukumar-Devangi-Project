

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { toast } from 'sonner';
import { Dialog } from '@headlessui/react';
import { Navigate } from 'react-router-dom';

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

export default function User() {
  const [users, setUsers] = useState([]);
   const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const perPage = 10;

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userToDelete}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        fetchUsers();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Error deleting user');
    } finally {
      setShowModal(false);
      setUserToDelete(null);
    }
  };

  const filteredData = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search)
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
            <h2 className="text-2xl md:text-3xl font-sans font-normal">Users</h2>
        </div>

        <div className="mt-6 text-sm flex flex-col md:flex-row justify-between gap-4 items-stretch md:items-center">
          <Input
            className="md:w-[25%] h-[2rem]"
            placeholder="Search Users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
           <div className="flex justify-between mt-[2%] items-center mb-4">
        <div className='text-xs'>
    
        </div>
        <button onClick={()=>navigate('/create-user')} className="bg-black text-xs text-white px-3 py-2 rounded transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">+ Create User</button>
      </div>
        </div>

        <div className={`mt-6 grid grid-cols-1 gap-4 w-full transform transition-all duration-700 ease-out ${
          isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          {paginatedData.map((user) => (
            <Card key={user._id} className="transition hover:shadow-md relative">
              <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-sm font-semibold break-words">{user.name}</div>
                  <div className="text-xs text-gray-600">Email: {user.email}</div>
                  <div className="text-xs text-gray-600">Phone: {user.phone || 'Not Provided'}</div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {/* <span className="text-xs px-2 py-1 rounded bg-blue-200">
                    ID: {user._id.slice(-6)}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    className="text-xs px-2 py-1 rounded bg-red-200 hover:bg-red-300 text-red-800"
                    onClick={() => {
                      setUserToDelete(user._id);
                      setShowModal(true);
                    }}
                  >
                    Delete
                  </button> */}
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100">
   {user.role || 'member'}
</span>
<span className="text-xs px-2 py-1 rounded bg-green-100">
  Joined: {new Date(user.createdAt).toLocaleDateString()}
</span>
{user.role !== 'admin' && (
  <button
    className="text-xs px-2 py-1 rounded bg-red-200 hover:bg-red-300 text-red-800"
    onClick={() => {
      setUserToDelete(user._id);
      setShowModal(true);
    }}
  >
    Delete
  </button>
)}

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

      {/* 🧠 Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-80">
            <h2 className="text-md font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-sm mb-6">Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

