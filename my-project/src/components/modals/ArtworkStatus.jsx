

// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import { PipelineContext } from '../../context/PipelineContext';
// import toast from 'react-hot-toast';
// export default function ArtworkForm({ campaignId, onConfirm,onClose }) {
//   const [artworkReceived, setArtworkReceived] = useState(false);
//   const [artworkFile, setArtworkFile] = useState(null);
//   const [receivedDate, setReceivedDate] = useState('');
//   const [isArtworkSaved, setIsArtworkSaved] = useState(false);
//   const [artworkUrl, setArtworkUrl] = useState('');
//   const { pipelineData, setPipelineData } = useContext(PipelineContext);

//   useEffect(() => {
//     const fetchArtwork = async () => {
//       try {
//         const res = await axios.get(`http://localhost:3000/api/pipeline/campaign/${campaignId}`);
//         const artwork = res.data?.artwork || {};
//         if (artwork.confirmed) {
//           setIsArtworkSaved(true);
//           setReceivedDate(artwork.receivedDate || '');
//           setArtworkUrl(artwork.documentUrl || '');
//         }
//       } catch (err) {
//         console.error('Failed to fetch artwork data:', err);
//       }
//     };

//     fetchArtwork();
//   }, [campaignId]);

//   const handleFileChange = (e) => {
//     setArtworkFile(e.target.files[0]);
//   };

//   const handleDownload = async () => {
//     const response = await fetch(artworkUrl);
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = artworkUrl.split('/').pop();
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const handleSave = async () => {
//     try {
//       if ( !artworkFile) {
        
//        toast.error('Please upload artwork and select received date.');
//         return;
//       }

//       const formData = new FormData();
//       formData.append('file', artworkFile);

//       await axios.post(`http://localhost:3000/api/pipeline/campaign/${campaignId}/artwork/upload`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       const res = await axios.put(`http://localhost:3000/api/pipeline/campaign/${campaignId}/artwork`, {
//         confirmed: true,
//         receivedDate,
//       });

//       setPipelineData(res.data);
//       setIsArtworkSaved(true);
//       setArtworkUrl(res.data.artwork?.documentUrl || '');
//       toast.success('Artwork recieved successfully!');
//       onConfirm();
//     } catch (err) {
//       toast.error('Error saving artwork:', err)
//       console.error('Error saving artwork:', err);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto mt-10 bg-white  ">
//       <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Artwork Status</h2>

//       {isArtworkSaved ? (
//         <div className="space-y-4 w-full text-sm text-gray-700">
//           <p className="text-green-700 font-medium">✅ Artwork received and saved.</p>
//           {receivedDate && (
//             <div>
//               <label className="block font-medium">Received Date:</label>
//               <p>{receivedDate}</p>
//             </div>
//           )}
//           {artworkUrl && (
//             <div className='w-full'>
//               <label className="block font-medium">Artwork File:</label>
//               <div className="flex gap-8 w-full">
               
//                 <a href={artworkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 mt-2 underline">
//                   View Artwork
//                 </a>
//                 <button onClick={handleDownload} className="w-[40%] text-xs bg-blue-600 text-white py-2 rounded-xl  transition">
//                    Download
//                 </button>
//               </div>
//               <div className='flex mt-[10%]'>
//           <button
//   onClick={onClose}
//   className="w-[40%] mx-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
// >
//   Close
// </button>
// </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <>
        
          
//             <div className="space-y-4">
//               {/* Received Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
//                 <input
//                   type="date"
//                   value={receivedDate}
//                   onChange={(e) => setReceivedDate(e.target.value)}
//                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Upload Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Upload Artwork File</label>
//                 <input
//                   type="file"
//                   onChange={handleFileChange}
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
//                 />
//               </div>

//              <div className='flex'>
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
//               </div>
//             </div>
         
        
          
//         </>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PipelineContext } from '../../context/PipelineContext';
import { toast } from 'sonner';

export default function ArtworkForm({ campaignId, onConfirm, onClose }) {
  const [artworkReceived, setArtworkReceived] = useState(false);
  const [artworkFile, setArtworkFile] = useState(null);
  const [receivedDate, setReceivedDate] = useState('');
  const [isArtworkSaved, setIsArtworkSaved] = useState(false);
  const [artworkUrl, setArtworkUrl] = useState('');
  const { pipelineData, setPipelineData } = useContext(PipelineContext);
 const username = localStorage.getItem('userName'); // Replace with your actual AuthContext or storage mechanism
  const useremail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}`);
        const artwork = res.data?.artwork || {};
        if (artwork.confirmed) {
          setIsArtworkSaved(true);
          setReceivedDate(artwork.receivedDate || '');
          setArtworkUrl(artwork.documentUrl || '');
        }
      } catch (err) {
        console.error('Failed to fetch artwork data:', err);
        toast.error('Failed to fetch artwork data');
      }
    };

    fetchArtwork();
  }, [campaignId]);

  const handleFileChange = (e) => {
    setArtworkFile(e.target.files[0]);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(artworkUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = artworkUrl.split('/').pop();
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handleSave = async () => {
    if (!artworkFile || !receivedDate) {
      toast.error('Please upload artwork and select received date.');
      return;
    }
const previousArtworkStatus = { ...pipelineData?.artwork }; // Capture the previous booking status

    const newArtworkStatus = {
      confirmed: true,
     receivedDate,
    };

    // Log the change to the ChangeLog table
    const changeLogData = {
      campaignId,
      userId: userId,  // Use username or email from localStorage or AuthContext
      changeType: 'Artwork Form Status Update',
      userName:username,
      userEmail:useremail,
      previousValue: previousArtworkStatus,
      newValue: newArtworkStatus,
    };
    try {
      console.log("Changelog data from fr is",changeLogData);
            const res1=await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/change-Log`, changeLogData); 
            console.log("Change log for booking status form is",res1);
      const formData = new FormData();
      formData.append('file', artworkFile);

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}/artwork/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}/artwork`,
        {
          confirmed: true,
          receivedDate,
        }
      );

      setPipelineData(res.data);
      setIsArtworkSaved(true);
      setArtworkUrl(res.data.artwork?.documentUrl || '');
      toast.success('Artwork received and saved successfully ');
      onConfirm();
    } catch (err) {
      console.error('Error saving artwork:', err);
      toast.error('Failed to save artwork ❌');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Artwork Status</h2>

      {isArtworkSaved ? (
        <div className="space-y-4 w-full text-sm text-gray-700">
          <p className="text-green-700 font-medium">✅ Artwork received and saved.</p>
          {receivedDate && (
            <div>
              <label className="block font-medium">Received Date:</label>
              <p>{receivedDate}</p>
            </div>
          )}
          {artworkUrl && (
            <div className='w-full'>
              <label className="block font-medium">Artwork File:</label>
              <div className="flex gap-8 w-full">
                <a href={artworkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 mt-2 underline">
                  View Artwork
                </a>
                <button onClick={handleDownload} className="w-[40%] text-xs bg-blue-600 text-white py-2 rounded-xl transition">
                  Download
                </button>
              </div>
              <div className='flex mt-[10%]'>
                <button
                  onClick={onClose}
                  className="w-[40%] mx-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Artwork File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            <div className='flex'>
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
        </>
      )}
    </div>
  );
}
