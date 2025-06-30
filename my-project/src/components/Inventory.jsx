import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

// Import Leaflet for Map View and the useMap hook
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import react-date-range and its CSS
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

// Fix for default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// --- DATE FILTER COMPONENT ---
const DateRangeFilter = ({ initialFilter, onApply, onCancel }) => {
    const [tempRange, setTempRange] = useState([{
        startDate: initialFilter.startDate ? new Date(initialFilter.startDate) : new Date(),
        endDate: initialFilter.endDate ? new Date(initialFilter.endDate) : new Date(),
        key: 'selection'
    }]);

    const handleApplyClick = () => {
        const { startDate, endDate } = tempRange[0];
        if (!startDate || !endDate) {
            toast.error("Please select a valid date range.");
            return;
        }
        const formatDate = (date) => date.toISOString().split('T')[0];
        onApply({
            type: 'static',
            label: `${formatDate(startDate)} to ${formatDate(endDate)}`,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
        });
    };

    return (
        <div className="flex flex-col p-2">
            <DateRange
                editableDateInputs={true}
                onChange={item => setTempRange([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={tempRange}
                rangeColors={['#3b82f6']}
                months={1}
                direction="horizontal"
                className="static-date-range"
            />
            <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                <button onClick={onCancel} className="px-4 py-1.5 rounded-md bg-gray-200 text-black hover:bg-gray-300 font-medium text-sm">Cancel</button>
                <button onClick={handleApplyClick} className="px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm">Apply</button>
            </div>
        </div>
    );
};


// --- UI HELPER COMPONENTS ---
const Button = ({ children, className = '', ...props }) => (
  <button className={`px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800 transition ${className}`} {...props}>
    {children}
  </button>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center mt-8">
        <div className="flex gap-2 flex-wrap">
            {Array.from({ length: totalPages }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    className={`px-3 py-1 rounded-md text-sm ${i + 1 === currentPage ? 'bg-black text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'} transition`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    </div>
);

const AvailabilityBadge = ({ availabilityStatus }) => {
    let colorClasses, text;
    switch (availabilityStatus) {
        case 'Completely booked': case 'Booked':
            colorClasses = 'bg-red-100 text-red-700'; text = 'Booked'; break;
        case 'Partially available':
            colorClasses = 'bg-yellow-100 text-yellow-700'; text = 'Partially Available'; break;
        case 'Overlapping booking':
            colorClasses = 'bg-orange-100 text-orange-700'; text = 'Overlapping Booking'; break;
        case 'Completely available': default:
             colorClasses = 'bg-green-100 text-green-700'; text = 'Completely Available'; break;
    }
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorClasses}`}>{text}</span>;
};


// --- VIEW COMPONENTS ---
const InventoryGridView = ({ data, onTagUpdate, navigate }) => {
    if (!data || data.length === 0) return <div className="text-center py-10 text-gray-500">No inventories found.</div>;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.map((item) => {
                const tags = Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',').filter(tag => tag.trim() !== '');
                return (
                    <div key={item._id} className="bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md cursor-pointer transition-shadow flex flex-col" onClick={() => navigate(`/space/${item._id}`)}>
                        <img src={item.mainPhoto || 'https://via.placeholder.com/300x200'} alt="Space" className="w-full h-40 object-cover rounded-t-lg bg-gray-100" />
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="flex-grow">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-semibold text-gray-800 leading-tight">{item.spaceName}</h3>
                                    <div className="flex-shrink-0"><AvailabilityBadge availabilityStatus={item.availability} /></div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 mb-3">{item.address || 'No address provided'}</p>
                                <div className="flex gap-2 flex-wrap mb-2">
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{item.city || 'N/A'}</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">{item.spaceType || 'N/A'}</span>
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                     {tags.map((tag, idx) => (
                                        <div key={idx} className="relative group text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 flex items-center">{tag}<span onClick={(e) => { e.stopPropagation(); onTagUpdate('remove', item._id, tag); }} className="ml-1.5 text-red-500 hidden group-hover:inline cursor-pointer font-bold">×</span></div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 text-xs">
                                <input placeholder="+ Add Tag" className="px-2 py-1 w-full border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' && e.target.value.trim()) { onTagUpdate('add', item._id, e.target.value.trim()); e.target.value = ''; } }} onClick={(e) => e.stopPropagation()} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const InventoryTableView = ({ data, currentPage, limit, navigate, onTagUpdate }) => {
    if (!data || data.length === 0) return <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm">No inventories found.</div>;
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="p-4"><input type="checkbox" className="rounded border-gray-300" /></th><th scope="col" className="px-6 py-3">#</th><th scope="col" className="px-6 py-3">Space Name</th><th scope="col" className="px-6 py-3">City</th><th scope="col" className="px-6 py-3">Space Type</th><th scope="col" className="px-6 py-3">Availability</th><th scope="col" className="px-6 py-3">Price</th><th scope="col" className="px-6 py-3">Inventory ID</th><th scope="col" className="px-6 py-3">Action</th></tr></thead>
                <tbody>
                    {data.map((item, index) => {
                        const tags = Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',').filter(tag => tag.trim() !== '');
                        return (
                            <tr key={item._id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/space/${item._id}`)}>
                                <td className="w-4 p-4"><input type="checkbox" className="rounded border-gray-300" onClick={e => e.stopPropagation()} /></td>
                                <td className="px-6 py-4 text-gray-500">{(currentPage - 1) * limit + index + 1}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-start gap-3">
                                        <img src={item.mainPhoto || 'https://via.placeholder.com/40'} alt={item.spaceName} className="w-10 h-10 object-cover rounded-md bg-gray-100 flex-shrink-0" />
                                        <div className="flex flex-col gap-2">
                                            <div>
                                                <div className="font-semibold text-gray-800">{item.spaceName}</div>
                                                <div className="text-gray-500 text-xs">{item.address}</div>
                                            </div>
                                            <div className="flex gap-1.5 flex-wrap items-center">
                                                {tags.map((tag, idx) => (
                                                    <div key={idx} className="relative group text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 flex items-center">{tag}<span onClick={(e) => { e.stopPropagation(); onTagUpdate('remove', item._id, tag); }} className="ml-1 text-red-500 hidden group-hover:inline cursor-pointer font-bold">×</span></div>
                                                ))}
                                                <input placeholder="+ Tag" className="px-2 py-0.5 text-xs border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-20" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' && e.target.value.trim()) { onTagUpdate('add', item._id, e.target.value.trim()); e.target.value = ''; }}}/>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{item.city}</td><td className="px-6 py-4">{item.spaceType}</td><td className="px-6 py-4"><AvailabilityBadge availabilityStatus={item.availability} /></td>
                                <td className="px-6 py-4">{item.price != null && !isNaN(item.price) ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'N/A'}</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.inventoryId || item._id.slice(-8).toUpperCase()}</td>
                                <td className="px-6 py-4 text-center"><button onClick={(e) => { e.stopPropagation(); alert(`Actions for ${item.spaceName}`); }} className="text-gray-500 hover:text-blue-600 p-1"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

// --- CORRECTED MAP COMPONENTS ---

// 1. HELPER COMPONENT: This component automatically adjusts the map view.
const MapBoundsUpdater = ({ markers }) => {
    const map = useMap(); // Gets the current map instance

    useEffect(() => {
        // If there are no markers with valid coordinates, do nothing.
        if (!markers || markers.length === 0) {
            return; 
        }

        // Create a feature group from the marker coordinates
        const bounds = L.latLngBounds(markers.map(marker => [marker.latitude, marker.longitude]));

        // Tell the map to fit itself to those bounds
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] }); // Add padding so markers aren't on the edge
        }
    }, [markers, map]); // Reruns when markers change

    return null; // This component doesn't render any visible HTML
};

