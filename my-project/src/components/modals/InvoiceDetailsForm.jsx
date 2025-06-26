

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PipelineContext } from '../../context/PipelineContext';
import { toast } from 'sonner';

export default function InvoiceForm({ campaignId, onConfirm, onClose }) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceValue, setInvoiceValue] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [isInvoiceSaved, setIsInvoiceSaved] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const { pipelineData, setPipelineData } = useContext(PipelineContext);
const username = localStorage.getItem('userName'); // Replace with your actual AuthContext or storage mechanism
  const useremail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}`);
        const invoice = res.data?.invoice || {};

        if (invoice.invoiceNumber) {
          setInvoiceNumber(invoice.invoiceNumber);
          setInvoiceDate(invoice.invoiceDate || '');
          setInvoiceValue(invoice.invoiceValue || '');
          setInvoiceUrl(invoice.documentUrl || '');
          setIsInvoiceSaved(true);
        }
      } catch (err) {
        console.error('Failed to fetch invoice data:', err);
      }
    };

    fetchInvoice();
  }, [campaignId]);

  const handleFileChange = (e) => {
    setInvoiceFile(e.target.files[0]);
  };

  const handleDownload = async () => {
    const response = await fetch(invoiceUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = invoiceUrl.split('/').pop();
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      // if (!invoiceFile) {
      //   toast.error('Please upload an invoice file before saving.');
      //   return;
      // }

      if (invoiceFile) {
        const formData = new FormData();
        formData.append('file', invoiceFile);

        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}/invoice/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      const previousInvoiceDetails = { ...pipelineData?.invoice }; // Capture the previous booking status

    const newInvoiceDetails = {
       invoiceNumber,
        invoiceDate,
        invoiceValue,
    };

    // Log the change to the ChangeLog table
    const changeLogData = {
      campaignId,
      userId: userId,  // Use username or email from localStorage or AuthContext
      changeType: 'Invoice details Update',
      userName:username,
      userEmail:useremail,
      previousValue: previousInvoiceDetails,
      newValue: newInvoiceDetails,
    };
console.log("Changelog data from fr is",changeLogData);
      const res1=await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/change-Log`, changeLogData); 
      console.log("Change log for booking status form is",res1);
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/campaign/${campaignId}/invoice`, {
        invoiceNumber,
        invoiceDate,
        invoiceValue,
      });

      setPipelineData(res.data);
      setIsInvoiceSaved(true);
      onConfirm();
    } catch (err) {
      console.error('Failed to save invoice details:', err);
    }
  };

  return (
    <div className="relative max-w-xl mx-auto mt-1 bg-white px-4 pt-0 pb-2 ">
      {/* Close Icon */}
      <button
        onClick={onClose}
        className="absolute top-0 right-0 text-red-600 hover:text-red-800 text-xl font-semibold focus:outline-none"
      >
        &times;
      </button>

      <h2 className="text-2xl mr-auto font-semibold mb-4 text-gray-800">Invoice Details</h2>

      {isInvoiceSaved ? (
        <div className="space-y-4 text-xs text-gray-700">
          <div>
            <label className="block">Invoice Number:</label>
            <p>{invoiceNumber}</p>
          </div>
          <div>
            <label className="block">Invoice Date:</label>
            <p>{invoiceDate}</p>
          </div>
          <div>
            <label className="block">Invoice Value:</label>
            <p>₹{invoiceValue}</p>
          </div>

          {invoiceUrl && (
            <div>
              <label className="block font-medium">Uploaded Invoice File:</label>
              <div className="flex gap-4 items-center">
                <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  View Invoice
                </a>
                <button onClick={handleDownload} className="text-green-700 underline hover:text-green-800">
                  ⬇ Download
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              placeholder="Enter Invoice No"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Value (₹)</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={invoiceValue}
              onChange={(e) => setInvoiceValue(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Upload Invoice Document</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          <div className="flex justify-end gap-4 mt-2">
            <button
              onClick={handleSave}
              className="w-[40%] text-xs bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
