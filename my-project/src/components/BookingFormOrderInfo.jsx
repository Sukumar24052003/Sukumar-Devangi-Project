

// import React, { useEffect, useState } from 'react';
// import Navbar from './Navbar';
// import { useNavigate } from 'react-router-dom';
// import { useBookingForm } from '../context/BookingFormContext';
// import InventorySelector from './BookingFormAddSpaces';


// function Stepper({ currentStep }) {
//   const stepOrder = ['Basic', 'Order'];

//   return (
//     <div className="flex gap-6 mb-6 text-sm font-medium">
//       {stepOrder.map((label, idx) => {
//         const isCompleted = stepOrder.indexOf(currentStep) > idx;
//         const isActive = currentStep === label;

//         return (
//           <div
//             key={label}
//             className={`flex items-center gap-2 pb-1 ${
//               isCompleted ? 'text-green-600' : isActive ? 'text-black border-b-2 border-black' : 'text-gray-500'
//             }`}
//           >
//             {isCompleted && (
//               <span className="text-green-600">✔</span>
//             )}
//             <span>
//               {label === 'Basic' ? 'Basic Information' : 'Order Information'}
//             </span>
//           </div>
//         );
//       })}
//     </div>
//   );
// }


// export default function BookingFormOrderInfo() {
//   const navigate = useNavigate();
//   const { orderInfo, setOrderInfo } = useBookingForm();
//   const [spaces, setSpaces] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSpaces = async () => {
//       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces`);
//       const data = await res.json();
//       const transformed = data.map(space => ({
//         id: space._id,
//         name: space.spaceName,
//         facia: space.faciaTowards,
//         city: space.city,
//         category: space.category,
//         spaceType: space.spaceType,
//         unit: space.unit,
//         occupiedUnits: space.occupiedUnits,
//         ownershipType:space.ownershipType,
//         price: space.price,
//         traded: space.traded,
//         overlappingBooking: space.overlappingBooking,
//         availableFrom: space.dates?.[0],
//         availableTo: space.dates?.[space.dates.length - 1],
//         status: space.occupiedUnits === 0 ? 'Completely available' :
//                 space.occupiedUnits < space.unit ? 'Partialy available' : 'Completely booked'
//       }));
//       setSpaces(transformed);
//       setLoading(false);
//     };
//     fetchSpaces();
//   }, []);

//   const computeGlobalAvailability = () => {
//     const availabilityMap = {};
//     orderInfo.campaigns.forEach(campaign => {
//       campaign.selectedSpaces?.forEach(space => {
//         if (!availabilityMap[space.id]) {
//           availabilityMap[space.id] = 0;
//         }
//         availabilityMap[space.id] += space.selectedUnits;
//       });
//     });
//     return availabilityMap;
//   };

//   const globalAvailability = computeGlobalAvailability();

//   const updateCampaign = (index, updatedCampaign) => {
//     const campaigns = orderInfo.campaigns.map((c, i) => i === index ? updatedCampaign : c);
//     setOrderInfo({ ...orderInfo, campaigns });
//   };

//   const handleCampaignChange = (index, e) => {
//     const { name, value } = e.target;
//     updateCampaign(index, { ...orderInfo.campaigns[index], [name]: value });
//   };

//   const toggleSpaceSelection = (campaignIndex, spaceId) => {
//     const campaign = orderInfo.campaigns[campaignIndex];
//     const exists = campaign.selectedSpaces?.find(s => s.id === spaceId);
//     const updatedSelectedSpaces = exists
//       ? campaign.selectedSpaces.filter(s => s.id !== spaceId)
//       : [...(campaign.selectedSpaces || []), { ...spaces.find(s => s.id === spaceId), selectedUnits: 1 }];
//     updateCampaign(campaignIndex, { ...campaign, selectedSpaces: updatedSelectedSpaces });
//   };

