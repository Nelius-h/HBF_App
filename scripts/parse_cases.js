// Script to build the full 176 HBF stock theft VIS case database
const fs = require('fs');

// Function to convert DMS string like '26°50\'55.9"S 26°25\'33.3"E' to { latitude, longitude }
function parseGps(dmsStr) {
  if (!dmsStr || dmsStr.includes('NOT IN SOURCE DATA') || dmsStr.trim() === '') {
    return null;
  }
  
  // Format: 26°50'55.9"S 26°25'33.3"E or similar
  const latMatch = dmsStr.match(/(\d+)°(\d+)'([\d.]+)"?\s*([SN])/i);
  const lngMatch = dmsStr.match(/(\d+)°(\d+)'([\d.]+)"?\s*([EW])/i);
  
  if (!latMatch || !lngMatch) return null;
  
  let lat = parseInt(latMatch[1], 10) + parseInt(latMatch[2], 10)/60 + parseFloat(latMatch[3])/3600;
  if (latMatch[4].toUpperCase() === 'S') lat = -lat;
  
  let lng = parseInt(lngMatch[1], 10) + parseInt(lngMatch[2], 10)/60 + parseFloat(lngMatch[3])/3600;
  if (lngMatch[4].toUpperCase() === 'W') lng = -lng;
  
  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6))
  };
}

console.log('Test GPS:', parseGps('26°50\'55.9"S 26°25\'33.3"E'));
