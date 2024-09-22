let watchId;  // To store the watch ID
let map, marker;  // Variables to hold the map and marker objects
let lastPosition = null;  // Store the last known position
const UNUSUAL_ACTIVITY_THRESHOLD = 500;  // Threshold for unusual activity in meters

function makeEmergencyCall() {
  // This will open the phone dialer with the emergency number 911.
  window.location.href = "tel:911";
}


// Example: Defining unsafe areas by latitude and longitude
const unsafeAreas = [
  {
    name: "Theft Zone 1",
    latMin: 22.5726,  // Latitude range for the unsafe area
    latMax: 22.5735,
    lonMin: 88.3639,  // Longitude range for the unsafe area
    lonMax: 88.3649
  },
  {
    name: "Unsafe Area 2",
    latMin: 22.5710,  // Another unsafe area
    latMax: 22.5715,
    lonMin: 88.3620,
    lonMax: 88.3625
  }
];

// Function to start watching location
function startWatching() {
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(showPosition, showError, {
      enableHighAccuracy: true, 
      timeout: 5000,
      maximumAge: 0
    });

    document.getElementById("start-watch").disabled = true;
    document.getElementById("stop-watch").disabled = false;
    document.getElementById("status").innerText = "Watching location...";
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Function to stop watching location
function stopWatching() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    document.getElementById("start-watch").disabled = false;
    document.getElementById("stop-watch").disabled = true;
    document.getElementById("status").innerText = "Stopped watching location.";
  }
}

// Calculate the distance between two geographic points using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;  // Distance in meters
  return distance;
}

// Function to initialize the map
function initMap(lat, lon) {
  map = L.map('map').setView([lat, lon], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  marker = L.marker([lat, lon]).addTo(map);
}

// Update map and marker with the current location
function updateMap(lat, lon) {
  if (marker) {
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon]);
  } else {
    initMap(lat, lon);
  }
}

// Update notification card when unusual or unsafe activity is detected
function updateNotification(message) {
  document.getElementById("notification-message").innerText = message;
}

// Check if the current position falls into any unsafe area
function checkUnsafeArea(lat, lon) {
  for (let area of unsafeAreas) {
    if (lat >= area.latMin && lat <= area.latMax && lon >= area.lonMin && lon <= area.lonMax) {
      return `Warning: Unsafe activity detected in ${area.name}.`;
    }
  }
  return null;
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  document.getElementById("latitude").innerText = latitude;
  document.getElementById("longitude").innerText = longitude;
  document.getElementById("accuracy").innerText = accuracy;
  document.getElementById("status").innerText = "Location updated.";

  // Update the map with the new position
  updateMap(latitude, longitude);

  // Detect unusual activity based on distance from the last known location
  if (lastPosition) {
    const distance = calculateDistance(
      lastPosition.latitude, lastPosition.longitude,
      latitude, longitude
    );
    if (distance > UNUSUAL_ACTIVITY_THRESHOLD) {
      updateNotification("Unusual activity detected! Large movement of " + distance.toFixed(2) + " meters.");
    }
  }

  // Check for unsafe areas and update notification
  const unsafeMessage = checkUnsafeArea(latitude, longitude);
  if (unsafeMessage) {
    updateNotification(unsafeMessage);
  }

  // Update last known position
  lastPosition = {
    latitude: latitude,
    longitude: longitude
  };
}

function showError(error) {
  let errorMessage = "";

  switch (error.code) {
    case error.PERMISSION_DENIED:
      errorMessage = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      errorMessage = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      errorMessage = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      errorMessage = "An unknown error occurred.";
      break;
  }

  document.getElementById("status").innerText = errorMessage;
}

  