//   const updateSelectedUnits = (campaignIndex, spaceId, units) => {
//     const campaign = orderInfo.campaigns[campaignIndex];
//     const updatedSpaces = campaign.selectedSpaces.map(s =>
//       s.id === spaceId ? { ...s, selectedUnits: units } : s
//     );
//     updateCampaign(campaignIndex, { ...campaign, selectedSpaces: updatedSpaces });
//   };

//   const handleSearchChange = (index, value) => {
//     updateCampaign(index, { ...orderInfo.campaigns[index], searchQuery: value });
//   };

//   const addCampaign = () => {
//     setOrderInfo({ ...orderInfo, campaigns: [...(orderInfo.campaigns || []), {
//       campaignName: '', industry: '', description: '', startDate: '', endDate: '', selectedSpaces: [], searchQuery: '', isSaved: false
//     }] });
//   };

//   const deleteCampaign = (index) => {
//     const updatedCampaigns = orderInfo.campaigns.filter((_, i) => i !== index);
//     setOrderInfo({ ...orderInfo, campaigns: updatedCampaigns });
//   };

//   const saveCampaign = (index) => {
//     updateCampaign(index, { ...orderInfo.campaigns[index], isSaved: true });
//   };

//   const editCampaign = (index) => {
//     updateCampaign(index, { ...orderInfo.campaigns[index], isSaved: false });
//   };

//   const handleNext = () => navigate('/booking-preview');
//   const handleBack = () => navigate('/create-booking');

//   return (
//     <div className="p-6 md:ml-64 min-h-screen">
//       <Navbar />
//       <Stepper currentStep="Order" />
//       <h2 className="text-2xl font-semibold mb-6">Create Order</h2>

//       {loading ? <p>Loading spaces...</p> : (
//         <>
//           {orderInfo.campaigns?.map((campaign, index) => (
//             <div key={index} className="relative border rounded p-4 mb-6 shadow-sm">
//               {campaign.isSaved ? (
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h3 className="font-semibold">{campaign.campaignName}</h3>
//                     <p className="text-xs">Industry: {campaign.industry}</p>
//                     <p className="text-xs">From {campaign.startDate} to {campaign.endDate}</p>
//                   </div>
//                   <div className="space-x-2">
//                     <button onClick={() => editCampaign(index)} className="text-xs border px-3 py-1 rounded">Edit</button>
//                     <button onClick={() => deleteCampaign(index)} className="text-xs border px-3 py-1 rounded text-red-500">Delete</button>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="grid grid-cols-2 gap-4">
//                     <Input label="Campaign Name" name="campaignName" value={campaign.campaignName} onChange={(e) => handleCampaignChange(index, e)} />
//                     <Input label="Industry" name="industry" value={campaign.industry} onChange={(e) => handleCampaignChange(index, e)} />
//                     <Input label="Start Date" name="startDate" type="date" value={campaign.startDate} onChange={(e) => handleCampaignChange(index, e)} />
//                     <Input label="End Date" name="endDate" type="date" value={campaign.endDate} onChange={(e) => handleCampaignChange(index, e)} />
//                     <div className="col-span-2">
//                       <label className="text-xs font-medium">Description</label>
//                       <textarea name="description" value={campaign.description} onChange={(e) => handleCampaignChange(index, e)} className="w-full border rounded p-2" />
//                     </div>
//                   </div>

//                   <InventorySelector
//                     campaignIndex={index}
//                     campaign={campaign}
//                     spaces={spaces}
//                     globalAvailability={globalAvailability}
//                     startDate={campaign.startDate}
//                     endDate={campaign.endDate}
//                     onToggleSpaceSelection={toggleSpaceSelection}
//                     onUpdateSelectedUnits={updateSelectedUnits}
//                     onSearchChange={handleSearchChange}
//                   />

//                   <div className="flex mt-4">
//                     <button onClick={() => deleteCampaign(index)} className="mr-auto text-red-500 hover:text-red-700">🗑️</button>
//                     <button
//                       onClick={() => saveCampaign(index)}
//                       className="bg-blue-500 ml-auto text-white text-xs px-4 py-1 rounded hover:bg-blue-600"
//                     >
//                       Save Campaign
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           ))}

//           <button onClick={addCampaign} className="border px-3 py-2 rounded text-sm">+ Add Campaign</button>
//         </>
//       )}

//       <div className=" flex justify-between mt-6">
//         <button onClick={handleBack} className="mr-auto border px-3 py-1 rounded">Back</button>
//         <button onClick={handleNext} className=" ml-auto bg-black text-white px-3 py-1 rounded">Next</button>
//       </div>
   


//     </div>
//   );
// }

// function Input({ label, ...props }) {
//   return (
//     <div>
//       <label className="text-xs font-medium">{label}</label>
//       <input {...props} className="w-full border px-3 py-2 rounded mt-1" />
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { useBookingForm } from '../context/BookingFormContext';
import InventorySelector from './BookingFormAddSpaces';

function Stepper({ currentStep }) {
  const stepOrder = ['Basic', 'Order'];
  return (
    <div className="flex gap-6 mb-6 text-sm font-medium">
      {stepOrder.map((label, idx) => {
        const isCompleted = stepOrder.indexOf(currentStep) > idx;
        const isActive = currentStep === label;

        return (
          <div
            key={label}
            className={`flex items-center gap-2 pb-1 ${
              isCompleted ? 'text-green-600' : isActive ? 'text-black border-b-2 border-black' : 'text-gray-500'
            }`}
          >
            {isCompleted && <span className="text-green-600">✔</span>}
            <span>{label === 'Basic' ? 'Basic Information' : 'Order Information'}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function BookingFormOrderInfo() {
  const navigate = useNavigate();
  const { orderInfo, setOrderInfo } = useBookingForm();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/selectcampaignSpaces`);
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
        mainPhoto:space.mainPhoto,
        overlappingBooking: space.overlappingBooking,
        availableFrom: space.dates?.[0],
        availableTo: space.dates?.[space.dates.length - 1],
        status: space.occupiedUnits === 0
          ? 'Completely available'
          : space.occupiedUnits < space.unit
          ? 'Partialy available'
          : 'Completely booked'
      }));
      setSpaces(transformed);
      setLoading(false);
    };
    fetchSpaces();
  }, []);

  const computeGlobalAvailability = () => {
    const availabilityMap = {};
    orderInfo.campaigns.forEach(campaign => {
      campaign.selectedSpaces?.forEach(space => {
        if (!availabilityMap[space.id]) {
          availabilityMap[space.id] = 0;
        }
        availabilityMap[space.id] += space.selectedUnits;
      });
    });
    return availabilityMap;
  };

  const globalAvailability = computeGlobalAvailability();

  const updateCampaign = (index, updatedCampaign) => {
    const campaigns = orderInfo.campaigns.map((c, i) => i === index ? updatedCampaign : c);
    setOrderInfo({ ...orderInfo, campaigns });
  };

  const handleCampaignChange = (index, e) => {
    const { name, value } = e.target;
    updateCampaign(index, { ...orderInfo.campaigns[index], [name]: value });
  };

  const toggleSpaceSelection = (campaignIndex, spaceId) => {
    const campaign = orderInfo.campaigns[campaignIndex];
    const exists = campaign.selectedSpaces?.find(s => s.id === spaceId);
    const updatedSelectedSpaces = exists
      ? campaign.selectedSpaces.filter(s => s.id !== spaceId)
      : [...(campaign.selectedSpaces || []), { ...spaces.find(s => s.id === spaceId), selectedUnits: 1 }];
    updateCampaign(campaignIndex, { ...campaign, selectedSpaces: updatedSelectedSpaces });
  };

  const updateSelectedUnits = (campaignIndex, spaceId, units) => {
    const campaign = orderInfo.campaigns[campaignIndex];
    const updatedSpaces = campaign.selectedSpaces.map(s =>
      s.id === spaceId ? { ...s, selectedUnits: units } : s
    );
    updateCampaign(campaignIndex, { ...campaign, selectedSpaces: updatedSpaces });
  };

  const handleSearchChange = (index, value) => {
    updateCampaign(index, { ...orderInfo.campaigns[index], searchQuery: value });
  };

  const addCampaign = () => {
    setOrderInfo({
      ...orderInfo,
      campaigns: [
        ...(orderInfo.campaigns || []),
        {
          campaignName: '',
          industry: '',
          description: '',
          startDate: '',
          endDate: '',
          selectedSpaces: [],
          searchQuery: '',
          isSaved: false
        }
      ]
    });
  };

  const deleteCampaign = (index) => {
    const updatedCampaigns = orderInfo.campaigns.filter((_, i) => i !== index);
    setOrderInfo({ ...orderInfo, campaigns: updatedCampaigns });
  };

  const saveCampaign = (index) => {
    updateCampaign(index, { ...orderInfo.campaigns[index], isSaved: true });
  };

  const editCampaign = (index) => {
    updateCampaign(index, { ...orderInfo.campaigns[index], isSaved: false });
  };

  const handleNext = () => navigate('/booking-preview');
  const handleBack = () => navigate('/create-booking');

  return (
    <div className="p-6 md:ml-64 min-h-screen">
      <Navbar />
      <Stepper currentStep="Order" />
      <h2 className="text-2xl font-semibold mb-6">Create Order</h2>

      {loading ? (
        <p>Loading spaces...</p>
      ) : (
        <>
          {orderInfo.campaigns?.map((campaign, index) => (
            <div key={index} className="relative border rounded p-4 mb-6 shadow-sm">
              {campaign.isSaved ? (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{campaign.campaignName}</h3>
                    <p className="text-xs">Industry: {campaign.industry}</p>
                    <p className="text-xs">
                      From {campaign.startDate} to {campaign.endDate}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => editCampaign(index)}
                      className="text-xs border px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCampaign(index)}
                      className="text-xs border px-3 py-1 rounded text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Campaign Name"
                      name="campaignName"
                      value={campaign.campaignName}
                      onChange={(e) => handleCampaignChange(index, e)}
                    />
                    <Input
                      label="Industry"
                      name="industry"
                      value={campaign.industry}
                      onChange={(e) => handleCampaignChange(index, e)}
                    />
                    <Input
                      label="Start Date"
                      name="startDate"
                      type="date"
                      value={campaign.startDate}
                      onChange={(e) => handleCampaignChange(index, e)}
                    />
                    <Input
                      label="End Date"
                      name="endDate"
                      type="date"
                      value={campaign.endDate}
                      onChange={(e) => handleCampaignChange(index, e)}
                    />
                    <div className="col-span-2">
                      <label className="text-xs font-medium">Description</label>
                      <textarea
                        name="description"
                        value={campaign.description}
                        onChange={(e) => handleCampaignChange(index, e)}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>

                  <InventorySelector
                    campaignIndex={index}
                    campaign={campaign}
                    spaces={spaces}
                    globalAvailability={globalAvailability}
                    startDate={campaign.startDate}
                    endDate={campaign.endDate}
                    onToggleSpaceSelection={toggleSpaceSelection}
                    onUpdateSelectedUnits={updateSelectedUnits}
                    onSearchChange={handleSearchChange}
                  />

                  <div className="flex mt-4">
                    <button
                      onClick={() => deleteCampaign(index)}
                      className="mr-auto text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => saveCampaign(index)}
                      className="bg-blue-500 ml-auto text-white text-xs px-4 py-1 rounded hover:bg-blue-600"
                    >
                      Save Campaign
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          <button onClick={addCampaign} className="border px-3 py-2 rounded text-sm">
            + Add Campaign
          </button>
        </>
      )}

      <div className="flex justify-between mt-6">
        <button onClick={handleBack} className="mr-auto border px-3 py-1 rounded">
          Back
        </button>
        <button onClick={handleNext} className="ml-auto bg-black text-white px-3 py-1 rounded">
          Next
        </button>
      </div>
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
