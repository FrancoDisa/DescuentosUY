
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

// Importamos el archivo de configuración de iconos de Leaflet
import '@/utils/leafletIconSetup';

// El tipo de dato que este componente recibe (una sucursal con todos los datos)
type Branch = {
  store_id: string;
  branch_id: string;
  store_name: string;
  branch_name: string;
  latitude: number | null;
  longitude: number | null;
};

type MapProps = {
  stores: Branch[]; // La prop se sigue llamando 'stores' pero contiene sucursales
};

const defaultPosition: [number, number] = [-34.9011, -56.1645]; // Montevideo

type RecenterOnUserProps = {
  userLat: number | null;
  userLon: number | null;
};

function RecenterOnUser({ userLat, userLon }: RecenterOnUserProps) {
  const map = useMap();

  useEffect(() => {
    if (userLat !== null && userLon !== null) {
      map.setView([userLat, userLon]);
    }
  }, [map, userLat, userLon]);

  return null;
}

export function Map({ stores }: MapProps) {
  const searchParams = useSearchParams();
  const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const userLon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null;

  const mapCenter: [number, number] =
    userLat !== null && userLon !== null ? [userLat, userLon] : defaultPosition;

  return (
    <MapContainer center={mapCenter} zoom={14} style={{ height: '500px', width: '100%', borderRadius: '8px' }}>
      <RecenterOnUser userLat={userLat} userLon={userLon} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Marcador para la ubicación del usuario */}
      {userLat !== null && userLon !== null && (
        <Marker position={[userLat, userLon]}>
          <Popup>Tu ubicación</Popup>
        </Marker>
      )}

      {/* Marcadores para cada sucursal */}
      {stores && stores.map((branch) => {
        if (branch.latitude && branch.longitude) {
          return (
            <Marker key={branch.branch_id} position={[branch.latitude, branch.longitude]}>
              <Popup>
                <b>{branch.branch_name}</b>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}
