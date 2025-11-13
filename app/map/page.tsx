'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '../components/DashboardLayout';
import { Home, Users, Eye, EyeOff } from 'lucide-react';

// Leaflet'i client-side only yükle
const PropertyMap = dynamic(() => import('../components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
      <p className="text-gray-500 dark:text-gray-400">Harita yükleniyor...</p>
    </div>
  ),
});

export default function MapPage() {
  const [showProperties, setShowProperties] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);

  // Mock data - gerçekte database'den gelecek
  const properties = [
    {
      id: '1',
      title: 'Caddebostan 3+1',
      status: 'satilik',
      type: 'daire',
      location: {
        il: 'istanbul',
        ilce: 'kadikoy',
        mahalle: 'caddebostan',
      },
      coordinates: [40.9717, 29.0572], // Caddebostan
      price: 5000000,
      details: {
        rooms: '3+1',
        squareMeters: 120,
      },
      features: {
        balcony: true,
        parking: true,
        inComplex: true,
        furnished: false,
        newBuilding: true,
      },
    },
    {
      id: '2',
      title: 'Bostancı 2+1',
      status: 'kiralik',
      type: 'daire',
      location: {
        il: 'istanbul',
        ilce: 'kadikoy',
        mahalle: 'bostanci',
      },
      coordinates: [40.9667, 29.0917], // Bostancı
      price: 25000,
      details: {
        rooms: '2+1',
        squareMeters: 95,
      },
      features: {
        balcony: true,
        parking: false,
        inComplex: false,
        furnished: true,
        newBuilding: false,
      },
    },
  ];

  const customers = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      phone: '0532 123 45 67',
      email: 'ahmet@email.com',
      status: 'aktif',
      coordinates: [40.9717, 29.0572], // Caddebostan
      criteria: {
        status: 'satilik',
        types: ['daire'],
        location: {
          il: 'istanbul',
          ilce: 'kadikoy',
          mahalleler: ['caddebostan', 'bostanci'],
        },
        budget: {
          min: 3000000,
          max: 6000000,
        },
        details: {
          minRooms: '2+1',
        },
        features: {
          balcony: true,
          parking: true,
          inComplex: true,
          furnished: true,
          newBuilding: false,
        },
      },
    },
  ];

  return (
    <DashboardLayout>
      {/* Kontrol Paneli */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setShowProperties(!showProperties)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              showProperties
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {showProperties ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <Home className="w-4 h-4" />
            Portföyler ({properties.length})
          </button>

          <button
            onClick={() => setShowCustomers(!showCustomers)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              showCustomers
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {showCustomers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <Users className="w-4 h-4" />
            Talepler ({customers.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Portföy</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Talep</span>
          </div>
        </div>
      </div>

      {/* Harita */}
      <div className="h-[calc(100vh-220px)] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <PropertyMap
          properties={showProperties ? properties : []}
          customers={showCustomers ? customers : []}
          center={[40.9717, 29.0572]}
          zoom={13}
        />
      </div>
    </DashboardLayout>
  );
}