

// import React, { useState, useContext } from 'react';
// import axios from 'axios';
// import { PipelineContext } from '../../context/PipelineContext';
// import { toast } from 'sonner';
// const BookingStatusForm = ({ campaignId, onConfirm, onClose }) => {
//   const [hasBooking, setHasBooking] = useState(false);
//   const [bookingNumber, setBookingNumber] = useState('');
//   const [bookingDate, setBookingDate] = useState('');
//   const [memberName, setMemberName] = useState('');
//   const { pipelineData, setPipelineData } = useContext(PipelineContext);
//   const [estimateDocument,setEstimateDocument]=useState('');
//  const username = localStorage.getItem('userName'); // Replace with your actual AuthContext or storage mechanism
//   const useremail = localStorage.getItem('userEmail');
//   const userId = localStorage.getItem('userId');
//    const handleFileChange = (e) => {
//     setEstimateDocument(e.target.files[0]);
//   };
//   const handleSave = async () => {
//     const previousBookingStatus = { ...pipelineData?.bookingStatus }; // Capture the previous booking status

//     const newBookingStatus = {
//       confirmed: true,
//       reference: bookingNumber,
//       bookingDate,
//       memberName,
//     };

//     // Log the change to the ChangeLog table
//     const changeLogData = {
//       campaignId,
//       userId: userId,  // Use username or email from localStorage or AuthContext
//       changeType: 'Booking Form Status Update',
//       userName:username,
//       userEmail:useremail,
//       previousValue: previousBookingStatus,
//       newValue: newBookingStatus,
//     };


//     try {
//       console.log("Changelog data from fr is",changeLogData);
//       const res1=await axios.post('${import.meta.env.VITE_API_BASE_URL}/api/pipeline/change-Log', changeLogData); 
//       console.log("Change log for booking status form is",res1);
//       const res = await axios.put(
//         `${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}/bookingStatus`,
//         {
//           confirmed: true,
//           reference: bookingNumber,
//           bookingDate,
//           estimateDocument
//           // memberName,
//         }
//       );
//       setPipelineData(res.data);
//        toast.success('Booking status saved successfully');
//       onConfirm();
//     } catch (err) {
//       console.error('Failed to save booking status:', err);
//       toast.error('Failed to save booking status ❌');
//       onConfirm();
//     }
//   };

//   return (
//     <div className="w-full h-full flex items-center justify-center p-4 ">
//       {pipelineData?.bookingStatus?.confirmed ? (
//         <div className="text-center bg-white p-6 max-w-md w-full">
//           <h1 className="text-xl font-semibold text-green-700">
//             Already Booked
//           </h1>
//           <p className="mt-2 text-gray-700">
//             Booking Number: <span className="font-medium">{pipelineData.bookingStatus.reference}</span>
//           </p>
//           <p className="text-gray-700">Date: {pipelineData.bookingStatus.bookingDate}</p>
//           {/* <p className="text-gray-700">Member: {pipelineData.bookingStatus.memberName}</p> */}
//           <div className='flex mt-4'>
//           <button
//   onClick={onClose}
//   className="w-[40%] mx-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
// >
//   Close
// </button>
//           </div>
//         </div>
//       ) : (
//         <div className="max-w-md w-full bg-white px-4 ">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
//             Booking Status
//           </h2>

          

          
//             <div className="space-y-5">
//               {/* Booking Number */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   Booking Number
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter booking number"
//                   value={bookingNumber}
//                   onChange={(e) => setBookingNumber(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Booking Date */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   Booking Date
//                 </label>
//                 <input
//                   type="date"
//                   value={bookingDate}
//                   onChange={(e) => setBookingDate(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//  <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Upload Estimate Document</label>
//                 <input
//                   type="file"
//                   onChange={handleFileChange}
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
//                 />
//               </div>
//               {/* Member Name */}
//               {/* <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   Booking Member Name
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter member name"
//                   value={memberName}
//                   onChange={(e) => setMemberName(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div> */}
// <div className='flex'>
//  <button
//   onClick={onClose}
//   className="w-[40%] mr-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
// >
//   Close
// </button>
// <button
//                 onClick={handleSave}
//                 className="w-[40%] text-xs bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
//               >
//                 Save 
//               </button>
// </div>
              
//             </div>
          
//         </div>
//       )}
//     </div>
//   );
// };

// export default BookingStatusForm;


import React, { useState, useContext } from 'react';
import axios from 'axios';
import { PipelineContext } from '../../context/PipelineContext';
import { toast } from 'sonner';

const BookingStatusForm = ({ campaignId, onConfirm, onClose }) => {
  const [bookingNumber, setBookingNumber] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [estimateDocument, setEstimateDocument] = useState(null);
  const { pipelineData, setPipelineData } = useContext(PipelineContext);

  const username = localStorage.getItem('userName');
  const useremail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');

  const handleFileChange = (e) => {
    setEstimateDocument(e.target.files[0]);
  };

  const handleSave = async () => {
    const previousBookingStatus = { ...pipelineData?.bookingStatus };

    const newBookingStatus = {
      confirmed: true,
      reference: bookingNumber,
      bookingDate,
    };

    const changeLogData = {
      campaignId,
      userId,
      changeType: 'Booking Form Status Update',
      userName: username,
      userEmail: useremail,
      previousValue: previousBookingStatus,
      newValue: newBookingStatus,
    };

    try {
      // Save Change Log
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/change-Log`, changeLogData);

      // Prepare form data
      const formData = new FormData();
      formData.append('confirmed', true);
      formData.append('reference', bookingNumber);
      formData.append('bookingDate', bookingDate);
      if (estimateDocument) {
        formData.append('file', estimateDocument);
      }

      // Upload and update booking status
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}/bookingStatus`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setPipelineData(res.data);
      toast.success('Booking status saved successfully');
      onConfirm();
    } catch (err) {
      console.error('Failed to save booking status:', err);
      toast.error('Failed to save booking status ❌');
      onConfirm();
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {pipelineData?.bookingStatus?.confirmed ? (
        <div className="text-center bg-white p-6 max-w-md w-full rounded-xl shadow">
          <h1 className="text-xl font-semibold text-green-700">
            Already Booked
          </h1>
          <p className="mt-2 text-gray-700">
            Booking Number:{' '}
            <span className="font-medium">{pipelineData.bookingStatus.reference}</span>
          </p>
          <p className="text-gray-700">
            Date: {pipelineData.bookingStatus.bookingDate}
          </p>

          <div className="mt-4">
            <h2 className="text-sm font-semibold mb-1">Booking confirmed Document</h2>
            {pipelineData.bookingStatus.estimateDocument ? (
              <a
                href={pipelineData.bookingStatus.estimateDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-xs"
              >
                View Uploaded Document
              </a>
            ) : (
              <p className="text-xs text-gray-500 italic">No document uploaded</p>
            )}
          </div>

          <div className="flex mt-6">
            <button
              onClick={onClose}
              className="w-[40%] mx-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full bg-white px-4 py-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Booking Status
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Booking Number
              </label>
              <input
                type="text"
                placeholder="Enter booking number"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Booking Date
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Upload Estimate Document
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            <div className="flex">
              <button
                onClick={onClose}
                className="w-[40%] mr-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="w-[40%] text-xs bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStatusForm;
