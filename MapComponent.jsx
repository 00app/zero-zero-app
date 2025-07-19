import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 51.5074, // Replace with your desired latitude
  lng: -0.1278, // Replace with your desired longitude
};

function MyMap() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyDWt94-vrRm18Rr9N-GGc_zhZ6xdR3GOQs">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}

export default MyMap;
