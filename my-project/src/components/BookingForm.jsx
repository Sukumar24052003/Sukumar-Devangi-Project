

// import React from 'react';
// import Navbar from './Navbar';
// import { useNavigate } from 'react-router-dom';
// import { useBookingForm } from '../context/BookingFormContext';
// import { useState } from 'react';
// import { toast } from 'sonner';

// export default function CreateOrderBasicInfo() {
//   const navigate = useNavigate();
//   const { basicInfo, setBasicInfo, proposalId } = useBookingForm();
//   const [step, setStep] = useState('Basic');
//   const [completedSteps, setCompletedSteps] = useState(['Basic']);
//   const stepOrder = ['Basic', 'Order'];

//   return (
//     <div className="bg-white text-xs">
//       <Navbar />
//       <main className="ml-64 w-full flex-1 px-8">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl font-semibold">{proposalId ? "Edit Proposal" : "Create Order"}</h1>
//         </div>

//         <div className="flex gap-6 mb-6 text-sm font-medium">
//   {stepOrder.map((label) => (
//     <div
//       key={label}
//       className={
//         step === label
//           ? 'text-black border-b-2 border-black pb-1 flex items-center gap-1'
//           : 'text-gray-500 pb-1 flex items-center gap-1'
//       }
//     >
//       {label === 'Basic' ? 'Basic Information' : 'Order Information'}
//     </div>
//   ))}
// </div>


//         <div className="grid grid-cols-2 text-xs gap-6">
//           <div>
//             <label className="block text-xs font-medium">Company Name <span className="text-red-500">*</span></label>
//             <input
//               className="w-full p-2 border rounded mt-1"
//               placeholder="Write..."
//               value={basicInfo.companyName}
//               onChange={(e) =>
//                 setBasicInfo({ ...basicInfo, companyName: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium">Client Name <span className="text-red-500">*</span></label>
//             <input
//               className="w-full p-2 border rounded mt-1"
//               placeholder="Write..."
//               value={basicInfo.clientName}
//               onChange={(e) =>
//                 setBasicInfo({ ...basicInfo, clientName: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium">Client Email</label>
//             <input
//               className="w-full p-2 border rounded mt-1"
//               placeholder="Write..."
//               value={basicInfo.clientEmail}
//               onChange={(e) =>
//                 setBasicInfo({ ...basicInfo, clientEmail: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium">Client Contact Number</label>
//             <input
//               className="w-full p-2 border rounded mt-1"
//               placeholder="Write..."
//               value={basicInfo.clientContact}
//               onChange={(e) =>
//                 setBasicInfo({ ...basicInfo, clientContact: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium">Client Pan Number</label>
//             <input
//               className="w-full p-2 border rounded mt-1"
//               placeholder="Write..."
//               value={basicInfo.clientPan}
//               onChange={(e) =>
//                 setBasicInfo({ ...basicInfo, clientPan: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium">Client GST Number</label>
//             <input
//               className="w-full p-2 border rounded mt-1"
//               placeholder="Write..."
//               value={basicInfo.clientGst}
//               onChange={(e) =>
//                 setBasicInfo({ ...basicInfo, clientGst: e.target.value })
//               }
//             />
//           </div>

//           {/* Image Upload and Preview */}
//           <div className="col-span-2">
//             <label className="block text-xs font-medium mb-1">Client logo</label>
//             <input
//               type="file"
//               accept=".jpg,.jpeg,.png,.webp"
//               onChange={(e) => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;

//                 const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
//                 const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

//                 if (!isValidType) {
//                   toast.error(`Invalid format: ${file.name}. Only JPG, PNG, and WEBP allowed.`);
//                   return;
//                 }

//                 if (!isValidSize) {
//                   toast.error(`File too large: ${file.name} exceeds 10MB limit.`);
//                   return;
//                 }

//                 const imageUrl = URL.createObjectURL(file);

//                 setBasicInfo(prev => ({
//                   ...prev,
//                   // campaignImages: [{ file, preview: imageUrl }],
//                   companyLogo:{ file, preview: imageUrl }
//                 }));
//               }}
//               className="w-[30%] p-1 rounded mt-1"
//             />

//             <div className="flex flex-wrap gap-2 mt-2">
//               {basicInfo.companyLogo &&
//                 <div className="relative">
//                   <img
//                     src={basicInfo?.companyLogo.preview}
//                     alt={`campaign`}
//                     className="h-20 w-20 object-cover rounded border"
//                   />
//                   <button
//                     onClick={() => {
//                       setBasicInfo(prev => ({
//                         ...prev,
//                         companyLogo: '',
//                       }));
//                     }}
//                     className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1 hover:bg-red-700"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               }
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-medium">Brand Display Name</label>
//             <input
//               className="w-full p-2 border rounded mt-1"
//               placeholder="Write..."
//               value={basicInfo.brandName}
//               onChange={(e) =>
//                 setBasicInfo({ ...basicInfo, brandName: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium">Client Type <span className="text-red-500">*</span></label>
//             <select
//               className="w-full p-2 border rounded mt-1"
//               value={basicInfo.clientType}
//               onChange={(e) =>
//                 setBasicInfo({ ...basicInfo, clientType: e.target.value })
//               }
//             >
//               <option>Select...</option>
//               <option>Corporate</option>
//               <option>Agency</option>
//             </select>
//           </div>
//         </div>

//         <div className="mt-8 text-sm flex">
//           <div className='px-0 py-2 mr-auto'>

