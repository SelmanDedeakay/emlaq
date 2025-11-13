'use client';

import { useParams } from 'next/navigation';
import Logo from '../../components/Logo';
import MatchCard from '../../components/MatchCard';
import { ArrowLeft, Home, MapPin, Banknote, Maximize } from 'lucide-react';
import Link from 'next/link';
import { matchPropertyToCustomers } from '../../utils/matching';

export default function PropertyDetailPage() {
  const params = useParams();
  
  // Mock data - gerçekte database'den gelecek
  const property = {
    id: params.id,
    title: 'Caddebostan 3+1 Daire',
    status: 'satilik',
    type: 'daire',
    location: {
      il: 'istanbul',
      ilce: 'kadikoy',
      mahalle: 'caddebostan',
    },
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
  };

  const customers = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      phone: '0532 123 45 67',
      email: 'ahmet@email.com',
      status: 'aktif',
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
    {
      id: '2',
      name: 'Zeynep Kaya',
      phone: '0533 987 65 43',
      email: 'zeynep@email.com',
      status: 'aktif',
      criteria: {
        status: 'satilik',
        types: ['daire'],
        location: {
          il: 'istanbul',
          ilce: 'kadikoy',
          mahalleler: ['caddebostan'],
        },
        budget: {
          min: 2000000,
          max: 4500000,
        },
        details: {
          minRooms: '3+1',
        },
        features: {
          balcony: true,
          parking: false,
          inComplex: false,
          furnished: false,
          newBuilding: true,
        },
      },
    },
  ];

  // Eşleşmeleri hesapla
  const matches = matchPropertyToCustomers(property, customers);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/portfolio">
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer" />
            </Link>
            <Logo size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol: Portföy Detayları */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-28">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                  {property.status}
                </span>
              </div>

              {/* Temel Bilgiler */}
              <div className="space-y-3 mb-6 border-t dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="capitalize">{property.location.mahalle}, {property.location.ilce}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Banknote className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-xl">{property.price.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Maximize className="w-5 h-5 text-gray-400" />
                  <span>{property.details.rooms} • {property.details.squareMeters} m²</span>
                </div>
              </div>

              {/* Özellikler */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Özellikler</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(property.features).map(([key, value]) => 
                    value && (
                      <span key={key} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ: Eşleşen Müşteriler */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎯 Bu Portföye Uygun Müşteriler
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {matches.filter(m => m.score >= 50).length} uygun müşteri bulundu
              </p>
            </div>

            <div className="space-y-4">
              {matches
                .filter(match => match.score >= 50)
                .map(match => {
                  const customer = customers.find(c => c.id === match.id);
                  if (!customer) return null;

                  return (
                    <MatchCard
                      key={match.id}
                      name={customer.name}
                      score={match.score}
                      matchedCriteria={match.matchedCriteria}
                      unmatchedCriteria={match.unmatchedCriteria}
                      contact={{
                        phone: customer.phone,
                        email: customer.email,
                      }}
                      type="customer"
                    />
                  );
                })}

              {matches.filter(m => m.score >= 50).length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-300 text-lg">Henüz uygun müşteri bulunamadı</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Yeni müşteri ekledikçe eşleşmeler burada görünecek
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}