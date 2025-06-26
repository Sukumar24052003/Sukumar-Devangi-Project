import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useSpaceForm } from '../context/SpaceFormContext';
import { toast } from 'sonner';
import MapPreview from './MapPreview';

export default function AddSpaceForm() {
  const navigate = useNavigate();
  const {
    form,
    handleInputChange,
    step,
    setStep,
    completedSteps,
    setCompletedSteps,
    stepOrder
  } = useSpaceForm();

  const formatForInput = (dateStr) => {
    if (!dateStr) return '';
    const [dd, mm, yyyy] = dateStr.split('-');
    if (!yyyy || !mm || !dd) return '';
    return `${yyyy}-${mm}-${dd}`;
  };

  const validateCurrentStep = () => {
    // Updated to be consistent with all 'required' fields in the UI
    const mandatoryFieldsByStep = {
      'Basic': ['spaceName', 'landlord', 'spaceType', 'ownershipType', 'startDate', 'endDate', 'category', 'demographics'],
      'Specifications': form.spaceType === 'DOOH'
        ? ['illumination', 'unit', 'resolution', 'width', 'height']
        : ['illumination', 'width', 'height'],
      'Location': ['address', 'city', 'state', 'zip', 'latitude', 'longitude', 'zone', 'tier', 'facing']
    };

    const currentFields = mandatoryFieldsByStep[step] || [];
    for (const field of currentFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        // Capitalize first letter for a nicer toast message
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        toast.error(`Please fill the required field: ${fieldName}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }

    if (step === 'Location') {
      navigate('/preview-add-space');
      return; // Stop execution after navigating
    }

    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      const newStep = stepOrder[currentIndex - 1];
      setStep(newStep);
      setCompletedSteps((prev) => prev.filter((s) => s !== newStep));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const formData = new FormData();
    for (const key in form) {
      if (!['mainPhoto', 'longShot', 'closeShot', 'otherPhotos'].includes(key)) {
        formData.append(key, form[key]);
      }
    }

    if (form.mainPhoto) formData.append('mainPhoto', form.mainPhoto);
    if (form.longShot) formData.append('longShot', form.longShot);
    if (form.closeShot) formData.append('closeShot', form.closeShot);

    if (form.otherPhotos && Array.isArray(form.otherPhotos)) {
      form.otherPhotos.forEach((file) => {
        formData.append('otherPhotos', file);
      });
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/create`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      toast.success('Space created!');
      navigate('/success');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  };

  return (
    <div className="p-6 md:ml-64 min-h-screen">
      <Navbar />
      <form onSubmit={handleSubmit} className="max-w-screen-xl w-full mx-auto">
        <div className="text-2xl font-semibold mb-6">Create Spaces</div>

        <div className="flex gap-6 mb-6 text-sm font-medium">
          {stepOrder.map((label) => (
            <div
              key={label}
              className={`flex items-center gap-1 pb-1 min-w-fit ${
                step === label
                  ? 'border-b-2 border-black text-black'
                  : completedSteps.includes(label)
                  ? 'text-green-600'
                  : 'text-black'
              }`}
            >
              {completedSteps.includes(label) ? '✓' : ''} {label} Information
            </div>
          ))}
        </div>

        {step === 'Basic' && (
          <div className="flex w-full">
            <div className="grid grid-cols-1 text-xs lg:grid-cols-2">
              <div className="space-y-4">
                <Input label="Space name" mandatory="true" name="spaceName" value={form.spaceName} onChange={handleInputChange} required />
                <Input label="Landlord" name="landlord" mandatory="true" value={form.landlord} onChange={handleInputChange} required />
                <Input label="Inventory Owner (Organization)" name="organization" value={form.organization} disabled />
                <Input label="Peer Media Owner" name="peerMediaOwner" value={form.peerMediaOwner} onChange={handleInputChange} />
                <Select label="Space Type" mandatory="true" name="spaceType" value={form.spaceType} onChange={handleInputChange} required>
                  <option value="">Select...</option>
                  <option value="Billboard">Billboard</option>
                  <option value="DOOH">DOOH</option>
                  <option value="Pole kiosk">Pole kiosk</option>
                  <option value="Gantry">Gantry</option>
                </Select>
                <Select label="Ownership Type" mandatory="true" name="ownershipType" value={form.ownershipType} onChange={handleInputChange} required>
                  <option value="">Select...</option>
                  <option value="Owned">Owned</option>
                  <option value="Leased">Leased</option>
                  <option value="Traded">Traded</option>
                </Select>
                <Input
                  mandatory="true"
                  label={`${form.ownershipType || 'Contract'} Start Date`}
                  name="startDate"
                  type="date"
                  value={formatForInput(form.startDate)}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label={`${form.ownershipType || 'Contract'} End Date`}
                  name="endDate"
                  mandatory="true"
                  type="date"
                  value={formatForInput(form.endDate)}
                  onChange={handleInputChange}
                  required
                />
                <Select label="Category" mandatory="true" name="category" value={form.category} onChange={handleInputChange} required>
                  <option value="">Select...</option>
                  <option value="Retail">Retail</option>
                  <option value="Transit">Transit</option>
                </Select>
                <Input label="Price" name="price" value={form.price} onChange={handleInputChange} />
                <Input label="Footfall" name="footfall" value={form.footfall} onChange={handleInputChange} />
                <Select label="Audience" name="audience" value={form.audience} onChange={handleInputChange}>
                  <option value="">Select...</option>
                  <option value="Youth">Youth</option>
                  <option value="Working Professionals">Working Professionals</option>
                </Select>
                <Select label="Demographics" mandatory="true" name="demographics" value={form.demographics} onChange={handleInputChange} required>
                  <option value="">Select...</option>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </Select>
                <div>
                  <label className="text-sm">Description</label>
                  <textarea name="description" value={form.description} onChange={handleInputChange} className="w-full border px-3 py-2 rounded mt-1" rows={4} maxLength={400} />
                </div>
              </div>
            </div>
            <div className="pt-6 border-t mt-6 mr-6">
              <div className="text-lg font-semibold mb-4">Photo</div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImageUpload label="Upload Inventory Image" name="mainPhoto" />
                <div className="grid grid-cols-2 gap-4">
                  <ImageUpload label="Long Shot" name="longShot" />
                  <ImageUpload label="Close Shot" name="closeShot" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Other Images</label>
                  <div className="flex flex-col gap-2 mt-2">
                    <ImageUpload name="otherPhotos" multiple />
                    <span className="text-xs text-gray-600">To add more photos, click "Add More Photo" and select the files you wish to upload.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'Specifications' && (
          <div className="space-y-6 w-full text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Illumination" name="illumination" mandatory="true" value={form.illumination} onChange={handleInputChange} required>
                <option value="">Select...</option>
                <option value="Front Lit">Front Lit</option>
                <option value="Back Lit">Back Lit</option>
                <option value="Non Lit">Non Lit</option>
              </Select>

              {form.spaceType === 'DOOH' && (
                <>
                  <Input
                    label="Unit"
                    name="unit"
                    mandatory="true"
                    value={form.unit}
                    onChange={(e) => {
                      const { value } = e.target;
                      const maxMap = {
                        Billboard: 2,
                        DOOH: 10,
                        'Pole kiosk': 10,
                        Gantry: 1
                      };
                      const max = maxMap[form.spaceType];
                      if (value === '' || Number(value) <= max) {
                        handleInputChange(e);
                      } else {
                        toast.error(`Max units allowed for ${form.spaceType || 'this type'} is ${max}`);
                      }
                    }}
                    required
                  />
                  <Input label="Resolutions" mandatory="true" name="resolution" value={form.resolution} onChange={handleInputChange} />
                </>
              )}

              <Input label="Width (in ft)" mandatory="true" name="width" value={form.width} onChange={handleInputChange} required/>
              <Input label="Height (in ft)" mandatory="true" name="height" value={form.height} onChange={handleInputChange} required/>
            </div>
            <div className="space-y-4">
              <Input label="Additional Tags" name="additionalTags" value={form.additionalTags} onChange={handleInputChange} />
              <Input label="Previous brands" name="previousBrands" value={form.previousBrands} onChange={handleInputChange} />
              <Input label="Tags" name="tags" value={form.tags} onChange={handleInputChange} />
            </div>
          </div>
        )}

        {step === 'Location' && (
          <div className="grid text-xs grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Address" mandatory="true" name="address" value={form.address} onChange={handleInputChange} required/>
            <Input label="City" mandatory="true" name="city" value={form.city} onChange={handleInputChange} required />
            <Select label="State" mandatory="true" name="state" value={form.state} onChange={handleInputChange} required>
                <option value="">-- Select State --</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="Delhi">Delhi</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Ladakh">Ladakh</option>
                <option value="Lakshadweep">Lakshadweep</option>
                <option value="Puducherry">Puducherry</option>
            </Select>
            <Input label="Pin-code" mandatory="true" name="zip" value={form.zip} onChange={handleInputChange} required/>
            <Input label="Latitude" mandatory="true" name="latitude" value={form.latitude} onChange={handleInputChange} required/>
            <Input label="Longitude" mandatory="true" name="longitude" value={form.longitude} onChange={handleInputChange} required/>
            {form.latitude && form.longitude && !isNaN(parseFloat(form.latitude)) && !isNaN(parseFloat(form.longitude)) && (
              <div className="md:col-span-2">
                <label className="text-sm font-semibold mb-1 block">Map Preview</label>
                <MapPreview latitude={parseFloat(form.latitude)} longitude={parseFloat(form.longitude)} />
                <p className="mt-1 text-xs text-gray-500">
                  Real-time map preview from OpenStreetMap.
                </p>
              </div>
            )}
            <Input label="Landmark" name="landmark" value={form.landmark} onChange={handleInputChange} />
            <Select label="Zone" mandatory="true" name="zone" value={form.zone} onChange={handleInputChange} required>
              <option value="">Select...</option>
              <option value="West">West</option>
              <option value="East">East</option>
              <option value="North">North</option>
              <option value="South">South</option>
            </Select>
            <Select label="Tier" mandatory="true" name="tier" value={form.tier} onChange={handleInputChange} required>
              <option value="">Select...</option>
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Tier 3">Tier 3</option>
            </Select>
            <Select label="Facing" mandatory="true" name="facing" value={form.facing} onChange={handleInputChange} required>
              <option value="">Select...</option>
              <option value="Single facing">Single facing</option>
              <option value="Double facing">Double facing</option>
            </Select>
            <Input label="Facia towards" name="faciaTowards" value={form.faciaTowards} onChange={handleInputChange} />
          </div>
        )}
        
        <div className=" bg-white border-t pt-4 mt-12 pb-0">
          <div className="flex text-xs w-full justify-between mx-auto">
            <button
              type="button"
              className="border px-4 py-2 rounded"
              onClick={() => navigate(-1)} 
            >
              Cancel
            </button>
            <div className="space-x-2 text-xs">
              <button
                type="button"
                onClick={handleBack}
                className="bg-black text-white px-3 py-1 rounded"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-black text-white px-3 py-1 rounded"
              >
                {step === 'Location' ? 'Preview' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// MODIFIED: The label text is now red for mandatory fields.
function Input({ mandatory, label, ...props }) {
  return (
    <div>
      <label className={`text-sm ${mandatory === "true" ? "text-red-500" : ""}`}>{label}</label>
      {mandatory === "true" && <span className="ml-1 text-red-500">*</span>}
      <input {...props} className="w-3/4 block border px-2 py-1 rounded mt-1" />
    </div>
  );
}

// MODIFIED: The label text is now red for mandatory fields.
function Select({ mandatory, label, children, ...props }) {
  return (
    <div>
      <label className={`text-sm ${mandatory === "true" ? "text-red-500" : ""}`}>{label}</label>
      {mandatory === "true" && <span className="ml-1 text-red-500">*</span>}
      <select {...props} className="w-3/4 block border px-1 py-1 rounded mt-1">
        {children}
      </select>
    </div>
  );
}

function ImageUpload({ label, name, multiple = false }) {
  const { form, setForm } = useSpaceForm();

  const handleFileChange = (e) => {
    const files = multiple ? Array.from(e.target.files) : e.target.files[0];
    setForm((prev) => ({ ...prev, [name]: files }));
  };

  const preview =
    multiple && Array.isArray(form[name])
      ? form[name].map((file) => URL.createObjectURL(file))
      : form[name]
      ? URL.createObjectURL(form[name])
      : null;

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 h-48 relative bg-white flex flex-col items-center justify-center text-center">
      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-sm text-gray-500">
        {label || 'Upload Image'}
        <input type="file" accept="image/*" onChange={handleFileChange} multiple={multiple} className="hidden" />
        {preview && !multiple && (
          <img src={preview} alt="Preview" className="mt-2 h-20 object-contain" />
        )}
        {preview && multiple && (
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {preview.map((src, idx) => (
              <img key={idx} src={src} alt={`Preview ${idx}`} className="h-20 object-contain" />
            ))}
          </div>
        )}
      </label>
    </div>
  );
}