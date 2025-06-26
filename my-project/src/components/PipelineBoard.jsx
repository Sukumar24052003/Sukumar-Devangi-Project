import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AcceptPaymentForm } from './AcceptPaymentForm';
import { UploadArtworkForm } from './UploadArtworkForm';
const steps = [
  'Booking Confirmed',
  'PO Received',
  'Raise Invoice',
  'Accept Payment',
  'Upload Artwork',
  'Printing Status',
  'Mounting Status',
  'Advertising Live',
  'Notify for Removal/Extension'
];

const PipelineBoard = ({ bookingId }) => {
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      const res = await axios.get(`/api/booking/${bookingId}/pipeline`);
      setPipeline(res.data);
      setLoading(false);
    };
    fetchPipeline();
  }, [bookingId]);

  const markStageDone = async (stage) => {
    await axios.post(`/api/booking/${bookingId}/pipeline/update`, {
      stage,
      data: {}
    });
    const res = await axios.get(`/api/booking/${bookingId}/pipeline`);
    setPipeline(res.data);
  };

  if (loading) return <div className="text-center py-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      {steps.map((step, index) => {
        const current = pipeline[step] || {};
        const isDone = current.status === 'done';
        // Inside the .map loop in PipelineBoard
{
    step === 'Accept Payment' && !isDone && (
      <AcceptPaymentForm bookingId={bookingId} onSuccess={() => markStageDone(step)} />
    )
  }
  
  {
    step === 'Upload Artwork' && !isDone && (
      <UploadArtworkForm bookingId={bookingId} onSuccess={() => markStageDone(step)} />
    )
  }
  

        return (
          <div key={index} className={`p-4 border rounded-lg flex justify-between items-center ${isDone ? 'bg-green-100' : 'bg-white'}`}>
            <span className="font-medium">{step}</span>
            <div className="flex gap-3">
              {isDone ? (
                <span className="text-green-700 font-semibold">✔ Done</span>
              ) : (
                <button
                  onClick={() => markStageDone(step)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Mark as Done
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PipelineBoard;
