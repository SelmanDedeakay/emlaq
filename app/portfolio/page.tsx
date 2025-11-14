// app/portfolio/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PropertyForm from '../components/PropertyForm';
import { Home, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { portfolioService } from '../services/portfolio.service';
import { useAuth } from '../contexts/AuthContext';

export default function PortfolioPage() {
  const [showForm, setShowForm] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getAll();
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      alert('Portföyler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (formData: any) => {
    try {
      await portfolioService.create({
        title: formData.title || `${formData.mahalle} ${formData.rooms}`,
        status: formData.status,
        type: formData.type,
        price: parseFloat(formData.price),
        il: formData.il,
        ilce: formData.ilce,
        mahalle: formData.mahalle,
        rooms: formData.rooms,
        squareMeters: parseInt(formData.squareMeters),
        balcony: formData.balcony,
        parking: formData.parking,
        inComplex: formData.inComplex,
        furnished: formData.furnished,
        newBuilding: formData.newBuilding,
      });
      
      await loadProperties();
      setShowForm(false);
      alert('Portföy başarıyla eklendi!');
    } catch (error: any) {
      console.error('Error adding property:', error);
      alert(error.message || 'Portföy eklenirken bir hata oluştu');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      satilik: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      kiralik: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      satildi: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    const labels = {
      satilik: 'Satılık',
      kiralik: 'Kiralık',
      satildi: 'Satıldı',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header ve Ekle Butonu */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portföyler</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Toplam {properties.length} portföy</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Yeni Portföy Ekle
        </button>
      </div>

      {/* Portföy Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {properties.length === 0 ? (
          <div className="p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-300 text-lg">Henüz portföy bulunmuyor</p>
            <p className="text-gray-400 text-sm mt-2">
              Yeni portföy ekleyerek başlayın
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Başlık</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Durum</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Tip</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Lokasyon</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Fiyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/portfolio/${property.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                          <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{property.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(property.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{property.type}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">
                      {property.mahalle}, {property.ilce}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {property.price.toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <PropertyForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddProperty}
        />
      )}
    </DashboardLayout>
  );
}