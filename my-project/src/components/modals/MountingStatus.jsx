

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export default function MountingStatus({ campaignId,spaceId, onConfirm, onClose }) {
  const [mountingStatus, setMountingStatus] = useState(false);
  const [receivedDate, setReceivedDate] = useState('');
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);
 const [assignedPerson, setAssignedPerson] = useState('');
  const [assignedAgency, setAssignedAgency] = useState('');
 const username = localStorage.getItem('userName'); // Replace with your actual AuthContext or storage mechanism
  const useremail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');
  const [note, setNote] = useState('');
    const [previousMountingDetails,setPreviousMountingDetails]=useState();
  useEffect(() => {
    const fetchSpaceStatus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${spaceId}`);
        if (res.data?.mountingStatus?.confirmed) {
          setAlreadyConfirmed(true);
          setReceivedDate(res.data.mountingStatus.mountingDate || '');
          setAssignedAgency(res.data.mountingStatus.assignedAgency || '');
          setAssignedPerson(res.data.mountingStatus.assignedPerson || '');
          setPreviousMountingDetails(res.data.mountingStatus);
        }
      } catch (error) {
        console.error('Failed to fetch mounting status:', error);
      }
    };

    if (spaceId) {
      fetchSpaceStatus();
    }
  }, [spaceId]);

  const handleSave = async () => {
    try {
    
      if (!receivedDate ||!assignedPerson||!assignedAgency) {
        toast.error('Please enter mounting details.');
        return;
      }
     const changeLogData = {
      campaignId,
      userId: userId,  // Use username or email from localStorage or AuthContext
      changeType: 'Printing Status Update',
      userName:username,
      userEmail:useremail,
      previousValue: setPreviousMountingDetails,
      newValue: {
        confirmed: true,
        receivedDate,
        assignedPerson,
        assignedAgency,
        note
      },
    };
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${spaceId}/mountingStatus`, {
        confirmed: true,
        receivedDate,
         assignedPerson,
        assignedAgency,
        note
      });
 const res1=await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/change-Log`, changeLogData); 
      console.log("Change log for PO status form is",res1);
      setAlreadyConfirmed(true);
      toast.success('Mounting status saved.');
      onConfirm();
    } catch (err) {
      console.error('Failed to confirm mounting status:', err);
      toast.error('Failed to save mounting status.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-2 ">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Mounting Status</h2>

      {alreadyConfirmed ? (
        <div className="space-y-4 text-sm text-gray-700 text-center">
          <p className="text-green-700 font-medium">✅ Mounting already confirmed for this space.</p>
          {receivedDate && (
            <p>
              <span className="font-medium">Mounting Date:</span> {receivedDate}
            </p>
          )}
           {assignedPerson && (
            <p>
              <span className="font-medium">Assigned Person Name:</span> {assignedPerson}
            </p>
          )}
          {assignedAgency && (
            <p>
              <span className="font-medium">Assigned Agency:</span> {assignedAgency}
            </p>
          )}
          
          {note.length>0 && (
            <p>
              <span className="font-medium">Note:</span> {note}
            </p>
          )}
          <div className="flex mt-4">
            <button
              onClick={onClose}
              className="w-[40%] mx-auto text-xs bg-gray-300 text-black py-2 rounded-xl hover:bg-gray-400 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <>
          

         
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Received Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
               <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Person <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={assignedPerson}
                  onChange={(e) => setAssignedPerson(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Agency <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={assignedAgency}
                  onChange={(e) => setAssignedAgency(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes if any</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        

          
        </>
      )}
    </div>
  );
}
