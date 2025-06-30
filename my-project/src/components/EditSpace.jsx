import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { toast } from 'sonner';

// Reusable component for form fields
const FormField = ({ label, name, value, onChange, placeholder, type = 'text', children }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        {children ? (
            React.cloneElement(children, { id: name, name, value, onChange, className: "border px-3 py-2 rounded w-full text-sm" })
        ) : (
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="border px-3 py-2 rounded w-full text-sm"
            />
        )}
    </div>
);


export default function EditSpace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({
    mainPhoto: null,
    longShot: null,
    closeShot: null,
    otherPhotos: [],
  });

  const spaceTypeOptions = ['Billboard', 'Digital Screen'];
  const categoryOptions = ['Retail', 'Transit'];
  const mediaTypeOptions = ['Static', 'Digital'];
  const audienceOptions = ['Youth', 'Working Professionals'];
  const demographicsOptions = ['Urban', 'Rural'];
  const tierOptions = ['Tier 1', 'Tier 2', 'Tier 3'];
  const facingOptions = ['Single Facing', 'Double Facing'];

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${id}`);
        const data = await response.json();
        setSpace(data);
      } catch (error) {
        toast.error('Error fetching space details.');
        console.error('Error fetching space:', error);
      }
    };
    fetchSpace();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSpace((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this space? This action cannot be undone.');
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Space deleted successfully!');
        navigate('/inventory'); 
      } else {
        toast.error('Failed to delete space.');
      }
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('An error occurred while deleting.');
    }
  };
  

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "otherPhotos") {
      setSelectedFiles((prev) => ({ ...prev, otherPhotos: Array.from(files) }));
    } else {
      setSelectedFiles((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      // Append all space fields, including objects if needed
      Object.keys(space).forEach(key => {
        if (space[key] !== null && space[key] !== undefined) {
             formData.append(key, space[key]);
        }
      });

      if (selectedFiles.mainPhoto) formData.append('mainPhoto', selectedFiles.mainPhoto);
      if (selectedFiles.longShot) formData.append('longShot', selectedFiles.longShot);
      if (selectedFiles.closeShot) formData.append('closeShot', selectedFiles.closeShot);
      selectedFiles.otherPhotos.forEach((photo) => formData.append('otherPhotos', photo));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        toast.success('Space updated successfully!');
        navigate(`/space/${id}`);
      } else {
         const errorData = await response.json();
        toast.error(`Failed to update space: ${errorData.message || 'Server error'}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating.');
      console.error('Error updating space:', error);
    }
  };

  if (!space) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full w-screen bg-gray-50 text-black flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 ml-0 lg:ml-64">
        <h1 className="text-2xl font-bold mb-6">Edit Space</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <FormField label="Space Name" name="spaceName" value={space.spaceName} onChange={handleChange} placeholder="e.g., Main Street Billboard" />
                <FormField label="Landlord" name="landlord" value={space.landlord} onChange={handleChange} placeholder="e.g., John Doe" />
                <FormField label="Category" name="category" value={space.category} onChange={handleChange}>
                    <select><option value="">Select Category</option>{categoryOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </FormField>
                <FormField label="Space Type" name="spaceType" value={space.spaceType} onChange={handleChange}>
                    <select><option value="">Select Space Type</option>{spaceTypeOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </FormField>
                <FormField label="Media Type" name="mediaType" value={space.mediaType} onChange={handleChange}>
                    <select><option value="">Select Media Type</option>{mediaTypeOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </FormField>
                <FormField label="Price" name="price" type="number" value={space.price} onChange={handleChange} placeholder="e.g., 50000" />
                <FormField label="Footfall" name="footfall" type="number" value={space.footfall} onChange={handleChange} placeholder="e.g., 100000" />
                <FormField label="Audience" name="audience" value={space.audience} onChange={handleChange}>
                    <select><option value="">Select Audience</option>{audienceOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </FormField>
                <FormField label="Demographics" name="demographics" value={space.demographics} onChange={handleChange}>
                    <select><option value="">Select Demographics</option>{demographicsOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </FormField>
                <FormField label="Address" name="address" value={space.address} onChange={handleChange} placeholder="e.g., 123 Main St" />
                <FormField label="City" name="city" value={space.city} onChange={handleChange} placeholder="e.g., Mumbai" />
                <FormField label="State" name="state" value={space.state} onChange={handleChange} placeholder="e.g., Maharashtra" />
                <FormField label="Latitude" name="latitude" value={space.latitude} onChange={handleChange} placeholder="e.g., 19.0760" />
                <FormField label="Longitude" name="longitude" value={space.longitude} onChange={handleChange} placeholder="e.g., 72.8777" />
                <FormField label="Zone" name="zone" value={space.zone} onChange={handleChange} placeholder="e.g., South" />
                <FormField label="Tier" name="tier" value={space.tier} onChange={handleChange}>
                    <select><option value="">Select Tier</option>{tierOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </FormField>
                <FormField label="Facing" name="facing" value={space.facing} onChange={handleChange}>
                    <select><option value="">Select Facing</option>{facingOptions.map(o=><option key={o} value={o}>{o}</option>)}</select>
                </FormField>
                <FormField label="Facia Towards" name="faciaTowards" value={space.faciaTowards} onChange={handleChange} placeholder="e.g., Main Road" />
                <FormField label="Total Units" name="unit" type="number" value={space.unit || ''} onChange={handleChange} placeholder="e.g., 10" />
                <FormField label="Occupied Units" name="occupiedUnits" type="number" value={space.occupiedUnits || ''} onChange={handleChange} placeholder="e.g., 4" />
                <div className="md:col-span-2 lg:col-span-3">
                    <FormField label="Description" name="description" value={space.description} onChange={handleChange}>
                        <textarea placeholder="Detailed description of the space..." className="h-24"></textarea>
                    </FormField>
                </div>
                {/* Image Uploads */}
                <div className="md:col-span-2 lg:col-span-3 pt-4 mt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Main Photo</label>
                            {space.mainPhoto && <img src={`${import.meta.env.VITE_API_BASE_URL}${space.mainPhoto}`} alt="Main" className="w-32 h-32 object-cover rounded-md mb-2 shadow-sm"/>}
                            <input type="file" name="mainPhoto" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Long Shot</label>
                            {space.longShot && <img src={`${import.meta.env.VITE_API_BASE_URL}${space.longShot}`} alt="Long Shot" className="w-32 h-32 object-cover rounded-md mb-2 shadow-sm"/>}
                            <input type="file" name="longShot" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Close Shot</label>
                            {space.closeShot && <img src={`${import.meta.env.VITE_API_BASE_URL}${space.closeShot}`} alt="Close Shot" className="w-32 h-32 object-cover rounded-md mb-2 shadow-sm"/>}
                            <input type="file" name="closeShot" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t flex items-center justify-end gap-3">
            <button onClick={() => navigate(`/space/${id}`)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-semibold">
                Cancel
            </button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-semibold">
                Delete Space
            </button>
            <button onClick={handleSave} className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 text-sm font-semibold">
                Save Changes
            </button>
        </div>

      </main>
    </div>
  );
}