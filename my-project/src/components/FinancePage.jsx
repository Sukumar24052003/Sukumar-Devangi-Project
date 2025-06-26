

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import PdfLogo from '../assets/pdf.png';
import folderLogo from '../assets/vector-folder-icon.jpg'
import folderLogo1 from '../assets/folder-icon-2.png'
import { toast } from 'sonner';
const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white border shadow-sm rounded-xl ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-3 py-2 ${className}`}>{children}</div>
);

export default function FinancePage() {
  const [data, setData] = useState({});
  const [currentView, setCurrentView] = useState('year'); // 'year' | 'month' | 'documents'
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/finance`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching finance data:', err);
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    if (currentView === 'documents') {
      setCurrentView('month');
      setSelectedMonth(null);
    } else if (currentView === 'month') {
      setCurrentView('year');
      setSelectedYear(null);
    }
  };
const handleDownload = async (url, filename = 'document') => {
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
    toast.error('Failed to download file. Please try again.');
  }
};

  const journey = () => {
    if (currentView === 'year') return '';
    if (currentView === 'month') return `📁 ${selectedYear}`;
    if (currentView === 'documents') return `📁 ${selectedYear} / 📂 ${selectedMonth}`;
  };

  return (
    <div className="min-h-screen bg-[#fafafb] w-screen bg-white text-black flex flex-col lg:flex-row overflow-hidden">
      <Navbar />
      <main className="flex-1 h-full overflow-y-auto px-6 py-6 ml-0 lg:ml-64">
        {/* Journey Bar */}
        <div className="text-sm text-gray-500 mb-4">
          {currentView !== 'year' && (
            <button onClick={handleBack} className="text-black hover:underline mr-3">⬅ Back</button>
          )}
          {journey()}
        </div>

            <h2 className="text-2xl md:text-3xl font-sans font-normal">
          {currentView === 'year' && '📁 PO and Invoice'}
          {currentView === 'month' && '📂 Select a Month'}
          {currentView === 'documents' && '📄 Finance Documents'}
        </h2>

        {/* Year View */}
        {currentView === 'year' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.keys(data).map((year) => (
              <Card
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setCurrentView('month');
                }}
                className="cursor-pointer w-[80%] h-[100px] flex items-center justify-center hover:shadow-md"
              >
                {/* <CardContent className="text-lg font-semibold">📁 Year {year}</CardContent> */}
                <CardContent className="text-lg font-semibold"> <div className='flex flex-col'>
           
            <img src={folderLogo1} className='w-[40%] mx-auto'/>
            <div className='mx-auto'>Year {year}</div>
         </div></CardContent>
              </Card>
        
             
            ))}
          </div>
        )}

        {/* Month View */}
        {currentView === 'month' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.keys(data[selectedYear] || {}).map((month) => (
              <Card
                key={month}
                onClick={() => {
                  setSelectedMonth(month);
                  setCurrentView('documents');
                }}
                className="cursor-pointer w-[60%] h-[80px] flex items-center justify-center hover:shadow-md"
              >
            
                <CardContent className="text-md font-medium">
                 
         <div className='flex flex-col'>
           
            <img src={folderLogo1} className='w-[40%] mx-auto'/>
            <div className='mx-auto'>{month}</div>
         </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Documents View */}
        {currentView === 'documents' && (
          <>
            {/* Purchase Orders */}
            <div className="mt-6">
              <h2 className="font-semibold mb-4">Purchase Orders</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {data[selectedYear]?.[selectedMonth]?.purchaseOrders?.length > 0 ? (
                  data[selectedYear][selectedMonth].purchaseOrders.map((doc, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-sm h-[160px] w-full max-w-[140px] mx-auto"
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-white border rounded">
                        {doc.fileUrl?.endsWith('.pdf') ? (
                          <img src={PdfLogo} alt="PDF" className="w-6 h-6" />
                        ) : (
                          <span className="text-2xl">📄</span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-center line-clamp-2">{doc.documentName || 'PO Document'}</div>
                      {doc.fileUrl && (
                        // <a
                        //   href={doc.fileUrl}
                        //   download
                        //   className="mt-1 text-xs text-blue-600 hover:underline"
                        // >
                        //   Download
                        // </a>
                        <button
  onClick={() => handleDownload(doc.fileUrl, doc.documentName || 'po')}
  className="mt-1 text-xs text-blue-600 hover:underline"
>
  Download
</button>

                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 col-span-full">No POs available</div>
                )}
              </div>
            </div>

            {/* Invoices */}
            <div className="mt-6">
              <h2 className="font-semibold mb-4">Invoices</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {data[selectedYear]?.[selectedMonth]?.invoices?.length > 0 ? (
                  data[selectedYear][selectedMonth].invoices.map((doc, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-sm h-[160px] w-full max-w-[140px] mx-auto"
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-white border rounded">
                        {doc.fileUrl?.endsWith('.pdf') ? (
                          <img src={PdfLogo} alt="PDF" className="w-6 h-6" />
                        ) : (
                          <span className="text-2xl">📄</span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-center line-clamp-2">{doc.documentName || 'Invoice'}</div>
                      {doc.fileUrl && (
                        // <a
                        //   href={`${doc.fileUrl}`}
                        //   download
                        //   className="mt-1 text-xs text-blue-600 hover:underline"
                        // >
                        //   Download
                        // </a>
                        <button
    onClick={() => handleDownload(doc.fileUrl, doc.documentName || 'invoice')}
    className="mt-1 text-xs text-blue-600 hover:underline"
  >
    Download
  </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 col-span-full">No Invoices available</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
