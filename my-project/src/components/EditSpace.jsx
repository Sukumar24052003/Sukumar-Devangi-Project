
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { toast } from 'sonner';
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        toast.success('Space deleted successfully!');
        navigate('/'); // Go back to InventoryDashboard
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
      setSelectedFiles((prev) => ({
        ...prev,
        otherPhotos: Array.from(files),
      }));
    } else {
      setSelectedFiles((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      for (const key in space) {
        if (typeof space[key] !== 'object') {
          formData.append(key, space[key]);
        }
      }

      if (selectedFiles.mainPhoto) formData.append('mainPhoto', selectedFiles.mainPhoto);
      if (selectedFiles.longShot) formData.append('longShot', selectedFiles.longShot);
      if (selectedFiles.closeShot) formData.append('closeShot', selectedFiles.closeShot);
      if (selectedFiles.otherPhotos.length > 0) {
        selectedFiles.otherPhotos.forEach((photo) => formData.append('otherPhotos', photo));
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
         toast.success('Space updated successfully!');
        navigate(`/`);
      } else {
        toast.error('Failed to update space.');
      }
    } catch (error) {
      console.error('Error updating space:', error);
    }
  };

  if (!space) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-xs h-full w-screen bg-white text-black flex flex-col lg:flex-row overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 ml-0 lg:ml-64">
        <h1 className="text-2xl font-bold mb-4">Edit Space</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TEXT INPUT FIELDS */}
          <input name="spaceName" value={space.spaceName} onChange={handleChange} placeholder="Space Name" className="border px-3 py-2 rounded w-full" />
          <input name="landlord" value={space.landlord} onChange={handleChange} placeholder="Landlord" className="border px-3 py-2 rounded w-full" />
          {/* <input name="organization" value={space.organization} onChange={handleChange} placeholder="Organization" className="border px-3 py-2 rounded w-full" />
          <input name="peerMediaOwner" value={space.peerMediaOwner} onChange={handleChange} placeholder="Peer Media Owner" className="border px-3 py-2 rounded w-full" /> */}
<select
  name="spaceType"
  value={space.spaceType}
  onChange={handleChange}
  className="border px-3 py-2 rounded w-full"
>
  <option value="">Select Space Type</option>
  {spaceTypeOptions.map((opt) => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>

<select
  name="category"
  value={space.category}
  onChange={handleChange}
  className="border px-3 py-2 rounded w-full"
>
  <option value="">Select Category</option>
  {categoryOptions.map((opt) => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>

<select
  name="mediaType"
  value={space.mediaType}
  onChange={handleChange}
  className="border px-3 py-2 rounded w-full"
>
  <option value="">Select Media Type</option>
  {mediaTypeOptions.map((opt) => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>

          <input name="price" value={space.price} onChange={handleChange} placeholder="Price" type="number" className="border px-3 py-2 rounded w-full" />
          <input name="footfall" value={space.footfall} onChange={handleChange} placeholder="Footfall" type="number" className="border px-3 py-2 rounded w-full" />
          <select
  name="audience"
  value={space.audience}
  onChange={handleChange}
  className="border px-3 py-2 rounded w-full"
>
  <option value="">Select Audience</option>
  {audienceOptions.map((opt) => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>

<select
  name="demographics"
  value={space.demographics}
  onChange={handleChange}
  className="border px-3 py-2 rounded w-full"
>
  <option value="">Select Demographics</option>
  {demographicsOptions.map((opt) => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>

          <input name="address" value={space.address} onChange={handleChange} placeholder="Address" className="border px-3 py-2 rounded w-full" />
          <input name="city" value={space.city} onChange={handleChange} placeholder="City" className="border px-3 py-2 rounded w-full" />
          <input name="state" value={space.state} onChange={handleChange} placeholder="State" className="border px-3 py-2 rounded w-full" />
          <input name="latitude" value={space.latitude} onChange={handleChange} placeholder="Latitude" className="border px-3 py-2 rounded w-full" />
          <input name="longitude" value={space.longitude} onChange={handleChange} placeholder="Longitude" className="border px-3 py-2 rounded w-full" />
          <input name="zone" value={space.zone} onChange={handleChange} placeholder="Zone" className="border px-3 py-2 rounded w-full" />
          <select
  name="tier"
  value={space.tier}
  onChange={handleChange}
  className="border px-3 py-2 rounded w-full"
>
  <option value="">Select Tier</option>
  {tierOptions.map((opt) => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>

<select
  name="facing"
  value={space.facing}
  onChange={handleChange}
  className="border px-3 py-2 rounded w-full"
>
  <option value="">Select Facing</option>
  {facingOptions.map((opt) => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>

          <input name="faciaTowards" value={space.faciaTowards} onChange={handleChange} placeholder="Facia Towards" className="border px-3 py-2 rounded w-full" />
          <input name="tags" value={space.tags} onChange={handleChange} placeholder="Tags" className="border px-3 py-2 rounded w-full" />
          <input name="previousBrands" value={space.previousBrands} onChange={handleChange} placeholder="Previous Brands" className="border px-3 py-2 rounded w-full" />
          <input name="additionalTags" value={space.additionalTags} onChange={handleChange} placeholder="Additional Tags" className="border px-3 py-2 rounded w-full" />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={space.description}
            onChange={handleChange}
            placeholder="Description"
            className="border px-3 py-2 rounded w-full col-span-2 h-32"
          />

          <div className='flex'>
          <div className="col-span-2 flex flex-col gap-2">
  <label>Main Photo:</label>
  {space.mainPhoto && (
    <img
      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${space.mainPhoto}`}
      alt="Main"
      className="w-32 h-32 object-cover rounded-md mb-2"
    />
  )}
  <input type="file" name="mainPhoto" onChange={handleFileChange} />
</div>

<div className="col-span-2 flex flex-col gap-2">
  <label>Long Shot:</label>
  {space.longShot && (
    <img
      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${space.longShot}`}
      alt="Long Shot"
      className="w-32 h-32 object-cover rounded-md mb-2"
    />
  )}
  <input type="file" name="longShot" onChange={handleFileChange} />
</div>

<div className="col-span-2 flex flex-col gap-2">
  <label>Close Shot:</label>
  {space.closeShot && (
    <img
      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${space.closeShot}`}
      alt="Close Shot"
      className="w-32 h-32 object-cover rounded-md mb-2"
    />
  )}
  <input type="file" name="closeShot" onChange={handleFileChange} />
</div>

{/* <div className="col-span-2 flex flex-col gap-2">
  <label>Other Photos:</label>
  {space.otherPhotos && space.otherPhotos.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {space.otherPhotos.map((photo, index) => (
        <img
          key={index}
          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${photo}`}
          alt={`Other ${index + 1}`}
          className="w-24 h-24 object-cover rounded-md"
        />
      ))}
    </div>
  )}
  <input type="file" name="otherPhotos" multiple onChange={handleFileChange} />
</div> */}
</div>
        </div>

        {/* <button
          onClick={handleSave}
          className="mt-6 bg-black text-xs text-white px-4 py-2 rounded ml-[90%]"
        >
          Save
        </button> */}
        <div className="mt-4 mr-[5%] flex mt-[5%] gap-4">
        <button
    onClick={() => navigate(`/space/${id}`)}
    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
  >
    Cancel
  </button>
  <button
    onClick={handleDelete}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
  >
    Delete Space
  </button>
  <button
    onClick={handleSave}
    className="bg-black ml-auto text-white px-4 py-2 rounded transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
  >
    Save 
  </button>

 
</div>

      </main>
    </div>
  );
}
