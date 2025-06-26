// src/pages/CampaignDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import CampaignPipeline from './CampaignPipeline';
import { PieChart } from '@mui/x-charts/PieChart';
import { toast } from 'sonner';

const KeyValueItem = ({ label, value, icon, className = "", iconClassName = "text-blue-600" }) => (
    <div className={`py-1 ${className}`}>
        <div className="flex items-center mb-0.5">
            {icon && <span className={`${iconClassName} mr-2 text-md`}>{icon}</span>}
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        </div>
        <p className={`text-sm text-gray-700 break-words ${icon ? 'pl-[calc(1rem+0.5rem)]' : 'pl-0'}`}>
            {value || 'N/A'}
        </p>
    </div>
);

export default function CampaignDetails() {
    const { id } = useParams();
    const [campaignData, setCampaignData] = useState(null);
    const [pipelineData, setPipelineData] = useState(null);
    const [spaceDetails, setSpaceDetails] = useState([]);
    const [inventoryCosts, setInventoryCosts] = useState([]);
    const [activeTab, setActiveTab] = useState('Details');
    const [editableSpaces, setEditableSpaces] = useState(new Set());

    // --- FIX 1: Add explicit loading and error states ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            // Start in a clean state
            setLoading(true);
            setError(null);
            
            try {
                // Fetch all data concurrently for better performance
                const [campaignRes, pipelineRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/campaign/${id}`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${id}`)
                ]);

                if (!campaignRes.ok) {
                    throw new Error(`Failed to fetch campaign details (Status: ${campaignRes.status})`);
                }
                
                const campaign = await campaignRes.json();
                const pipeline = pipelineRes.ok ? await pipelineRes.json() : null;

                // Now fetch the details for the spaces within the campaign
                const fetchedSpaces = await Promise.all(
                    (campaign.spaces || []).map(async (space) => {
                        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${space.id}`);
                        if (!res.ok) {
                           console.error(`Failed to fetch details for space ID: ${space.id}`);
                           return null; // Return null for failed fetches
                        }
                        const details = await res.json();
                        return { ...details, selectedUnits: space.selectedUnits };
                    })
                );

                // Set all states at once after all data is fetched
                setCampaignData(campaign);
                setPipelineData(pipeline);
                setInventoryCosts(campaign.inventoryCosts || []);
                setSpaceDetails(fetchedSpaces.filter(s => s !== null)); // Filter out any failed fetches

            } catch (err) {
                console.error('Failed to load campaign data:', err);
                setError(err.message);
                toast.error(err.message);
            } finally {
                // --- FIX 2: Set loading to false only after ALL async operations are complete ---
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);
    
    // ... other helper functions (formatDate, getCostItem, etc.) remain the same
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN');

    const getCostItem = (spaceId) => inventoryCosts.find(cost => cost.id === spaceId || cost.id?._id === spaceId);

    const updateCostField = (spaceId, field, value) => {
        setInventoryCosts(prev => {
            const index = prev.findIndex(cost => cost.id === spaceId || cost.id?._id === spaceId);
            const updated = [...prev];
            const space = spaceDetails.find(s => s._id === spaceId || s._id?.toString() === spaceId.toString());
            const computedArea = (space?.width || 0) * (space?.height || 0);

            if (index !== -1) {
                const updatedItem = { ...updated[index], [field]: value };
                if (field !== 'area') updatedItem.area = computedArea;
                updated[index] = updatedItem;
            } else {
                updated.push({
                    id: spaceId,
                    displayCost: field === 'displayCost' ? value : 0,
                    printingcostpersquareFeet: field === 'printingcostpersquareFeet' ? value : 0,
                    mountingcostpersquareFeet: field === 'mountingcostpersquareFeet' ? value : 0,
                    area: field === 'area' ? value : computedArea
                });
            }
            return updated;
        });
    };

    const resetCostItem = (spaceId) => setEditableSpaces(prev => new Set(prev).add(spaceId));

    const handleSaveCostForSpace = async (spaceId) => {
        const cost = getCostItem(spaceId);
        if (!cost) { toast.error('No cost data to save'); return; }

        try {
            const updatedCosts = inventoryCosts.map(c => (c.id === spaceId || c.id?._id === spaceId) ? cost : c);
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${id}/update-costs`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventoryCosts: updatedCosts }),
            });

            if (!res.ok) throw new Error('Failed to save costs');
            toast.success('Costs saved for this space!');
            setEditableSpaces(prev => {
                const updated = new Set(prev);
                updated.delete(spaceId);
                return updated;
            });
        } catch (err) {
            console.error(err);
            toast.error('Error saving costs for this space.');
        }
    };
    
    // --- FIX 3: Render logic based on the new loading/error states ---
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <p className="text-lg">Loading Campaign Details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <p className="text-lg text-red-500">Error: {error}</p>
            </div>
        );
    }

    if (!campaignData) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <p className="text-lg text-gray-500">Campaign not found.</p>
            </div>
        );
    }
    
    // Now we can safely destructure
    const { campaignName, description, startDate, endDate } = campaignData;
    
    return (
        <div className="text-xs min-h-screen w-screen text-black flex flex-col lg:flex-row ">
            <Navbar />
            <main className="ml-64 w-full flex-1 px-8 py-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl ">Campaign : {campaignName}</h2>
                </div>

                <div className="flex space-x-4 mb-4 border-b">
                    {['Details', 'Pipeline'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Pipeline' && <CampaignPipeline campaignId={campaignData._id} />}

                {activeTab === 'Details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {/* Campaign Info & Payment Card */}
                        <div className="bg-white shadow-md border rounded-xl p-6 lg:col-span-1">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Campaign Info</h2>
                                <div className="space-y-3">
                                    <KeyValueItem label="Description" value={description}/>
                                    <KeyValueItem label="Start Date" value={formatDate(startDate)} />
                                    <KeyValueItem label="End Date" value={formatDate(endDate)} />
                                </div>
                            </div>
                            {pipelineData?.payment && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Overview</h3>
                                    <div className="flex items-center gap-4">
                                      <div className="w-1/2">
                                        <PieChart series={[{ data: [{ id: 0, value: pipelineData.payment.totalPaid, label: 'Paid' }, { id: 1, value: pipelineData.payment.paymentDue, label: 'Due' }], innerRadius: 30, outerRadius: 50, }]} height={120} />
                                      </div>
                                      <div className="text-xs space-y-1 w-1/2">
                                          <p><strong>Total:</strong> ₹{pipelineData.payment.totalAmount || 0}</p>
                                          <p><strong>Paid:</strong> ₹{pipelineData.payment.totalPaid || 0}</p>
                                          <p><strong>Due:</strong> ₹{pipelineData.payment.paymentDue || 0}</p>
                                      </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Spaces Cards */}
                        {spaceDetails.map((space, index) => {
                            const cost = getCostItem(space._id);
                            const computedArea = space.width * space.height;
                            const displayCost = cost?.displayCost || 0;
                            const printingCost = cost?.printingcostpersquareFeet || 0;
                            const mountingCost = cost?.mountingcostpersquareFeet || 0;
                            const area = cost?.area || computedArea || 0;
                            const totalCost = displayCost + (printingCost * area) + (mountingCost * area);
                            const isEditable = editableSpaces.has(space._id);
                            return (
                                <div key={space._id || index} className="bg-white shadow-md border rounded-xl p-6">
                                    <h2 className="text-base font-semibold mb-3">Space {index + 1}: {space.spaceName}</h2>
                                    {space.mainPhoto && <img src={space.mainPhoto} alt="Main" className="w-full h-32 object-cover rounded border mb-4"/>}
                                    <div className="text-sm space-y-2 mb-4">
                                        <p><strong>Location:</strong> {space.city}, {space.state}</p>
                                        <p><strong>Type:</strong> {space.spaceType}</p>
                                        <p><strong>Selected Units:</strong> {space.selectedUnits} / {space.unit}</p>
                                        <p><strong>Availability:</strong> {space.availability}</p>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <div className="space-y-2">
                                            {['displayCost', 'printingcostpersquareFeet', 'mountingcostpersquareFeet', 'area'].map(field => (
                                                <label key={field} className="flex items-center justify-between text-xs">
                                                    <span>{field.replace(/([A-Z])/g, ' $1').replace('persquare Feet','/sq.ft.').replace(/^./, str => str.toUpperCase())}:</span>
                                                    <input type="number" className="border rounded px-2 py-1 w-24" value={cost?.[field] ?? (field === 'area' ? computedArea : 0)} onChange={(e) => updateCostField(space._id, Number(e.target.value))} readOnly={!isEditable}/>
                                                </label>
                                            ))}
                                            <p className="font-bold text-sm pt-2 text-right">Total: ₹{totalCost.toFixed(2)}</p>
                                        </div>
                                        <div className="flex w-full gap-2 mt-4">
                                            <button onClick={() => resetCostItem(space._id)} className="text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                                            <button onClick={() => handleSaveCostForSpace(space._id)} className="text-xs ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400" disabled={!isEditable}>Save</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}