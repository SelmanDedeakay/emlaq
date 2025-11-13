'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PropertyForm from '../components/PropertyForm';
import { Home, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PortfolioPage() {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const [properties, setProperties] = useState([
    {
      id: '1',
      title: 'Caddebostan 3+1',
      status: 'satilik',
      type: 'daire',
      price: 5000000,
      location: 'Kadıköy, İstanbul',
    },
    {
      id: '2',
      title: 'Bostancı 2+1',
      status: 'kiralik',
      type: 'daire',
      price: 25000,
      location: 'Kadıköy, İstanbul',
    },
  ]);

  const handleAddProperty = (data: any) => {
    console.log('Yeni portföy:', data);
    const newProperty = {
      id: (properties.length + 1).toString(),
      title: `${data.mahalle} ${data.rooms}`,
      location: `${data.ilce}, ${data.il}`,
      ...data,
    };
    setProperties(prev => [...prev, newProperty]);
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      satilik: 'bg-blue-100 text-blue-800',
      kiralik: 'bg-emerald-100 text-emerald-800',
      satildi: 'bg-gray-100 text-gray-800',
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
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{property.location}</td>
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