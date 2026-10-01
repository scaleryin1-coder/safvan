import { LocationCoordinates } from '../types';
import { DEFAULT_LOCATIONS } from '../data/mockData';

export interface PreciseLocationResult {
  success: boolean;
  location: LocationCoordinates;
  accuracyMeters: number;
  errorMessage?: string;
}

/**
 * Gets high-accuracy GPS coordinates using device sensors and resolves
 * precise human-readable street/locality address via reverse geocoding.
 */
export async function getHighAccuracyGPS(): Promise<PreciseLocationResult> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return {
      success: false,
      location: DEFAULT_LOCATIONS[0],
      accuracyMeters: 1000,
      errorMessage: 'Geolocation is not supported by your browser/device.'
    };
  }

  return new Promise((resolve) => {
    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0 // Do not use cached position
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 10);

        try {
          // Perform reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en'
              }
            }
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            
            const street = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
            const locality = addr.city || addr.town || addr.village || addr.municipality || 'Local Area';
            const district = addr.county || addr.state_district || 'Malappuram';
            const postcode = addr.postcode ? ` - ${addr.postcode}` : '';

            let displayName = locality;
            if (street && street !== locality) {
              displayName = `${street}, ${locality}`;
            }

            const fullAddress = data.display_name || `${displayName}, ${district}${postcode}`;

            resolve({
              success: true,
              location: {
                name: displayName,
                lat,
                lng,
                address: fullAddress,
                accuracyMeters: accuracy
              },
              accuracyMeters: accuracy
            });
            return;
          }
        } catch (e) {
          console.warn('Reverse geocoding fetch failed, calculating nearest hub', e);
        }

        // Fallback: match nearest local town
        const nearest = findNearestKnownLocation(lat, lng);
        const resolvedName = nearest.distanceKm < 5 
          ? nearest.location.name 
          : `Live GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        resolve({
          success: true,
          location: {
            name: resolvedName,
            lat,
            lng,
            address: `${resolvedName}, GPS Acc: ±${accuracy}m`,
            accuracyMeters: accuracy
          },
          accuracyMeters: accuracy
        });
      },
      (err) => {
        console.warn('GPS location error:', err.message);
        resolve({
          success: false,
          location: DEFAULT_LOCATIONS[0],
          accuracyMeters: 500,
          errorMessage: err.message || 'GPS location permission denied or timed out.'
        });
      },
      geoOptions
    );
  });
}

function findNearestKnownLocation(lat: number, lng: number): { location: LocationCoordinates; distanceKm: number } {
  let min = Infinity;
  let best = DEFAULT_LOCATIONS[0];

  for (const loc of DEFAULT_LOCATIONS) {
    const d = calculateDistance(lat, lng, loc.lat, loc.lng);
    if (d < min) {
      min = d;
      best = loc;
    }
  }

  return { location: best, distanceKm: min };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
