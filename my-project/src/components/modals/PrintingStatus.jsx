

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export default function PrintingStatus({ campaignId,spaceId, onConfirm, onClose }) {
  // const [printingStatus, setPrintingStatus] = useState(false);
  const [printingDate, setPrintingDate] = useState('');
  const [note, setNote] = useState('');
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);
  const [printingMaterial,setPrintingMaterial]=useState('')
  const [assignedPerson, setAssignedPerson] = useState('');
  const [assignedAgency, setAssignedAgency] = useState('');
 const username = localStorage.getItem('userName'); // Replace with your actual AuthContext or storage mechanism
  const useremail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');
  const [previousPrintingDetails,setPreviousPrintngDetails]=useState();
  // let previousPrintingDetails={};
  useEffect(() => {
    const fetchSpaceStatus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${spaceId}`);
        if (res.data?.printingStatus?.confirmed) {
          setAlreadyConfirmed(true);
          console.log("printing data is",res.data);
          setPreviousPrintngDetails(res.data?.printingStatus);
          setPrintingDate(res.data.printingStatus.printingDate || '');
          setAssignedAgency(res.data.printingStatus.assignedAgency || '');
          setAssignedPerson(res.data.printingStatus.assignedPerson || '');
          setPrintingMaterial(res.data.printingStatus.printingMaterial || '');
        }
      } catch (error) {
        console.error('Failed to fetch space printing status:', error);
      }
    };

    if (spaceId) fetchSpaceStatus();
  }, [spaceId]);

  const handleSave = async () => {
    try {
      if ( !printingDate||!assignedPerson||!assignedAgency||!printingMaterial) {
        toast.error('Please confirm printing details before saving');
        return;
      }
      
     

    // Log the change to the ChangeLog table
    const changeLogData = {
      campaignId,
      userId: userId,  // Use username or email from localStorage or AuthContext
      changeType: 'Printing Status Update',
      userName:username,
      userEmail:useremail,
      previousValue: setPreviousPrintngDetails,
      newValue: {
        confirmed: true,
        printingDate,
        assignedPerson,
        assignedAgency,
        printingMaterial,
        note
      },
    };
    console.log("Prin payload fr",{
        confirmed: true,
        printingDate,
        assignedPerson,
        assignedAgency,
        printingMaterial,
        note
      });
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${spaceId}/printingStatus`, {
        confirmed: true,
        printingDate,
        assignedPerson,
        assignedAgency,
        printingMaterial,
        note
      });
  const res1=await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/change-Log`, changeLogData); 
      console.log("Change log for PO status form is",res1);
      setAlreadyConfirmed(true);
      onConfirm();
    } catch (err) {
      console.error('Failed to confirm printing status:', err);
    }
  };

  return (
    <div className="max-w-2xl w-[100%] mx-auto mt-10 bg-white  ">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Printing Status</h2>

      {alreadyConfirmed ? (
        <div className="space-y-4 text-sm text-gray-700 text-center">
          <p className="text-green-700 font-medium">✅ Printing already confirmed for this space.</p>
          {printingDate && (
            <p>
              <span className="font-medium">Printing Date:</span> {printingDate}
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
          {printingMaterial && (
            <p>
              <span className="font-medium">Printing Material:</span> {printingMaterial}
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Printing Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={printingDate}
                  onChange={(e) => setPrintingDate(e.target.value)}
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
               <div>
            <label className="block text-xs font-medium">Material Type <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={printingMaterial}
              onChange={(e) =>
                setPrintingMaterial( e.target.value)
              }
            >
              <option>Select...</option>
              <option>Material 1</option>
              <option>Material 2</option>
            </select>
            
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
