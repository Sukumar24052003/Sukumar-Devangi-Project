import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { toast } from 'sonner';
const Button = ({ children, className = '', ...props }) => (
  <button className={`px-4 py-2 rounded bg-black text-white hover: transition ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className = '', ...props }) => (
  <input className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`} {...props} />
);

export default function EditProposal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [availableSpaces, setAvailableSpaces] = useState([]);
const [selectedSpaces, setSelectedSpaces] = useState([]);


  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/proposals/${id}`);
        const data = await response.json();
        setProposal(data);
      } catch (error) {
        console.error('Error fetching proposal:', error);
      }
    };

    fetchProposal();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProposal({ ...proposal, [name]: value });
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchAvailableSpaces();
    }
  }, [startDate, endDate]);
  
  const fetchAvailableSpaces = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/available?start=${startDate}&end=${endDate}`);
      const data = await response.json();
      setAvailableSpaces(data);
    } catch (error) {
      console.error('Error fetching available spaces:', error);
    }
  };

  const toggleSpaceSelection = (spaceId) => {
    if (selectedSpaces.includes(spaceId)) {
      setSelectedSpaces(selectedSpaces.filter((id) => id !== spaceId));
    } else {
      setSelectedSpaces([...selectedSpaces, spaceId]);
    }
  };
  

  const handleSave = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal),
      });

      if (response.ok) {
        toast.success('Proposal updated successfully!');
        navigate(`/proposal/${id}`);
      } else {
        toast.error('Failed to update proposal');
      }
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error('Error updating proposal');
    }
  };

  if (!proposal) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen text-xs h-screen w-screen bg-white text-black flex flex-col lg:flex-row overflow-hidden">
      <Navbar />
      <main className="flex-1 h-full overflow-y-auto px-4 md:px-6 py-6 ml-0 lg:ml-64">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-1xl md:text-2xl font-semibold">Edit Proposal</h1>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
          <Input name="companyName" value={proposal.companyName} onChange={handleChange} placeholder="Company Name" />
          <Input name="clientName" value={proposal.clientName} onChange={handleChange} placeholder="Client Name" />
          <Input name="clientEmail" value={proposal.clientEmail} onChange={handleChange} placeholder="Client Email" />
          <Input name="clientContactNumber" value={proposal.clientContactNumber} onChange={handleChange} placeholder="Client Contact Number" />
          <Input name="clientPanNumber" value={proposal.clientPanNumber} onChange={handleChange} placeholder="Client PAN Number" />
          <Input name="clientGstNumber" value={proposal.clientGstNumber} onChange={handleChange} placeholder="Client GST Number" />
          <Input name="clientType" value={proposal.clientType} onChange={handleChange} placeholder="Client Type" />
          <Input name="campaignName" value={proposal.campaignName} onChange={handleChange} placeholder="Campaign Name" />
          <Input name="industry" value={proposal.industry} onChange={handleChange} placeholder="Industry" />
          <Input name="description" value={proposal.description} onChange={handleChange} placeholder="Description" />
          <label className="text-sm font-semibold">Start Date</label>
<Input
  type="date"
  name="startDate"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
/>

<label className="text-sm font-semibold">End Date</label>
<Input
  type="date"
  name="endDate"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
/>

        </div>
        {/* <div className="mt-4">
  <h2 className="font-semibold text-sm mb-2">Available Spaces</h2>
  {availableSpaces.map((space) => (
    <div key={space._id} className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={selectedSpaces.includes(space._id)}
        onChange={() => toggleSpaceSelection(space._id)}
      />
      <span className="text-sm">{space.spaceName}</span>
    </div>
  ))}
</div> */}
<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
  {availableSpaces.length > 0 ? (
    availableSpaces.map((space) => (
      <div
        key={space._id}
        className="border rounded-lg p-4 shadow-sm flex flex-col gap-2 cursor-pointer relative transition hover:shadow-md"
        onClick={() => toggleSpaceSelection(space._id)}
      >
        {/* Tick mark when selected */}
        {selectedSpaces.includes(space._id) && (
          <div className="absolute top-2 right-2 text-green-500 text-lg font-bold">✅ </div>
        )}

        <div className="font-semibold">{space.spaceName}</div>
        <div className="text-xs text-gray-600">{space.address || 'No Address Provided'}</div>
        <div className="text-xs text-gray-400">{space.city || 'No City Provided'}</div>
        <div className="text-xs text-gray-400">
          Start: {space.dates?.[0] || 'N/A'} | End: {space.dates?.[1] || 'N/A'}
        </div>
      </div>
    ))
  ) : (
    <div className="text-center text-gray-500 col-span-2">No Spaces Available for Selected Dates</div>
  )}
</div>




        <div className="flex justify-center mt-6">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
