

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useSpaceForm } from '../context/SpaceFormContext';
import { toast } from 'sonner'; // ✅ Import toast

export default function PreviewAddSpace() {
  const navigate = useNavigate();
  const { form, stepOrder, completedSteps } = useSpaceForm();
console.log("basic details",form);
  const handleBack = () => {
    navigate('/add-space');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Update form.dates from form.startDate and form.endDate
form.dates = [form.startDate, form.endDate];


    const formData = new FormData();

    for (const key in form) {
      if (!['mainPhoto', 'longShot', 'closeShot', 'otherPhotos', 'dates'].includes(key)) {
        formData.append(key, form[key]);
      }
    }
    
    // Special handling for dates
    if (Array.isArray(form.dates)) {
      form.dates.forEach(date => {
        formData.append('dates', date); // ✅ Add each date separately
      });
    }
    
    if (form.mainPhoto) formData.append('mainPhoto', form.mainPhoto);
    if (form.longShot) formData.append('longShot', form.longShot);
    if (form.closeShot) formData.append('closeShot', form.closeShot);
    if (form.otherPhotos && Array.isArray(form.otherPhotos)) {
      form.otherPhotos.forEach((file) => {
        formData.append('otherPhotos', file);
      });
    }

    const loadingToast = toast.loading('Saving Space...'); // ✅ Show loading toast

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/create`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      toast.success('Space created successfully!', { id: loadingToast }); // ✅ Replace loading toast with success
      setTimeout(() => {
        navigate('/'); // ✅ Redirect to home after success
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!', { id: loadingToast }); // ✅ Replace loading toast with error
    }
  };

  return (
    <div className="p-6 text-xs md:ml-64 w-full min-h-screen">
      <Navbar />
      <form onSubmit={handleSubmit} className="max-w-screen-xl mx-auto space-y-8">
        <div className="text-2xl font-semibold">Create Spaces</div>

        {/* Stepper */}
        <div className="flex gap-6 text-sm font-medium">
          {stepOrder.slice(0, 3).map((label) => (
            <div
              key={label}
              className={
                completedSteps.includes(label)
                  ? 'text-green-600 flex items-center gap-1'
                  : 'text-black flex items-center gap-1'
              }
            >
              {completedSteps.includes(label) ? '✓' : ''} {label} Information
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Box */}
          <div className="rounded flex justify-center p-4">
            {form.mainPhoto ? (
              <img
                src={URL.createObjectURL(form.mainPhoto)}
                alt="Main Preview"
                className="object-cover h-32 w-32 rounded"
              />
            ) : (
              <span className="text-gray-500 text-lg">No Image Uploaded</span>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="text-lg font-bold">{form.spaceName}</div>
              <div className="flex gap-4 text-sm mt-1">
                <span className="text-blue-700 font-semibold">{form.spaceType}</span>
                <span className="text-purple-700 font-semibold">{form.category}</span>
              </div>
              <div className="text-2xl font-bold mt-2">{form.ownershipType}</div>
             
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div>Advertising brands</div>
                <div className="text-gray-500">{form.previousBrands}</div>
              </div>
              <div>
                <div>Advertising tags</div>
                <div className="text-gray-500">{form.tags}</div>
              </div>
              <div>
                <div>Demographics</div>
                <div className="text-gray-500">{form.demographics}</div>
              </div>
              <div>
                <div>Additional Tags</div>
                <div className="text-gray-500">{form.additionalTags}</div>
              </div>
              <div>
                <div>Price</div>
                <div className="text-gray-500">{form.price}</div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-2">
              <div className="font-semibold">Specifications</div>
              <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded">
                {/* <div><strong>Media Type</strong><br />{form.mediaType}</div> */}
               { form.illumination && <div><strong>Illumination</strong><br />{form.illumination}</div> }
                <div><strong>Size (WxH)</strong><br />{form.width}ft x {form.height}ft</div>
                <div><strong>Unit</strong><br />{form.unit}</div> 
                {form.resolution && <div><strong>Resolution</strong><br />{form.resolution}</div> }
                <div><strong>Facing</strong><br />{form.facing}</div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="font-semibold">Location</div>
              <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded">
                <div><strong>Address</strong><br />{form.address}</div>
                <div><strong>City</strong><br />{form.city}</div>
                <div><strong>Pin Code</strong><br />{form.zip}</div>
                <div><strong>State</strong><br />{form.state}</div>
                <div><strong>Tier</strong><br />{form.tier}</div>
                <div><strong>Facia Towards</strong><br />{form.faciaTowards}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="border px-3 py-1 rounded"
          >
            Cancel
          </button>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleBack}
              className="bg-black text-white px-3 py-1 rounded"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-[#FF5733] text-white px-3 py-1 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
