
import React, { useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
export default function ProposalForm() {
  const navigate = useNavigate();
  const [selectedSpaces, setSelectedSpaces] = useState([]);
  // const [startMonth, setStartMonth] = useState('');
  // const [endMonth, setEndMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  

  const [step, setStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    clientName: '',
    clientContactName: '',
    clientContactPhone: '',
    clientContactEmail: '',
    alternateEmail: '',
    companyAddress: '',
    industry: '',
    description: ''
  });

  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const spaces = [
    {
      id: 1, name: "Chembur Twins", status: "Available", city: "Mumbai", facia: "Chembur to AmarMahal",
      category: "Digital Screen", subCategory: "DOOH", price: 50000, monthsAvailable: ["January", "February", "March"],
      availableFrom: "2025-06-15",
    availableTo: "2025-08-15"
    },
    {
      id: 2, name: "TITAN – JVLR", status: "Available", city: "Mumbai", facia: "EEH To Powai",
      category: "Digital Screen", subCategory: "DOOH", price: 60000, monthsAvailable: ["April", "May", "June"],
      availableFrom: "2025-05-01",
    availableTo: "2025-07-31"
    },
    {
      id: 3, name: "TITANIC – JVLR", status: "Available", city: "Mumbai", facia: "Powai to EEH",
      category: "Digital Screen", subCategory: "DOOH", price: 58000, monthsAvailable: ["January", "May", "December"],availableFrom: "2025-04-01",
    availableTo: "2025-12-31"
    },
    {
      id: 4, name: "Prince Of Powai", status: "Available", city: "Mumbai", facia: "EEH To Powai",
      category: "Digital Screen", subCategory: "DOOH", price: 55000, monthsAvailable: ["July", "August"],
      availableFrom: "2025-07-01",
    availableTo: "2025-08-31"
    },
    {
      id: 5, name: "Powai Near IIT", status: "Available", city: "Mumbai", facia: "Powai to EEH",
      category: "Digital Screen", subCategory: "DOOH", price: 62000, monthsAvailable: ["September", "October"],
      availableFrom: "2025-09-01",
    availableTo: "2025-10-31"
    }
  ];

  const toggleSpaceSelection = (id) => {
    const alreadySelected = selectedSpaces.find((s) => s.id === id);
    if (alreadySelected) {
      setSelectedSpaces(selectedSpaces.filter((s) => s.id !== id));
    } else {
      const fullSpace = spaces.find((s) => s.id === id);
      setSelectedSpaces([...selectedSpaces, fullSpace]);
    }
  };

  const totalPrice = selectedSpaces.reduce((sum, space) => sum + (space.price || 0), 0);

  const monthIndex = (month) => allMonths.indexOf(month);
  // const isSpaceAvailableInRange = (space) => {
  //   if (!startMonth || !endMonth) return true;
  //   const start = monthIndex(startMonth);
  //   const end = monthIndex(endMonth);
  //   return space.monthsAvailable.some(month => {
  //     const idx = monthIndex(month);
  //     return idx >= start && idx <= end;
  //   });
  // };
  const isSpaceAvailableInRange = (space) => {
    if (!startDate || !endDate) return true;
  
    const selectedStart = new Date(startDate);
    const selectedEnd = new Date(endDate);
    const spaceStart = new Date(space.availableFrom);
    const spaceEnd = new Date(space.availableTo);
  
    return spaceStart <= selectedEnd && spaceEnd >= selectedStart;
  };
  

  const filteredSpaces = spaces.filter(isSpaceAvailableInRange);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);
  const handleSubmit = () => {
    toast.success('Submitting proposal...');
    navigate('/create-booking-addSpaces');
  };

  const handlePreview = () => setPreviewMode(true);
  const closePreview = () => setPreviewMode(false);

  return (
    <div className="p-6 md:ml-64 min-h-screen">
      <Navbar />
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Create Proposal</h2>

        {!previewMode && (
          <>
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Company Name" name="companyName" onChange={handleChange} value={formData.companyName} />
                <Input label="Client Name" name="clientName" onChange={handleChange} value={formData.clientName} />
                <Input label="Contact Person's Name" name="clientContactName" onChange={handleChange} value={formData.clientContactName} />
                <Input label="Phone" name="clientContactPhone" onChange={handleChange} value={formData.clientContactPhone} />
                <Input label="Email" name="clientContactEmail" onChange={handleChange} value={formData.clientContactEmail} />
                <Input label="Alternate Email" name="alternateEmail" onChange={handleChange} value={formData.alternateEmail} />
                <Input label="Company Address" name="companyAddress" onChange={handleChange} value={formData.companyAddress} />
                <div>
                  <label className="text-xs font-medium">Industry *</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} className="w-full text-xs border px-2 py-2 rounded mt-1">
                    <option value="">Select...</option>
                    <option>Automotive</option>
                    <option>Clothing & Apparel</option>
                    <option>Ecommerce</option>
                    <option>EdTech</option>
                    <option>Entertainment</option>
                    <option>FMCG</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
  <div>
    <label className="text-xs font-medium">Start Date</label>
    <input
      type="date"
      className="w-full border px-2 py-1 rounded mt-1"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>
  <div>
    <label className="text-xs font-medium">End Date</label>
    <input
      type="date"
      className="w-full border px-2 py-1 rounded mt-1"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>
</div>

                  {/* <div>
                    <label className="text-sm font-medium">Start Month</label>
                    <select className="w-full border px-3 py-2 rounded mt-1" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                      <option value="">Select...</option>
                      {allMonths.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Month</label>
                    <select className="w-full border px-3 py-2 rounded mt-1" value={endMonth} onChange={(e) => setEndMonth(e.target.value)}>
                      <option value="">Select...</option>
                      {allMonths.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div> */}
                </div>

                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">Space Name</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Facia</th>
                        <th className="px-4 py-2">City</th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Sub Category</th>
                        {/* <th className="px-4 py-2">Price</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSpaces.map((space) => (
                        <tr key={space.id} className="border-t text-center">
                          <td className="px-2 py-2">
                            <input type="checkbox" checked={selectedSpaces.some((s) => s.id === space.id)} onChange={() => toggleSpaceSelection(space.id)} />
                          </td>
                          <td className="px-2 py-2 text-left text-black">{space.name}</td>
                          <td className="px-2 py-2">{space.status}</td>
                          <td className="px-2 py-2">{space.facia}</td>
                          <td className="px-2 py-2">{space.city}</td>
                          <td className="px-2 py-2">{space.category}</td>
                          <td className="px-2 py-2">{space.subCategory}</td>
                          {/* <td className="px-2 py-2">₹{space.price.toLocaleString()}</td> */}
                        </tr>
                      ))}
                    </tbody>
                    {/* <tfoot className="bg-gray-50 font-semibold">
                      <tr>
                        <td colSpan="7" className="text-right px-4 py-2">Total Price:</td>
                        <td className="px-4 py-2">₹{totalPrice.toLocaleString()}</td>
                      </tr>
                    </tfoot> */}
                  </table>
                </div>

                <div className="mt-6">
                  <label className="text-xs font-medium">Estimated Price</label>
                  <input
                    name="price"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-[20%] block text-xs border px-2 py-1 rounded mt-1"
                    placeholder="Enter Price"
                  />
                </div>

                <div className="mt-6">
                  <label className="text-xs font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded mt-1"
                    rows={4}
                    placeholder="Maximum 400 characters"
                  />
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button className="border px-3 py-1 rounded">Cancel</button>
              <div className="space-x-2">
                {step === 2 && (
                  <button onClick={handleBack} className="bg-black text-white px-3 py-1 rounded">Back</button>
                )}
                {step === 1 ? (
                  <button onClick={handleNext} className="bg-black text-white px-3 py-1 rounded">Next</button>
                ) : (
                  <>
                    <button onClick={handlePreview} className="bg-black text-white px-3 py-1 rounded">Preview</button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

{previewMode && (
  <div className="border w-[300%] mt-8 p-6 text-sm rounded bg-gray-50">
    <h3 className="text-xl font-semibold mb-4">Preview Proposal</h3>
    <p><strong>Company:</strong> {formData.companyName}</p>
    <p><strong>Client:</strong> {formData.clientName}</p>
    <p><strong>Contact:</strong> {formData.clientContactName}, {formData.clientContactPhone}, {formData.clientContactEmail}</p>
    <p><strong>Alternate Email:</strong> {formData.alternateEmail}</p>
    <p><strong>Address:</strong> {formData.companyAddress}</p>
    <p><strong>Industry:</strong> {formData.industry}</p>
    <p><strong>Deal Period:</strong> {startDate} to {endDate}</p>

    {/* <p><strong>Deal Period:</strong> {startMonth} to {endMonth}</p> */}
    <p><strong>Description:</strong> {formData.description}</p>

    <p className="mt-4"><strong>Selected Spaces:</strong></p>
    <ul className="list-disc ml-6">
      {selectedSpaces.length > 0 ? (
        selectedSpaces.map(space => (
          <li key={space.id}>{space.name} – ₹{space.price.toLocaleString()}</li>
        ))
      ) : (
        <li>No spaces selected</li>
      )}
    </ul>

    <p className="mt-2"><strong>Total Price:</strong> ₹{totalPrice.toLocaleString()}</p>

    {/* Navigation Buttons */}
    <div className="flex justify-end mt-6 space-x-2">
      <button onClick={() => setPreviewMode(false)} className="px-3 py-1 bg-black text-white rounded">Back</button>
      <button onClick={handleSubmit} className="px-3 py-1 bg-black text-white rounded">Submit</button>
    </div>
  </div>
)}

      </div>
    </div>
  );
}

function Input({ label, value, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <input {...props} value={value} className="w-full border px-2 py-1 rounded mt-1" />
    </div>
  );
}