//           <button className="px-3 py-1 border rounded mr-auto transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">Cancel</button>
//           </div>
//           <div className="px-4 py-2  ml-auto ">
//             <button
//               onClick={() => navigate('/create-booking-orderInfo')}
//               className="px-3 py-1 bg-black text-white rounded transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { useBookingForm } from '../context/BookingFormContext';
import { toast } from 'sonner';

export default function CreateOrderBasicInfo() {
  const navigate = useNavigate();
  const { basicInfo, setBasicInfo, proposalId } = useBookingForm();
  const [step, setStep] = useState('Basic');
  const [completedSteps, setCompletedSteps] = useState(['Basic']);
  const stepOrder = ['Basic', 'Order'];

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(basicInfo.user || '');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setBasicInfo(prev => ({ ...prev, user: selectedUser }));
  }, [selectedUser]);

  return (
    <div className="bg-white text-xs">
      <Navbar />
      <main className="ml-64 w-full flex-1 px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">{proposalId ? "Edit Proposal" : "Create Order"}</h1>
        </div>

        <div className="flex gap-6 mb-6 text-sm font-medium">
          {stepOrder.map((label) => (
            <div
              key={label}
              className={
                step === label
                  ? 'text-black border-b-2 border-black pb-1 flex items-center gap-1'
                  : 'text-gray-500 pb-1 flex items-center gap-1'
              }
            >
              {label === 'Basic' ? 'Basic Information' : 'Order Information'}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 w-[70%] text-xs gap-6">
          <div className=''>
            <label className="block text-xs font-medium">Company Name <span className="text-red-500">*</span></label>
            <input
              className="w-full p-2 border rounded mt-1"
              placeholder="Write..."
              value={basicInfo.companyName}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, companyName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Client Name <span className="text-red-500">*</span></label>
            <input
              className="w-full p-2 border rounded mt-1"
              placeholder="Write..."
              value={basicInfo.clientName}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, clientName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Client Email</label>
            <input
              className="w-full p-2 border rounded mt-1"
              placeholder="Write..."
              value={basicInfo.clientEmail}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, clientEmail: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Client Contact Number</label>
            <input
              className="w-full p-2 border rounded mt-1"
              placeholder="Write..."
              value={basicInfo.clientContact}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, clientContact: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Client Pan Number</label>
            <input
              className="w-full p-2 border rounded mt-1"
              placeholder="Write..."
              value={basicInfo.clientPan}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, clientPan: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Client GST Number</label>
            <input
              className="w-full p-2 border rounded mt-1"
              placeholder="Write..."
              value={basicInfo.clientGst}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, clientGst: e.target.value })
              }
            />
          </div>

          {/* Image Upload and User Dropdown Side-by-Side */}
          <div className="col-span-2 flex gap-10 items-start">
            {/* Client Logo Upload */}
            <div className="w-[30%]">
              <label className="block text-xs font-medium mb-1">Client logo</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
                  const isValidSize = file.size <= 10 * 1024 * 1024;

                  if (!isValidType) {
                    toast.error(`Invalid format: ${file.name}`);
                    return;
                  }

                  if (!isValidSize) {
                    toast.error(`File too large: ${file.name}`);
                    return;
                  }

                  const imageUrl = URL.createObjectURL(file);
                  setBasicInfo(prev => ({
                    ...prev,
                    companyLogo: { file, preview: imageUrl }
                  }));
                }}
                className="w-full p-1 rounded mt-1"
              />

              {basicInfo.companyLogo && (
                <div className="relative mt-2">
                  <img
                    src={basicInfo.companyLogo.preview}
                    alt="logo"
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <button
                    onClick={() =>
                      setBasicInfo(prev => ({ ...prev, companyLogo: '' }))
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Assigned User Dropdown */}
            <div className="flex-1 ml-[15%]">
              <label className="block text-xs font-medium mb-1">Assigned Sales Person <span className="text-red-500">*</span></label>
              <select
                className="w-full p-2 border rounded mt-1"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium">Brand Display Name</label>
            <input
              className="w-full p-2 border rounded mt-1"
              placeholder="Write..."
              value={basicInfo.brandName}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, brandName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Client Type <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={basicInfo.clientType}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, clientType: e.target.value })
              }
            >
              <option>Select...</option>
              <option>Corporate</option>
              <option>Agency</option>
            </select>
            
          </div>
          <div>
            <label className="block text-xs font-medium">Booking Type <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={basicInfo.bookingMode}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, bookingMode: e.target.value })
              }
            >
              <option>Select...</option>
              <option>Whatsapp</option>
              <option>Phone Call</option>
              <option>Email </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium">Booking Source <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={basicInfo.bookingSource}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, bookingSource: e.target.value })
              }
            >
              <option>Select...</option>
              <option>Direct</option>
              <option>Agency</option>
              
            </select>
          </div>
          <div className="col-span-2 mt-2 flex items-center">
  <input
    id="focBooking"
    type="checkbox"
    checked={basicInfo.isFOCBooking || false}
    onChange={(e) =>
      setBasicInfo({ ...basicInfo, isFOCBooking: e.target.checked })
    }
    className="mr-2 h-4 w-4 accent-black"
  />
  <label htmlFor="focBooking" className="text-xs font-normal">
    FOC (Free of Cost) booking
  </label>
</div>
        </div>

        <div className="mt-8 text-sm flex">
          <div className='px-0 py-2 mr-auto'>
            <button className="px-3 py-1 border rounded mr-auto transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">Cancel</button>
          </div>
          <div className="px-4 py-2  ml-auto ">
            <button
              onClick={() => navigate('/create-booking-orderInfo')}
              className="px-3 py-1 bg-black text-white rounded transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

