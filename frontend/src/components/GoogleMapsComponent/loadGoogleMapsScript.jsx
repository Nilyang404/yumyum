import React, { useEffect, useRef } from 'react';

const loadGoogleMapsScript = (callback) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const existingScript = document.getElementById('googleMapsScript');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en`;
    script.id = 'googleMapsScript';
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  } else if (callback) {
    callback();
  }
};

export default loadGoogleMapsScript;
