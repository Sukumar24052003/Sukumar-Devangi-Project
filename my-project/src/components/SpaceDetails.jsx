import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

// --- Import Leaflet for Map View and the useMap hook ---
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Fix for default Leaflet marker icon issue ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// --- SOLUTION: Robust Map Controller Component ---
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    // A small timeout helps ensure the container div has been sized.
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setView(center, zoom);
    }, 100);

    return () => clearTimeout(timer);
  }, [map, center, zoom]);

  return null;
}


// Reusable component for Key-Value display
const DetailItem = ({ label, value, className = '' }) => (
  <div className={`mb-3 ${className}`}>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm text-gray-800 break-words">{value || 'N/A'}</p>
  </div>
);

export default function SpaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Handlers and other functions remain the same
  const handleDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Space deleted successfully!');
        navigate('/inventory'); // Navigate to inventory list after delete
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete space' }));
        toast.error(errorData.message || 'Failed to delete space.');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while deleting the space.');
    } finally {
      setShowModal(false);
    }
  };

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        setSpace(data);
      } catch (error) {
        toast.error(error.message || 'Could not load space details.');
      }
    };
    fetchSpace();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const day = parts[0]; const month = parts[1]; let year = parts[2];
        if (year.length === 2) year = `20${year}`;
        const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'});
      }
      return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'});
    } catch (e) { return dateString; }
  };
  
  if (!space) {
    return (
      <div className="min-h-screen h-full w-full bg-gray-100 text-black flex flex-col lg:flex-row overflow-x-hidden">
        <Navbar />
        <main className="flex-1 flex items-center justify-center ml-0 lg:ml-64 p-6">
            <div className="text-xl text-gray-600">Loading space details...</div>
        </main>
      </div>
    );
  }

  const lat = parseFloat(space?.latitude);
  const lon = parseFloat(space?.longitude);
  const hasCoordinates = !isNaN(lat) && !isNaN(lon);
  
  // **THE FIX**: Create a unified image array.
  // Use the `images` array if it exists and has content.
  // Otherwise, fall back to using the `mainPhoto` if it exists.
  // If neither exists, it's an empty array.
  const displayImages = (space.images && space.images.length > 0)
    ? space.images
    : (space.mainPhoto ? [space.mainPhoto] : []);


  return (
    <div className="min-h-screen h-screen w-screen bg-gray-100 text-black flex flex-col ">
      <Navbar />
      <main className="flex-1 overflow-y-auto px-4 md:px-10 py-8 ml-0 lg:ml-64 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
            <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-700 hover:text-black hover:underline flex items-center"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
            </button>
            <button
                onClick={() => navigate(`/space/${id}/edit`)}
                className="text-xs text-white bg-black px-4 py-2 rounded-md hover:bg-gray-800"
            >
            Edit Space
            </button>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            <div className="mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{space.spaceName || 'Unnamed Space'}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {space.address || 'N/A Address'}, {space.city || 'N/A City'}, {space.state || 'N/A State'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 mb-6">
              <DetailItem label="Category" value={space.category} />
              <DetailItem label="Space Type" value={space.spaceType} />
              <DetailItem label="Price" value={`₹${space.price?.toLocaleString() || 'N/A'}`} />
              <DetailItem label="Footfall" value={space.footfall?.toLocaleString() || 'N/A'} />
              <DetailItem label="Audience" value={space.audience} />
              <DetailItem label="Demographics" value={space.demographics} />
              <DetailItem label="Zone" value={space.zone} />
              <DetailItem label="Facing" value={space.facing} />
              <DetailItem label="Facia Towards" value={space.faciaTowards} />
              <DetailItem label="Tier" value={space.tier} />
              <DetailItem label="Latitude" value={space.latitude} />
              <DetailItem label="Longitude" value={space.longitude} />
              <DetailItem label="Available From" value={formatDate(space.dates?.[0])} />
              <DetailItem label="Available To" value={formatDate(space.dates?.[1])} />
              <DetailItem label="Total Units" value={space.unit} />
              <DetailItem label="Occupied Units" value={space.occupiedUnits || 0} />
            </div>

            {space.description && (
                <div className="mt-2 mb-6">
                  <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</h2>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{space.description}</p>
                </div>
            )}
            
            {hasCoordinates && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Location on Map</h2>
                    <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <MapContainer 
                            key={`${lat}-${lon}`} 
                            center={[lat, lon]} 
                            zoom={15} 
                            scrollWheelZoom={true} 
                            style={{ height: '100%', width: '100%' }}
                        >
                            <MapController center={[lat, lon]} zoom={15} />
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[lat, lon]}>
                                <Popup>
                                    <div className="text-sm">
                                        <b className="text-base">{space.spaceName}</b><br />
                                        {space.address}<hr className="my-2" />
                                        Lat: {lat.toFixed(6)}<br />
                                        Lon: {lon.toFixed(6)}
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
            )}

            <hr className="my-8 border-gray-200" />

            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Space Images</h2>
              {displayImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayImages.map((image, index) => (
                    <a 
                      key={index} 
                      href={image.startsWith('http') ? image : `${import.meta.env.VITE_API_BASE_URL}${image}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block relative group overflow-hidden rounded-lg shadow-md"
                    >
                      <img
                        src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_BASE_URL}${image}`}
                        alt={`Space image ${index + 1} for ${space.spaceName}`}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No images available for this space.</p>
              )}
            </div>
        </div>

        <div className="flex text-xs gap-4 mt-8 pt-6 border-t border-gray-300">
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-150"
          >
            Delete Space
          </button>
        </div>

      </main>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
            <p className="text-sm text-gray-600">Are you sure you want to delete "{space.spaceName || 'this space'}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150"
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