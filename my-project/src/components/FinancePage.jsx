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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    // MODIFICATION: Changed background color class here
    <div className="min-h-screen bg-gray-100 w-screen text-black flex flex-col lg:flex-row overflow-hidden">
      <Navbar />
      <main className="flex-1 h-full overflow-y-auto px-6 py-6 ml-0 lg:ml-64">
        {/* Journey Bar */}
        <div className="text-sm text-gray-500 mb-4">
          {currentView !== 'year' && (
            <button onClick={handleBack} className="text-black hover:underline mr-3">⬅ Back</button>
          )}
          {journey()}
        </div>

        <h2 className="text-2xl md:text-3xl font-sans font-normal mb-6">
          {currentView === 'year' && '📁 PO and Invoice'}
          {currentView === 'month' && '📂 Select a Month'}
          {currentView === 'documents' && '📄 Finance Documents'}
        </h2>

        {/* Year View */}
        {currentView === 'year' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Object.keys(data).map((year) => (
              <Card
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setCurrentView('month');
                }}
                className="cursor-pointer flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow"
              >
                <img src={folderLogo1} className='w-1/2 mb-2'/>
                <div className='font-semibold'>Year {year}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Month View */}
        {currentView === 'month' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Object.keys(data[selectedYear] || {}).map((month) => (
              <Card
                key={month}
                onClick={() => {
                  setSelectedMonth(month);
                  setCurrentView('documents');
                }}
                className="cursor-pointer flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow"
              >
                <img src={folderLogo1} className='w-1/2 mb-2'/>
                <div className='font-medium'>{month}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Documents View */}
        {currentView === 'documents' && (
          <>
            {/* Purchase Orders */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Purchase Orders</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {data[selectedYear]?.[selectedMonth]?.purchaseOrders?.length > 0 ? (
                  data[selectedYear][selectedMonth].purchaseOrders.map((doc, i) => (
                    <div
                      key={`po-${i}`}
                      className="flex flex-col items-center bg-white border p-4 rounded-lg shadow-sm w-full max-w-[150px] mx-auto"
                    >
                      <div className="w-16 h-16 flex items-center justify-center mb-2">
                        {doc.fileUrl?.endsWith('.pdf') ? (
                          <img src={PdfLogo} alt="PDF" className="w-10 h-10" />
                        ) : (
                          <span className="text-4xl">📄</span>
                        )}
                      </div>
                      <div className="text-xs text-center line-clamp-2 font-medium flex-grow mb-2">{doc.documentName || 'PO Document'}</div>
                      {doc.fileUrl && (
                        <button
                          onClick={() => handleDownload(doc.fileUrl, doc.documentName || 'po')}
                          className="mt-auto text-xs text-blue-600 hover:underline"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 col-span-full">No purchase orders available for this month.</div>
                )}
              </div>
            </div>

            {/* Invoices */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Invoices</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {data[selectedYear]?.[selectedMonth]?.invoices?.length > 0 ? (
                  data[selectedYear][selectedMonth].invoices.map((doc, i) => (
                    <div
                      key={`invoice-${i}`}
                      className="flex flex-col items-center bg-white border p-4 rounded-lg shadow-sm w-full max-w-[150px] mx-auto"
                    >
                      <div className="w-16 h-16 flex items-center justify-center mb-2">
                        {doc.fileUrl?.endsWith('.pdf') ? (
                          <img src={PdfLogo} alt="PDF" className="w-10 h-10" />
                        ) : (
                          <span className="text-4xl">📄</span>
                        )}
                      </div>
                      <div className="text-xs text-center line-clamp-2 font-medium flex-grow mb-2">{doc.documentName || 'Invoice'}</div>
                      {doc.fileUrl && (
                        <button
                            onClick={() => handleDownload(doc.fileUrl, doc.documentName || 'invoice')}
                            className="mt-auto text-xs text-blue-600 hover:underline"
                          >
                            Download
                          </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 col-span-full">No invoices available for this month.</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}