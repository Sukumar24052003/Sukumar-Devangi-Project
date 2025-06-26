import React, { useState } from 'react';
import axios from 'axios';

export const UploadArtworkForm = ({ bookingId, onSuccess }) => {
  const [files, setFiles] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    for (let file of files) {
      formData.append('artwork', file);
    }

    await axios.post(`/api/booking/${bookingId}/upload-artwork`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    onSuccess();
  };

  return (
    <div className="space-x-2">
      <input
        type="file"
        multiple
        onChange={e => setFiles(e.target.files)}
        className="block"
      />
      <button onClick={handleUpload} className="bg-purple-600 text-white px-3 py-1 rounded">Upload</button>
    </div>
  );
};
