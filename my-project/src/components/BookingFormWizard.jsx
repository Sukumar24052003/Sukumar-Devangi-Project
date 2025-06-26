import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { useBookingForm } from '../context/BookingFormContext';
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
  <div className={`p-4 ${className}`}>{children}</div>
);

export default function BookingFormWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { basicInfo, setBasicInfo, orderInfo, setOrderInfo, selectedSpaces, setSelectedSpaces } = useBookingForm();

  const [step, setStep] = useState('Basic');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const stepOrder = ['Basic', 'Order', 'Spaces'];

  const totalPrice = selectedSpaces.reduce((sum, space) => sum + (space.price || 0), 0);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces`);
      const data = await res.json();
      const availableSpaces = data.filter(space => space.available);
      const transformed = availableSpaces.map(space => ({
        id: space._id,
        name: space.spaceName || '-',
        status: space.available ? 'Available' : 'Unavailable',
        facia: space.faciaTowards || '-',
        city: space.city || '-',
        category: space.category || '-',
        subCategory: space.subCategory || '-',
        price: space.price || 0,
        availableFrom: space.dates?.[0] || '',
        availableTo: space.dates?.[space.dates.length - 1] || ''
      }));
      setSpaces(transformed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooking = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}`);
      const data = await res.json();
      setBooking(data);
    } catch (err) {
      console.error('Fetch booking failed', err);
    }
  };

  useEffect(() => {
    if (step === 'Spaces') fetchSpaces();
    if (step === 'Details') fetchBooking();
  }, [step]);

  const toggleSpaceSelection = (id) => {
    const exists = selectedSpaces.find(s => s.id === id);
    if (exists) {
      setSelectedSpaces(selectedSpaces.filter(s => s.id !== id));
    } else {
      const space = spaces.find(s => s.id === id);
      setSelectedSpaces([...selectedSpaces, space]);
    }
  };

  const isSpaceAvailableInRange = (space) => {
    if (!startDate || !endDate) return true;
    const start = new Date(startDate), end = new Date(endDate);
    const spaceStart = new Date(space.availableFrom), spaceEnd = new Date(space.availableTo);
    return spaceStart <= end && spaceEnd >= start;
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Booking deleted successfully');
        navigate('/booking-dashboard');
      } else {
        toast.error('Failed to delete booking');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'Basic':
        return (
          <div className="grid grid-cols-2 text-xs gap-6">
            {[
              ['Company Name', 'companyName', true],
              ['Client Name', 'clientName', true],
              ['Client Email', 'clientEmail'],
              ['Client Contact Number', 'clientContact'],
              ['Client Pan Number', 'clientPan'],
              ['Client GST Number', 'clientGst'],
              ['Brand Display Name', 'brandName'],
            ].map(([label, key, required]) => (
              <div key={key}>
                <label className="block text-xs font-medium">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  className="w-full p-2 border rounded mt-1"
                  placeholder="Write..."
                  value={basicInfo[key] || ''}
                  onChange={(e) => setBasicInfo({ ...basicInfo, [key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium">
                Client Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-2 border rounded mt-1"
                value={basicInfo.clientType}
                onChange={(e) => setBasicInfo({ ...basicInfo, clientType: e.target.value })}
              >
                <option>Select...</option>
                <option>Corporate</option>
                <option>Agency</option>
              </select>
            </div>
          </div>
        );
      case 'Spaces':
        return (
          <>
            <div className="grid grid-cols-2 gap-4 mr-20 mb-6">
              <div className="w-[50%]">
                <label className="text-xs font-medium">Start Date</label>
                <input type="date" className="w-full border px-2 py-1 rounded mt-1" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="w-[50%]">
                <label className="text-xs font-medium">End Date</label>
                <input type="date" className="w-full border px-2 py-1 rounded mt-1" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="font-medium text-sm mb-4">
              Selected Places: {selectedSpaces.length} <br />
              Total Price: ₹{totalPrice.toLocaleString()} + inclusive of GST
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Space Name</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Facia Towards</th>
                      <th className="px-4 py-2">City</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Sub Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spaces.filter(isSpaceAvailableInRange).map((space, idx) => (
                      <tr key={space.id} className="border-t text-center">
                        <td><input type="checkbox" checked={selectedSpaces.some(s => s.id === space.id)} onChange={() => toggleSpaceSelection(space.id)} /></td>
                        <td className="px-2 py-2 text-left">{space.name}</td>
                        <td className="px-2 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${space.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {space.status}
                          </span>
                        </td>
                        <td className="px-2 py-2">{space.facia}</td>
                        <td className="px-2 py-2">{space.city}</td>
                        <td className="px-2 py-2"><span className="text-xs rounded-full px-2 py-1 bg-green-100 text-green-700">{space.category}</span></td>
                        <td className="px-2 py-2"><span className="text-xs rounded-full px-2 py-1 bg-red-100 text-red-700">{space.subCategory || '-'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        );
      case 'Details':
        return booking ? (
          <Card>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div><strong>Company Name:</strong> {booking.companyName || 'N/A'}</div>
              <div><strong>Client Name:</strong> {booking.clientName || 'N/A'}</div>
              <div><strong>Client Email:</strong> {booking.clientEmail || 'N/A'}</div>
              <div><strong>Campaign Name:</strong> {booking.campaignName || 'N/A'}</div>
              <div><strong>Brand Display Name:</strong> {booking.brandDisplayName || 'N/A'}</div>
              <div><strong>Client Type:</strong> {booking.clientType || 'N/A'}</div>
              <div><strong>Industry:</strong> {booking.industry || 'N/A'}</div>
              <div><strong>Description:</strong> {booking.description || 'N/A'}</div>
              <div><strong>Created At:</strong> {new Date(booking.createdAt).toLocaleString()}</div>
            </CardContent>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setStep('Spaces')}>Back</Button>
              <Button className="ml-auto bg-red-600 hover:bg-red-700" onClick={() => setShowDeletePopup(true)}>Delete</Button>
            </div>
          </Card>
        ) : <div>Loading...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white text-xs min-h-screen">
      <Navbar />
      <main className="ml-64 w-full flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Create Order</h1>
        <div className="flex gap-6 mb-6 text-sm font-medium">
          {stepOrder.map(label => (
            <div key={label} className={(step === label || completedSteps.includes(label)) ? 'text-black flex items-center gap-1' : 'text-black flex items-center gap-1'}>
              ✓ {label === 'Basic' ? 'Basic Information' : label === 'Order' ? 'Order Information' : 'Select Spaces'}
            </div>
          ))}
        </div>

        {renderStep()}

        {step !== 'Details' && (
          <div className="mt-8 text-sm flex">
            <button className="px-1 py-0 border rounded mr-auto" onClick={() => setStep('Basic')}>Cancel</button>
            <div className="px-4 py-2">
              {step !== 'Spaces' ? (
                <button onClick={() => setStep(stepOrder[stepOrder.indexOf(step) + 1])} className="px-3 py-1 bg-black text-white rounded">
                  Next
                </button>
              ) : (
                <button onClick={() => setStep('Details')} className="px-3 py-1 bg-black text-white rounded">
                  Preview
                </button>
              )}
            </div>
          </div>
        )}

        {/* Delete Popup */}
        {showDeletePopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl p-6 w-80 text-center">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this booking?</p>
              <div className="flex justify-center gap-4">
                <Button className="bg-gray-400 hover:bg-gray-500" onClick={() => setShowDeletePopup(false)}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
