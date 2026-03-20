import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Vite/React builds
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function RadarMap({ center, myLocation }) {
  const mapCenter = center || [28.6139, 77.2090]; // fallback Delhi

  return (
    <div style={{ height: '420px', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {myLocation ? (
          <Marker position={[myLocation.lat, myLocation.lng]}>
            <Popup>You are here 📍</Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}

export default RadarMap;