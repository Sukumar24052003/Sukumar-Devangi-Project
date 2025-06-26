

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useBookingForm } from '../context/BookingFormContext'; // ✅
import { toast } from 'sonner';

const Button = ({ children, className = '', ...props }) => (
  <button className={`px-4 py-2 rounded bg-black text-white hover: transition ${className}`} {...props}>
    {children}
  </button>
);

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white border shadow-sm rounded-xl w-full ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}
  </div>
);

export default function ProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { setBasicInfo, setOrderInfo,orderInfo, setSelectedSpaces, selectedSpaces,setBookingDates,proposalId,setProposalId } = useBookingForm();
// console.log("order info is",orderInfo);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/proposals/${id}`);
        const data = await response.json();
        console.log("Proposal data is",data);
        setProposal(data);
      } catch (error) {
        console.error('Error fetching proposal:', error);
      }
    };

    fetchProposal();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/proposals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        navigate('/proposal-dashboard');
      } else {
        toast.error('Failed to delete proposal.');
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast.error('An error occurred while deleting.');
    }
  };
  function convertToInputDateFormat(dateString) {
    // dateString is like "05-11-25"
    if (!dateString) return '';
    const [day, month, year] = dateString.split('-');
    // If year is like "25", we assume "2025"
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month}-${day}`;
  }
  
  const handleEdit=() => {
    // 1. Populate the context
    setBasicInfo({
      companyName: proposal.companyName || '',
      clientName: proposal.clientName || '',
      clientEmail: proposal.clientEmail || '',
      clientContact: proposal.clientContactNumber || '',
      clientPan: proposal.clientPanNumber || '',
      clientGst: proposal.clientGstNumber || '',
      brandName: proposal.brandName || '', // You might have it or leave ''
      clientType: proposal.clientType || '',
    });
    setProposalId(proposal._id);

    setOrderInfo({
      campaignName: proposal.campaignName || '',
      industry: proposal.industry || '',
      description: proposal.description || '',
    });

    // setSelectedSpaces(proposal.spaces || []);
    setSelectedSpaces(
      (proposal.spaces || []).map((space) => ({
        id: space._id || space.id || '',
        name: space.spaceName || '',
        status: 'Available',  // Assuming all are available initially
        facia: space.faciaTowards || '',
        city: space.city || '',
        category: space.category || '',
        subCategory: space.subCategory || '', // In your DB, you said it may be missing
        price: space.price || 0,
        availableFrom: space.dates?.[0] || '',
        availableTo: space.dates?.[1] || '',
      }))
    );
    setBookingDates({
      startDate: proposal.startDate || '',
      endDate: proposal.endDate || '',
    });
  
    // 2. Redirect to booking form
    console.log("Proposal is",proposal);
    console.log("Selected Spaces",selectedSpaces);
    if (proposal.spaces && proposal.spaces.length > 0) {
      const firstSpace = proposal.spaces[0];
      setBookingDates({
        startDate: convertToInputDateFormat(firstSpace.dates?.[0]),
        endDate: convertToInputDateFormat(firstSpace.dates?.[1]),
      });
    } else {
      setBookingDates({
        startDate: '',
        endDate: '',
      });
    }
    
    navigate('/create-booking'); 
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-xs h-screen w-screen bg-white text-black flex flex-col lg:flex-row overflow-hidden">
      <Navbar />

      <main className="flex-1 h-full overflow-y-auto px-4 md:px-6 py-6 ml-0 lg:ml-64">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-1xl md:text-2xl font-semibold">Proposal Details</h1>
          <Button onClick={() => handleEdit()}>Edit</Button>
        </div>

        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="flex flex-col gap-4 text-sm">

            <div>
              <span className="font-semibold">Company Name: </span>
              {proposal.companyName || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Client Name: </span>
              {proposal.clientName || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Client Email: </span>
              {proposal.clientEmail || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Client Contact Number: </span>
              {proposal.clientContactNumber || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Client PAN Number: </span>
              {proposal.clientPanNumber || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Client GST Number: </span>
              {proposal.clientGstNumber || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Client Type: </span>
              {proposal.clientType || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Campaign Name: </span>
              {proposal.campaignName || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Industry: </span>
              {proposal.industry || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Description: </span>
              {proposal.description || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Spaces:</span>
              {proposal.spaces && proposal.spaces.length > 0 ? (
                <div className="flex flex-col gap-4 mt-4">
                  {proposal.spaces.map((space, index) => (
                    <div key={index} className="flex flex-col p-4 border rounded-lg shadow-sm">
                      <span className="font-semibold text-sm">{space.spaceName || 'Unnamed Space'}</span>
                      <span className="text-xs text-gray-600">{space.address || 'No Address Provided'}</span>
                      <span className="text-xs text-gray-400">{space.city || 'No City Provided'}</span>

                      <div className="mt-2 text-xs text-gray-700">
                        <div><span className="font-semibold">Start Date:</span> {space.dates && space.dates[0] ? space.dates[0] : 'N/A'}</div>
                        <div><span className="font-semibold">End Date:</span> {space.dates && space.dates[1] ? space.dates[1] : 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm mt-2">No Spaces Assigned</div>
              )}
            </div>

            <div className="text-gray-400 text-xs mt-2">
              Created At: {new Date(proposal.createdAt).toLocaleString()}
            </div>

          </CardContent>
        </Card>

        <div className="flex mt-4 gap-2">
          <Button onClick={() => navigate(-1)}>Back</Button>
          
          <Button className="bg-red-600 hover:bg-red-700 ml-auto" onClick={() => setShowDeleteModal(true)}>
            Delete
          </Button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4 w-80">
              <div className="text-lg font-semibold">Confirm Deletion</div>
              <div className="text-sm text-gray-600">Are you sure you want to delete this proposal?</div>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

