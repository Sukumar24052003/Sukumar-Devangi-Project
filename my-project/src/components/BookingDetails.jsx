// src/pages/BookingDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from './Navbar';
import { PieChart } from '@mui/x-charts/PieChart';
import InventorySelector from './BookingFormAddSpaces';

const InfoDetail = ({ label, value }) => (
  <div className="mb-3">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm text-gray-800 break-words">{value || 'N/A'}</p>
  </div>
);

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [campaignDrafts, setCampaignDrafts] = useState([]);
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    const fetchSpaces = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces`);
      const data = await res.json();
      const transformed = data.map(space => ({
        id: space._id,
        name: space.spaceName,
        facia: space.faciaTowards,
        city: space.city,
        category: space.category,
        spaceType: space.spaceType,
        unit: space.unit,
        occupiedUnits: space.occupiedUnits,
        ownershipType: space.ownershipType,
        price: space.price,
        traded: space.traded,
        overlappingBooking: space.overlappingBooking,
        availableFrom: space.dates?.[0],
        availableTo: space.dates?.[space.dates.length - 1],
        status: space.occupiedUnits === 0 ? 'Completely available' :
                space.occupiedUnits < space.unit ? 'Partialy available' : 'Completely booked'
      }));
      setSpaces(transformed);
    };
    fetchSpaces();
  }, []);


  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch booking (status: ${res.status})`);
        }
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load booking details');
      }
    };
    fetchBooking();
  }, [id]);

  const addDraftCampaign = () => {
    setCampaignDrafts([...campaignDrafts, {
      campaignName: '', industry: '', description: '',
      startDate: '', endDate: '', selectedSpaces: [], searchQuery: ''
    }]);
  };

  const updateDraftCampaign = (index, updated) => {
    const updatedList = [...campaignDrafts];
    updatedList[index] = updated;
    setCampaignDrafts(updatedList);
  };

  const removeDraftCampaign = (index) => {
    setCampaignDrafts(campaignDrafts.filter((_, i) => i !== index));
  };

  const saveDraftCampaign = async (index) => {
    const campaign = campaignDrafts[index];
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${booking._id}/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaign),
        });

        if (!res.ok) throw new Error('Failed to save campaign');

        toast.success('Campaign added successfully');
        const updatedBookingData = await res.json(); // API should return the updated booking
        setBooking(updatedBookingData); // Update the entire booking object
        setCampaignDrafts([]); // Clear drafts
    } catch(err) {
        toast.error(err.message || 'Failed to save campaign');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Booking deleted successfully');
        navigate('/booking-dashboard');
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred while deleting booking');
    } finally {
      setShowDeletePopup(false);
    }
  };

  if (!booking) return (
    // FIX 1: Corrected the loading state's layout to be consistent
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#fafafb] w-screen">
      <Navbar />
      <main className="flex-1 flex justify-center items-center ml-0 lg:ml-64 p-6">
        <div className="text-xl text-gray-700">Loading booking details...</div>
      </main>
    </div>
  );

  const totalPaid = booking.campaigns?.reduce((sum, c) => sum + (c.pipeline?.payment?.totalPaid || 0), 0) || 0;
  const totalDue = booking.campaigns?.reduce((sum, c) => sum + (c.pipeline?.payment?.paymentDue || 0), 0) || 0;
  const grandTotal = totalPaid + totalDue;

  const clientInfoData = [
    { key: 'companyName', label: 'Company Name', value: booking.companyName },
    { key: 'clientName', label: 'Client Name', value: booking.clientName },
    { key: 'clientEmail', label: 'Client Email', value: booking.clientEmail },
    { key: 'clientContactNumber', label: 'Client Contact Number', value: booking.clientContactNumber },
    { key: 'clientPanNumber', label: 'Client Pan Number', value: booking.clientPanNumber },
    { key: 'clientGstNumber', label: 'Client Gst Number', value: booking.clientGstNumber },
    { key: 'brandDisplayName', label: 'Brand Display Name', value: booking.brandDisplayName },
    { key: 'clientType', label: 'Client Type', value: booking.clientType },
    { key: 'createdAt', label: 'Created At', value: new Date(booking.createdAt).toLocaleString() },
  ];

  return (
    // FIX 2: Replaced `w-full` and `overflow-x-hidden` with `w-screen` for correct full-width layout
    <div className="min-h-screen bg-[#fafafb] w-screen text-base-content flex flex-col lg:flex-row">
      <Navbar />
      <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 py-6 ml-0 lg:ml-64">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Booking Details</h1>
          <button className="bg-red-600 text-white px-4 py-2 text-xs rounded-md hover:bg-red-700" onClick={() => setShowDeletePopup(true)}>
            Delete Booking
          </button>
        </div>

        <div className="flex flex-col lg:flex-row w-full gap-6 mb-6">
          <div className="card bg-white shadow-xl p-6 rounded-lg flex-grow lg:w-2/3">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Client Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6">
              {clientInfoData.map(({ key, label, value }) => (<InfoDetail key={key} label={label} value={value} />))}
            </div>
          </div>
          <div className="card bg-white shadow-xl p-6 rounded-lg flex-grow lg:w-1/3 lg:max-w-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">Payment Overview</h2>
            {booking.isFOCBooking? <div className="flex items-center justify-center h-48"><p className="text-gray-500 text-md text-center">This is a FOC booking</p></div> : <div>
              {(grandTotal === 0) ? (<div className="flex items-center justify-center h-48"><p className="text-gray-500 text-md text-center">Please enter the payment details</p></div>) : (
                <>
                  <div className="mb-4 text-xs text-gray-700 space-y-1 text-right">
                    <p><strong>Paid:</strong> ₹{totalPaid.toLocaleString()}</p>
                    <p><strong>Remaining:</strong> ₹{totalDue.toLocaleString()}</p>
                    <p><strong>Total Amount:</strong> ₹{grandTotal.toLocaleString()}</p>
                  </div>
                  <div className="flex text-xs justify-center mt-2">
                    <PieChart series={[{ innerRadius: 45, outerRadius: 70, paddingAngle: 2, cornerRadius: 5, data: [{ id: 0, value: totalPaid, label: 'Paid', color: '#4CAF50' }, { id: 1, value: totalDue, label: 'Due', color: '#FF9800' }], highlightScope: { faded: 'global', highlighted: 'item' }, faded: { innerRadius: 30, additionalRadius: -5, color: 'gray' }, }]} width={250} height={160} slotProps={{ legend: { hidden: false, position: { vertical: 'bottom', horizontal: 'middle' }, labelStyle: { fontSize: 12 } } }} />
                  </div>
                </>
              )}
            </div>}
          </div>
        </div>

        {booking.campaigns && booking.campaigns.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-8 border-b pb-3">Campaigns ({booking.campaigns.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {booking.campaigns.map((campaign, idx) => (
                <div key={campaign._id || idx} className="card bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer flex flex-col" onClick={() => navigate(`/campaign-details/${campaign._id}`)}>
                  {campaign.pipeline?.artwork?.image && (
                      <img src={campaign.pipeline.artwork.image} alt={`Artwork for ${campaign.campaignName}`} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-blue-600 mb-3 truncate" title={campaign.campaignName}>
                      {campaign.campaignName || 'Unnamed Campaign'}
                    </h3>
                    <div className="flex-grow">
                        <InfoDetail label="Description" value={campaign.description} />
                        <InfoDetail label="Start Date" value={campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('en-GB') : 'N/A'} />
                        <InfoDetail label="End Date" value={campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('en-GB') : 'N/A'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {campaignDrafts.map((campaign, index) => (
          <div key={index} className="border rounded mt-[5%] p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Campaign Name" value={campaign.campaignName} onChange={e => updateDraftCampaign(index, { ...campaign, campaignName: e.target.value })} />
              <Input label="Industry" value={campaign.industry} onChange={e => updateDraftCampaign(index, { ...campaign, industry: e.target.value })} />
              <Input label="Start Date" type="date" value={campaign.startDate} onChange={e => updateDraftCampaign(index, { ...campaign, startDate: e.target.value })} />
              <Input label="End Date" type="date" value={campaign.endDate} onChange={e => updateDraftCampaign(index, { ...campaign, endDate: e.target.value })} />
              <div className="col-span-2">
                <label className="text-xs font-medium">Description</label>
                <textarea value={campaign.description} onChange={e => updateDraftCampaign(index, { ...campaign, description: e.target.value })} className="w-full border rounded p-2" />
              </div>
            </div>
            <InventorySelector campaignIndex={index} campaign={campaign} spaces={spaces} globalAvailability={{}} startDate={campaign.startDate} endDate={campaign.endDate} onToggleSpaceSelection={(i, id) => { const updated = { ...campaign }; const exists = updated.selectedSpaces?.find(s => s.id === id); updated.selectedSpaces = exists ? updated.selectedSpaces.filter(s => s.id !== id) : [...(updated.selectedSpaces || []), { ...spaces.find(s => s.id === id), selectedUnits: 1 }]; updateDraftCampaign(index, updated); }} onUpdateSelectedUnits={(i, id, units) => { const updated = { ...campaign }; updated.selectedSpaces = updated.selectedSpaces.map(s => s.id === id ? { ...s, selectedUnits: units } : s); updateDraftCampaign(index, updated); }} onSearchChange={(i, query) => updateDraftCampaign(index, { ...campaign, searchQuery: query })} />
            <div className="flex mt-4">
              <button onClick={() => removeDraftCampaign(index)} className="mr-auto text-red-500 hover:text-red-700">🗑️</button>
              <button onClick={() => saveDraftCampaign(index)} className="bg-blue-500 ml-auto text-white text-xs px-4 py-1 rounded hover:bg-blue-600">Save Campaign</button>
            </div>
          </div>
        ))}
        <button onClick={addDraftCampaign} className="border px-3 py-2 rounded text-sm mt-4">+ Add Campaign</button>
      </main>

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-sm text-gray-600">Are you sure you want to delete this booking and all its associated campaigns? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 sm:gap-4">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700" onClick={() => setShowDeletePopup(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <input {...props} className="w-full border px-3 py-2 rounded mt-1" />
    </div>
  );
}