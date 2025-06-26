import React, { useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom'
const bookingsData = [
  { id: 1, campaign: "House Of Hiranandani", bookingId: "DO-0030", client: "Hira", type: "Direct client", schedule: "19 Oct 2024 - 18 Dec 2024", status: "Completed", confirmed: "Yes", printing: "Upcoming" },
  { id: 2, campaign: "Domani", bookingId: "DO-0029", client: "Neha", type: "National Agency", schedule: "06 Jul 2024 - 31 Jul 2024", status: "", confirmed: "Yes", printing: "Upcoming" },
  { id: 3, campaign: "Knest", bookingId: "DO-0028", client: "WTT", type: "Local Agency", schedule: "25 Apr 2024 - 29 Apr 2024", status: "", confirmed: "Yes", printing: "Upcoming" },
  { id: 4, campaign: "kalki", bookingId: "DO-0027", client: "zee", type: "Direct client", schedule: "01 Nov 2024 - 05 Jan 2025", status: "", confirmed: "Yes", printing: "Upcoming" },
  // ... add the rest similarly
];

const BookingDashboard = () => {
     const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div className="p-6 md:ml-[30%] min-h-screen bg-white">
        <Navbar/>
      <h2 className="text-sm  mb-6">Bookings</h2>

      {/* Revenue Chart Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-1 bg-white border p-4 rounded shadow">
          <div className="font-semibold mb-2">Revenue Breakup</div>
          <div className="text-sm text-gray-600">Direct Client: 19</div>
          <div className="text-sm text-gray-600">Local Agency: 8</div>
          <div className="text-sm text-gray-600">National Agency: 5</div>
          <div className="text-sm text-gray-600">Government: 2</div>
        </div>
        <div className="bg-white border p-4 rounded shadow text-center">
          <div className="text-sm font-medium">Ongoing Orders</div>
          <div className="text-xl font-bold">0</div>
        </div>
        <div className="bg-white border p-4 rounded shadow text-center">
          <div className="text-sm font-medium">Upcoming Orders</div>
          <div className="text-xl font-bold">0</div>
        </div>
        <div className="bg-white border p-4 rounded shadow text-center">
          <div className="text-sm font-medium">Completed Orders</div>
          <div className="text-xl font-bold">6</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className='text-xs'>
          <button className="border border-gray-300 px-3 py-1 rounded mr-2">Outstanding Export</button>
          <button className="border border-gray-300 px-3 py-1 rounded mr-2">Filter</button>
        </div>
        <button onClick={()=>navigate('/create-booking')} className="bg-black text-xs text-white px-3 py-2 rounded transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">+ Create Order</button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="w-full mb-4 border px-3 py-2 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Campaign Name</th>
              <th className="px-2 py-1 border">Booking ID</th>
              <th className="px-4 py-2 border">Client</th>
              <th className="px-4 py-2 border">Client Type</th>
              <th className="px-4 py-2 border">Schedule</th>
              <th className="px-4 py-2 border">Campaign Status</th>
              <th className="px-4 py-2 border">Booking Confirmed</th>
              <th className="px-4 py-2 border">Printing Status</th>
            </tr>
          </thead>
          <tbody>
            {bookingsData
              .filter(row => row.campaign.toLowerCase().includes(search.toLowerCase()))
              .map((row, index) => (
                <tr key={row.id} className="text-center">
                  <td className="border px-2 py-1">{index + 1}</td>
                  <td className="border px-2 py-1 text-black cursor-pointer">{row.campaign}</td>
                  <td className="border px-2 py-1">{row.bookingId}</td>
                  <td className="border px-2 py-1">{row.client}</td>
                  <td className="border px-2 py-1">{row.type}</td>
                  <td className="border px-2 py-1">{row.schedule}</td>
                  <td className="border px-2 py-1">{row.status || <select className="border rounded text-sm"><option>Select</option></select>}</td>
                  <td className="border px-2 py-1">{row.confirmed}</td>
                  <td className="border px-2 py-1">{row.printing}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingDashboard;