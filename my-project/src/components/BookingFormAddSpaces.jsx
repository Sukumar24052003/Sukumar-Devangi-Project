


// import React from 'react';

// export default function InventorySelector({
//   campaignIndex,
//   campaign,
//   spaces,
//   globalAvailability,
//   startDate,
//   endDate,
//   onToggleSpaceSelection,
//   onUpdateSelectedUnits,
//   onSearchChange
// }) {
//   const parseDDMMYY = (str) => {
//     const [dd, mm, yy] = str.split("-");
//     const fullYear = yy.length === 2 ? `20${yy}` : yy;
//     return new Date(`${fullYear}-${mm}-${dd}`);
//   };

//   const isSpaceAvailableInRange = (space) => {
//     try {
//       if (!startDate || !endDate) return false;
//       if (!space.availableFrom || !space.availableTo) return false;

//       const selectedStart = new Date(startDate);
//       const selectedEnd = new Date(endDate);
//       const spaceStart = parseDDMMYY(space.availableFrom);
//       const spaceEnd = parseDDMMYY(space.availableTo);

//       return selectedStart >= spaceStart && selectedEnd <= spaceEnd;
//     } catch (err) {
//       console.error("Error checking availability range:", err);
//       return false;
//     }
//   };

//   const filteredSpaces = (spaces || []).filter(space => {
//     console.log("Sample inventory space is",space);
//     if (!isSpaceAvailableInRange(space)) return false;
//     if (space.overlappingBooking && space.status === 'Completely booked') return false;
//     if ((space.status === 'Completely available' || space.status === 'Partialy available') && space.traded) return false;

//     if (campaign.searchQuery?.trim()) {
//       const query = campaign.searchQuery.toLowerCase();
//       return (
//         space.name.toLowerCase().includes(query) ||
//         space.city.toLowerCase().includes(query) ||
//         space.category.toLowerCase().includes(query)
//       );
//     }
//     return true;
//   });

//   return (
//     <div className="mt-6">
//       <div className="flex justify-between items-center mb-2">
//         <div className="text-sm font-medium">
//           Selected Places: {campaign.selectedSpaces?.length || 0}
//         </div>
//         <div className="w-1/3">
//           <input
//             type="text"
//             placeholder="Search by space name, city, category"
//             className="w-full border px-3 py-1 rounded text-sm"
//             value={campaign.searchQuery || ''}
//             onChange={(e) => onSearchChange(campaignIndex, e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="overflow-x-auto border rounded">
//         <table className="min-w-full text-xs">
//           <thead className="bg-gray-100">
//             <tr className="text-left">
//               <th className="px-2 py-2">#</th>
//               <th className="px-2 py-2">Space Name</th>
//               <th className="px-2 py-2">Space Type</th>
//               <th className="px-2 py-2">Status</th>
//               <th className="px-2 py-2">Facia</th>
//               <th className="px-2 py-2">City</th>
//               <th className="px-2 py-2">Ownership</th>
//               <th className="px-2 py-2">Occupied</th>
//               <th className="px-2 py-2">Total</th>
//               <th className="px-2 py-2">Select Units</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredSpaces.map(space => {
//               const globallySelectedUnits = globalAvailability[space.id] || 0;
//               const currentCampaignUnits = campaign.selectedSpaces?.find(s => s.id === space.id)?.selectedUnits || 0;
//               const remainingUnits = space.unit - space.occupiedUnits - globallySelectedUnits + currentCampaignUnits;
//               const updatedOccupiedUnits = space.occupiedUnits + globallySelectedUnits - currentCampaignUnits;

//               const updatedStatus =
//                 updatedOccupiedUnits >= space.unit
//                   ? 'Completely booked'
//                   : updatedOccupiedUnits === 0
//                   ? 'Completely available'
//                   : 'Partialy available';

//               const canSelectUnits = remainingUnits > 0;
//               const isDOOH = space.spaceType === 'DOOH';

//               return (
//                 <tr key={space.id} className="border-t text-center">
//                   <td className="px-2 py-2">
//                     <input
//                       type="checkbox"
//                       checked={campaign.selectedSpaces?.some(s => s.id === space.id)}
//                       onChange={() => onToggleSpaceSelection(campaignIndex, space.id)}
//                     />
//                   </td>
//                   <td className="px-2 py-2 text-left">{space.name}</td>
//                   <td className="px-2 py-2">{space.spaceType}</td>
//                   <td className="px-2 py-2">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       updatedStatus === "Completely available" ? "bg-green-100 text-green-700" :
//                       updatedStatus === "Partialy available" ? "bg-yellow-100 text-yellow-700" :
//                       "bg-red-100 text-red-700"
//                     }`}>
//                       {updatedStatus}
//                     </span>
//                   </td>
//                   <td className="px-2 py-2">{space.facia}</td>
//                   <td className="px-2 py-2">{space.city}</td>
//                   <td className="px-2 py-2">
//                     <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
//                       {space.ownershipType}
//                     </span>
//                   </td>
//                   <td className="px-2 py-2">
//                     {!isDOOH ? (
//                       <span className="text-gray-400 italic">N/A</span>
//                     ) : (
//                       updatedOccupiedUnits
//                     )}
//                   </td>
//                   <td className="px-2 py-2">
//                     {!isDOOH ? (
//                       <span className="text-gray-400 italic">N/A</span>
//                     ) : (
//                       space.unit
//                     )}
//                   </td>
//                   <td className="px-2 py-2">
//                     {!isDOOH ? (
//                       <span className="text-gray-400 italic">N/A</span>
//                     ) : (
//                       updatedStatus === "Completely booked" || !canSelectUnits ? (
//                         <span className="text-gray-400 italic">N/A</span>
//                       ) : (
//                         <input
//                           type="number"
//                           min={1}
//                           max={remainingUnits}
//                           value={currentCampaignUnits || 1}
//                           onChange={(e) => onUpdateSelectedUnits(campaignIndex, space.id, parseInt(e.target.value))}
//                           className="w-16 border rounded px-1"
//                           disabled={!campaign.selectedSpaces?.some(s => s.id === space.id)}
//                         />
//                       )
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';

export default function InventorySelector({
  campaignIndex,
  campaign,
  spaces,
  globalAvailability,
  startDate,
  endDate,
  onToggleSpaceSelection,
  onUpdateSelectedUnits,
  onSearchChange
}) {
  const [selectedSpace, setSelectedSpace] = useState(null); // State to manage selected space for the modal

  const parseDDMMYY = (str) => {
    const [dd, mm, yy] = str.split("-");
    const fullYear = yy.length === 2 ? `20${yy}` : yy;
    return new Date(`${fullYear}-${mm}-${dd}`);
  };

  const isSpaceAvailableInRange = (space) => {
    try {
      if (!startDate || !endDate) return false;
      if (!space.availableFrom || !space.availableTo) return false;

      const selectedStart = new Date(startDate);
      const selectedEnd = new Date(endDate);
      const spaceStart = parseDDMMYY(space.availableFrom);
      const spaceEnd = parseDDMMYY(space.availableTo);

      return selectedStart >= spaceStart && selectedEnd <= spaceEnd;
    } catch (err) {
      console.error("Error checking availability range:", err);
      return false;
    }
  };

  const filteredSpaces = (spaces || []).filter(space => {
    console.log("Sample inventory space is", space);
    if (!isSpaceAvailableInRange(space)) return false;
    if (space.overlappingBooking && space.status === 'Completely booked') return false;
    if ((space.status === 'Completely available' || space.status === 'Partialy available') && space.traded) return false;

    if (campaign.searchQuery?.trim()) {
      const query = campaign.searchQuery.toLowerCase();
      return (
        space.name.toLowerCase().includes(query) ||
        space.city.toLowerCase().includes(query) ||
        space.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Function to handle space click
  const handleSpaceClick = (space) => {
    setSelectedSpace(space); // Set selected space for modal
  };

  // Close the modal
  const closeModal = () => {
    setSelectedSpace(null);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">
          Selected Places: {campaign.selectedSpaces?.length || 0}
        </div>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search by space name, city, category"
            className="w-full border px-3 py-1 rounded text-sm"
            value={campaign.searchQuery || ''}
            onChange={(e) => onSearchChange(campaignIndex, e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Space Name</th>
              <th className="px-2 py-2">Space Type</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Facia</th>
              <th className="px-2 py-2">City</th>
              <th className="px-2 py-2">Ownership</th>
              <th className="px-2 py-2">Occupied</th>
              <th className="px-2 py-2">Total</th>
              <th className="px-2 py-2">Select Units</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpaces.map(space => {
              const globallySelectedUnits = globalAvailability[space.id] || 0;
              const currentCampaignUnits = campaign.selectedSpaces?.find(s => s.id === space.id)?.selectedUnits || 0;
              const remainingUnits = space.unit - space.occupiedUnits - globallySelectedUnits + currentCampaignUnits;
              const updatedOccupiedUnits = space.occupiedUnits + globallySelectedUnits - currentCampaignUnits;

              const updatedStatus =
                updatedOccupiedUnits >= space.unit
                  ? 'Completely booked'
                  : updatedOccupiedUnits === 0
                  ? 'Completely available'
                  : 'Partialy available';

              const canSelectUnits = remainingUnits > 0;
              const isDOOH = space.spaceType === 'DOOH';

              return (
                <tr key={space.id} className="border-t text-center">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={campaign.selectedSpaces?.some(s => s.id === space.id)}
                      onChange={() => onToggleSpaceSelection(campaignIndex, space.id)}
                    />
                  </td>
                  <td className="px-2 py-2 text-left" onClick={() => handleSpaceClick(space)}>
                    {space.name}
                  </td>
                  <td className="px-2 py-2">{space.spaceType}</td>
                  <td className="px-2 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      updatedStatus === "Completely available" ? "bg-green-100 text-green-700" :
                      updatedStatus === "Partialy available" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {updatedStatus}
                    </span>
                  </td>
                  <td className="px-2 py-2">{space.facia}</td>
                  <td className="px-2 py-2">{space.city}</td>
                  <td className="px-2 py-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {space.ownershipType}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    {!isDOOH ? (
                      <span className="text-gray-400 italic">N/A</span>
                    ) : (
                      updatedOccupiedUnits
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {!isDOOH ? (
                      <span className="text-gray-400 italic">N/A</span>
                    ) : (
                      space.unit
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {!isDOOH ? (
                      <span className="text-gray-400 italic">N/A</span>
                    ) : (
                      updatedStatus === "Completely booked" || !canSelectUnits ? (
                        <span className="text-gray-400 italic">N/A</span>
                      ) : (
                        <input
                          type="number"
                          min={1}
                          max={remainingUnits}
                          value={currentCampaignUnits || 1}
                          onChange={(e) => onUpdateSelectedUnits(campaignIndex, space.id, parseInt(e.target.value))}
                          className="w-16 border rounded px-1"
                          disabled={!campaign.selectedSpaces?.some(s => s.id === space.id)}
                        />
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Custom Modal to show the main photo */}
      {selectedSpace && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{selectedSpace.name}</h2>
            <img src={selectedSpace.mainPhoto} alt={selectedSpace.name} className="modal-image" />
          </div>
        </div>
      )}

      {/* Modal Styling */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 80%;
          text-align: center;
        }

        .modal-close {
        
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 24px;
          color: #333;
          cursor: pointer;
        }

        .modal-image {
          width: 100%;
          height: auto;
          max-width: 500px;
          margin-top: 20px;
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
