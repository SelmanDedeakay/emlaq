'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  properties?: any[];
  customers?: any[];
  center?: [number, number];
  zoom?: number;
}

export default function PropertyMap({ 
  properties = [], 
  customers = [],
  center = [40.9917, 29.0252], // Kadıköy default
  zoom = 13 
}: MapProps) {
  
  // Portföy için mavi marker
  const propertyIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Müşteri için yeşil marker
  const customerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Portföy Markerları */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={property.coordinates || [40.9917, 29.0252]}
            icon={propertyIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-blue-600">{property.title}</h3>
                <p className="text-sm text-gray-600">{property.location.mahalle}</p>
                <p className="text-sm font-semibold">{property.price.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-gray-500">{property.details.rooms} • {property.details.squareMeters}m²</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Müşteri Talep Markerları */}
        {customers.map((customer) => (
          customer.criteria.location.mahalleler.map((mahalle: string, idx: number   ) => (
            <Marker
              key={`${customer.id}-${idx}`}
              position={customer.coordinates || [40.9917, 29.0252]}
              icon={customerIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-green-600">{customer.name}</h3>
                  <p className="text-sm text-gray-600">Aranan: {mahalle}</p>
                  <p className="text-sm font-semibold">
                    {customer.criteria.budget.min.toLocaleString('tr-TR')} - {customer.criteria.budget.max.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              </Popup>
            </Marker>
          ))
        ))}
      </MapContainer>
    </div>
  );
}