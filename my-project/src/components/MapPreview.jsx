import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- FIX for broken marker icon ---
// Manually import the icon and shadow images
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Create a default icon instance and set it on Leaflet's prototype
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- End of FIX ---


export default function MapPreview({ latitude, longitude }) {
  // Use a ref to store the map instance to avoid re-initialization issues
  const mapRef = useRef(null);

  useEffect(() => {
    // Check if the map is already initialized
    if (mapRef.current === null) {
      // Initialize the map ONLY ONCE
      const map = L.map('map-preview').setView([latitude, longitude], 15);
      mapRef.current = map; // Store map instance in ref

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add the initial marker
      L.marker([latitude, longitude]).addTo(map);

      // Cleanup function to remove the map on component unmount
      return () => {
        map.remove();
        mapRef.current = null;
      };
    } else {
      // If map is already initialized, just update its view and marker position
      const map = mapRef.current;
      map.setView([latitude, longitude], 15);
      
      // A simple way to update marker: remove old layers and add a new one
      // For more complex scenarios, you'd store a reference to the marker itself
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
      L.marker([latitude, longitude]).addTo(map);
    }
  }, [latitude, longitude]);

  return <div id="map-preview" className="w-full h-64 rounded border" />;
}