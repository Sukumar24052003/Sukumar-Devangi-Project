

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { PipelineContext } from '../../context/PipelineContext';
import { toast } from 'sonner';
export default function POForm({ campaignId, onConfirm,onClose }) {
  const [poReceived, setPoReceived] = useState(false);
  const [poFile, setPoFile] = useState(null);
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [poValue, setPoValue] = useState('');
  const { pipelineData, setPipelineData } = useContext(PipelineContext);
 const username = localStorage.getItem('userName'); // Replace with your actual AuthContext or storage mechanism
  const useremail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');
  const handleFileChange = (e) => {
    setPoFile(e.target.files[0]);
  };

  const handleDownload = async (url, filename = 'PO-Document') => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download PO document.');
    }
  };

  const handleSave = async () => {
    
    try {
      if (poFile) {
        const formData = new FormData();
        formData.append('file', poFile);
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}/po/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else{
        toast.error('Please upload an PO file before saving.');
        return;
      }
     const previousPoDetails = { ...pipelineData?.po };
     

    // Log the change to the ChangeLog table
    const changeLogData = {
      campaignId,
      userId: userId,  // Use username or email from localStorage or AuthContext
      changeType: 'PO Status Update',
      userName:username,
      userEmail:useremail,
      previousValue: previousPoDetails,
      newValue:  {
          confirmed: true,
          poNumber,
          poDate,
          poValue,
        },
    };
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}/po`,
        {
          confirmed: true,
          poNumber,
          poDate,
          poValue,
        }
      );

      setPipelineData(res.data);
      const res1=await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/change-Log`, changeLogData); 
      console.log("Change log for PO status form is",res1);
      toast.success('PO details saved!');
      onConfirm();
    } catch (err) {
      toast.error('Failed to save PO status:', err);
      console.error('Failed to save PO status:', err);
    }
  };

  const po = pipelineData?.po;
  const poDocumentUrl = po?.documentUrl;

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {po?.confirmed ? (
        <div className="text-center bg-white p-6  max-w-md w-full">
          <h2 className="text-xl font-semibold text-green-700 mb-4">PO Status Confirmed</h2>
          <p className="text-sm text-gray-700">PO Number: <span className="font-medium">{po.poNumber}</span></p>
          <p className="text-sm text-gray-700">PO Date: {po.poDate}</p>
          <p className="text-sm text-gray-700">PO Value: ₹{po.poValue}</p>

          {poDocumentUrl ? (
            <div className="mt-4 ">
              
              <button
                onClick={() => handleDownload(poDocumentUrl, 'PO-Document')}
                className="w-[90%] text-sm bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Download PO 
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-red-500">No PO document uploaded yet.</p>
          )}
          <button
  onClick={onClose}
  className="w-[30%] mt-4 mr-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
>
  Close
</button>
        </div>
      ) : (
        <div className="max-w-md w-full bg-white p-4 ">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">PO Status</h2>

          <div className="flex items-center space-x-3 mb-5 text-sm">
            {/* <input
              type="checkbox"
              id="poCheckbox"
              checked={poReceived}
              onChange={() => setPoReceived(!poReceived)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="poCheckbox" className="text-gray-700 font-medium">Yes?</label> */}
          </div>

         
            <div className="space-y-4">
              {/* PO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input
                  type="text"
                  placeholder="Enter PO number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* PO Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
                <input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* PO Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Value (₹)</label>
                <input
                  type="number"
                  placeholder="Enter PO amount"
                  value={poValue}
                  onChange={(e) => setPoValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* PO Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload PO Document</label>
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
                className="w-[40%] text-sm bg-blue-600 text-white py-2 rounded-xl  transition"
              >
                Save PO
              </button>
</div>
              {/* Save Button */}
              
            </div>
         
          {/* {!poReceived && <div className='flex w-full'>
  <button
  onClick={onClose}
  className=" mx-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
>
  Close
</button>
</div> } */}
          
        </div>
      )}
    </div>
  );
}