// 2. MAP VIEW COMPONENT: This now uses the helper to show all markers.
const InventoryMapView = ({ data }) => {
    // Filter for spaces that have valid, parseable coordinates
    const spacesWithCords = data
        .map(space => ({ ...space, latitude: parseFloat(space.latitude), longitude: parseFloat(space.longitude) }))
        .filter(space => !isNaN(space.latitude) && !isNaN(space.longitude));
    
    // Fallback center for when there are no markers
    const DEFAULT_CENTER = [19.0760, 72.8777]; // Mumbai

    return (
        <div className="h-[60vh] w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <MapContainer center={DEFAULT_CENTER} zoom={10} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                
                {spacesWithCords.map(item => (
                    <Marker key={item._id} position={[item.latitude, item.longitude]}>
                        <Popup><b>{item.spaceName}</b><br/>{item.address || 'No address available'}</Popup>
                    </Marker>
                ))}

                {/* This helper component will automatically fit the map to the markers */}
                <MapBoundsUpdater markers={spacesWithCords} />
            </MapContainer>
        </div>
    );
}


// --- MAIN DASHBOARD COMPONENT ---
export default function InventoryDashboard() {
    const navigate = useNavigate();
    const datePickerRef = useRef(null);

    const [spaces, setSpaces] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [viewMode, setViewMode] = useState('table');
    const limit = 10;

    const [search, setSearch] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [availability, setAvailability] = useState('');
    const [spaceType, setSpaceType] = useState('');
    const [ownershipType, setOwnershipType] = useState('');

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDateModal, setShowDateModal] = useState(false);
    
    const [dateFilter, setDateFilter] = useState({ type: 'allTime', label: 'All time', startDate: null, endDate: null });

    const fetchSpaces = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const baseParams = { search, region: selectedRegion, availability, spaceType, ownershipType, ...(dateFilter.startDate && { startDate: dateFilter.startDate }), ...(dateFilter.endDate && { endDate: dateFilter.endDate }), };
            
            // For map view, fetch all data (no pagination). For other views, use pagination.
            const finalParams = viewMode === 'map' ? baseParams : { ...baseParams, page: currentPage, limit };
            const params = new URLSearchParams(finalParams);

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/listInventory?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
            
            if (res.status === 403) { localStorage.clear(); navigate('/login'); return; }
            
            const data = await res.json();
            setSpaces(data.spaces);
            setTotalCount(data.totalCount);

        } catch (error) { toast.error("Failed to fetch inventories."); }
    }, [currentPage, search, selectedRegion, availability, spaceType, ownershipType, dateFilter, navigate, viewMode, limit]);

    useEffect(() => { fetchSpaces(); }, [fetchSpaces]);
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) setShowDateModal(false);
        }
        if (showDateModal) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDateModal]);

    const handleTagUpdate = async (action, spaceId, tag) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${spaceId}/${action}-tag`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                body: JSON.stringify({ tag })
            });
            if (res.ok) {
                toast.success(`Tag ${action === 'add' ? 'added' : 'removed'}`);
                fetchSpaces(); 
            } else { toast.error(`Failed to ${action} tag`); }
        } catch (err) { toast.error(`Error while trying to ${action} tag`); }
    };

    const handleDownloadExcel = () => {
        if (spaces.length === 0) { toast.error("No data to download."); return; }
        const excelData = spaces.map(item => ({ 'Space Name': item.spaceName, 'Address': item.address, 'City': item.city, 'State': item.state, 'Zone': item.zone, 'Space Type': item.spaceType, 'Availability': item.availability, 'Units': item.unit, 'Occupied Units': item.occupiedUnits, 'Price': item.price, 'Inventory ID': item.inventoryId || item._id, 'Tags': (Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',')).join(', ') }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventories');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'inventories.xlsx');
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/upload-excel`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            const result = await response.json();
            if (response.ok) { toast.success(`Successfully uploaded ${result.count} inventories`); setShowUploadModal(false); setSelectedFile(null); fetchSpaces(); } else { toast.error(result.error || 'Upload failed'); }
        } catch (error) { toast.error('Something went wrong while uploading'); }
    };

    const resetFilters = () => {
        setSearch(''); setSelectedRegion(''); setAvailability(''); setCurrentPage(1); setSpaceType(''); setOwnershipType('');
        setDateFilter({ type: 'allTime', label: 'All time', startDate: null, endDate: null });
    };
    
    const handleApplyDateFilter = (newFilter) => { setDateFilter(newFilter); setShowDateModal(false); }
    const handleCancelDateFilter = () => setShowDateModal(false);
    
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="min-h-screen bg-gray-50 w-screen text-black flex flex-col lg:flex-row">
            <Navbar />
            <main className="flex-1 h-screen overflow-y-auto px-4 md:px-6 py-8 ml-0 lg:ml-64">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl md:text-3xl font-sans font-normal">List of Spaces</h2>
                     <div className="flex items-center gap-2">
                        <Button onClick={() => navigate('/add-space')}>+ Add Space</Button>
                        <input type="file" accept=".xlsx, .csv" id="excel-upload" onChange={(e) => { if(e.target.files[0]) { setSelectedFile(e.target.files[0]); setShowUploadModal(true); } }} className="hidden" />
                        <label htmlFor="excel-upload" className="cursor-pointer px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800 transition">Upload Excel</label>
                        <Button onClick={handleDownloadExcel}>Download Excel</Button>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <input type="text" placeholder="Search by name, address, city, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center p-1 bg-gray-100 rounded-lg border">
                                {[{ mode: 'table', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> }, { mode: 'grid', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }, { mode: 'map', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }].map(v => ( <button key={v.mode} onClick={() => setViewMode(v.mode)} className={`p-1.5 rounded-md ${viewMode === v.mode ? 'bg-white shadow' : 'text-gray-500 hover:bg-gray-200'}`}>{v.icon}</button>))}
                            </div>
                            <button onClick={resetFilters} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">Reset Filters</button>
                        </div>
                    </div>
                     <div className="mt-4 flex flex-wrap gap-3 text-sm items-center">
                        <input className="px-3 py-2 border rounded-md w-full md:w-auto" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} placeholder="City/State/Zone" />
                        <select className="px-3 py-2 border rounded-md w-full md:w-auto bg-white" value={spaceType} onChange={(e) => setSpaceType(e.target.value)}><option value="">All Space Types</option><option value="Billboard">Billboard</option><option value="DOOH">DOOH</option><option value="Pole kiosk">Pole kiosk</option><option value="Gantry">Gantry</option></select>
                        <select className="px-3 py-2 border rounded-md w-full md:w-auto bg-white" value={ownershipType} onChange={(e) => setOwnershipType(e.target.value)}><option value="">All Ownerships</option><option value="Owned">Owned</option><option value="Leased">Leased</option><option value="Traded">Traded</option></select>
                        <select className="px-3 py-2 border rounded-md w-full md:w-auto bg-white" value={availability} onChange={(e) => setAvailability(e.target.value)}><option value="">All Availabilities</option><option value="Completely available">Completely Available</option><option value="Partially available">Partially Available</option><option value="Completely booked">Completely Booked</option><option value="Overlapping booking">Overlapping Booking</option></select>
                        <div className="relative w-full md:w-auto">
                            <button onClick={() => setShowDateModal(true)} className="px-4 py-2 border rounded-md hover:bg-gray-100 w-full text-left"><span className="text-gray-500 mr-2">Date range:</span><span className="font-medium">{dateFilter.label}</span></button>
                            {showDateModal && (<div ref={datePickerRef} className="absolute top-full mt-2 z-20 bg-white rounded-xl shadow-lg border"><DateRangeFilter initialFilter={dateFilter} onApply={handleApplyDateFilter} onCancel={handleCancelDateFilter} /></div>)}
                        </div>
                    </div>
                </div>
                
                <div className="mt-6">
                    {viewMode === 'table' && <InventoryTableView data={spaces} currentPage={currentPage} limit={limit} navigate={navigate} onTagUpdate={handleTagUpdate} />}
                    {viewMode === 'grid' && <InventoryGridView data={spaces} onTagUpdate={handleTagUpdate} navigate={navigate} />}
                    {viewMode === 'map' && <InventoryMapView data={spaces} />}
                </div>

                {totalPages > 1 && viewMode !== 'map' && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />)}

                {showUploadModal && (<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><div className="bg-white rounded-xl shadow-lg p-6 w-96"><h2 className="text-lg font-semibold mb-4">Upload Inventory Excel</h2><p className="mb-4 text-sm">Selected File: <span className="font-medium">{selectedFile?.name}</span></p><div className="flex justify-end gap-2"><button onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-md bg-gray-200 text-black hover:bg-gray-300">Cancel</button><button onClick={handleConfirmUpload} className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-900">Save & Upload</button></div></div></div>)}
            </main>
        </div>
    );
}