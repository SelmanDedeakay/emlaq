'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Logo from '../../components/Logo';
import MatchCard from '../../components/MatchCard';
import { ArrowLeft, Home, MapPin, Banknote, Maximize, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { matchPropertyToCustomers } from '../../utils/matching';
import { portfolioService } from '../../services/portfolio.service';
import { customerService } from '../../services/customer.service';
import { useAuth } from "../../contexts/AuthContext";

export default function PropertyDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && params.id) {
      loadPropertyDetails();
    }
  }, [user, params.id]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Load property details and all customers in parallel
      const [propertyData, customersData] = await Promise.all([
        portfolioService.getById(params.id as string),
        customerService.getAll(),
      ]);

      if (!propertyData) {
        setError('Portföy bulunamadı');
        return;
      }

      setProperty(propertyData);
      setCustomers(customersData || []);

      // Transform property data for matching algorithm
      const transformedProperty = {
        id: propertyData.id,
        status: propertyData.status,
        type: propertyData.type,
        location: {
          il: propertyData.il,
          ilce: propertyData.ilce,
          mahalle: propertyData.mahalle,
        },
        price: propertyData.price,
        details: {
          rooms: propertyData.rooms,
          squareMeters: propertyData.square_meters,
        },
        features: propertyData.features || {},
      };

      // Calculate matches
      const calculatedMatches = matchPropertyToCustomers(
        transformedProperty,
        customersData || []
      );
      setMatches(calculatedMatches);

    } catch (err: any) {
      console.error('Error loading property details:', err);
      setError(err.message || 'Portföy bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Get feature display name
  const getFeatureDisplayName = (key: string) => {
    const featureNames: Record<string, string> = {
      balcony: 'Balkonlu',
      parking: 'Otoparklı',
      inComplex: 'Sitede',
      furnished: 'Eşyalı',
      newBuilding: 'Yeni Bina',
    };
    return featureNames[key] || key;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-300 text-lg">{error || 'Portföy bulunamadı'}</p>
            <Link
              href="/portfolio"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Portföylere Dön
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  property.status === 'satilik' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                    : property.status === 'kiralik'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {property.status === 'satilik' ? 'Satılık' : property.status === 'kiralik' ? 'Kiralık' : 'Satıldı'}
                </span>
              </div>

              {/* Temel Bilgiler */}
              <div className="space-y-3 mb-6 border-t dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="capitalize">{property.mahalle}, {property.ilce}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Banknote className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-xl">{property.price.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Maximize className="w-5 h-5 text-gray-400" />
                  <span>{property.rooms} • {property.square_meters} m²</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Home className="w-5 h-5 text-gray-400" />
                  <span className="capitalize">{property.type}</span>
                </div>
              </div>

              {/* Özellikler */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Özellikler</h3>
                {property.features && Object.keys(property.features).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(property.features).map(([key, value]) => 
                      value && (
                        <span key={key} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                          {getFeatureDisplayName(key)}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Özellik bilgisi yok</p>
                )}
              </div>

              {/* Ekleyen Kişi */}
              {property.profiles && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ekleyen</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {property.profiles.full_name || property.profiles.email}
                  </p>
                </div>
              )}
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
                        phone: customer.phone || '',
                        email: customer.email || '',
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
                  <Link
                    href="/customers"
                    className="inline-block mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Müşteri Ekle
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}