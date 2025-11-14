// app/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CustomerForm from '../components/CustomerForm';
import { Users, Plus, Phone, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { customerService } from '../services/customer.service';
import { useAuth } from '../contexts/AuthContext';

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
  }, [user]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      alert('Müşteriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (formData: any) => {
    try {
      await customerService.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        status: formData.status,
        criteriaStatus: formData.criteriaStatus,
        types: formData.types,
        il: formData.il,
        ilce: formData.ilce,
        mahalleler: formData.mahalleler,
        minPrice: formData.minPrice,
        maxPrice: formData.maxPrice,
        minRooms: formData.minRooms,
        balcony: formData.balcony,
        parking: formData.parking,
        inComplex: formData.inComplex,
        furnished: formData.furnished,
        newBuilding: formData.newBuilding,
      });
      
      await loadCustomers();
      setShowForm(false);
      alert('Müşteri başarıyla eklendi!');
    } catch (error: any) {
      console.error('Error adding customer:', error);
      alert(error.message || 'Müşteri eklenirken bir hata oluştu');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      aktif: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      pasif: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      buldu: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    };
    const labels = {
      aktif: 'Aktif Arıyor',
      pasif: 'Pasif',
      buldu: 'Buldu',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getCriteriaText = (customer: any) => {
    const criteria = customer.criteria;
    if (!criteria) return 'Kriter yok';
    
    const types = Array.isArray(criteria.types) ? criteria.types.join(', ') : '';
    const location = criteria.location?.ilce || '';
    const budget = criteria.budget ? 
      `${criteria.budget.min.toLocaleString()}-${criteria.budget.max.toLocaleString()} ₺` : '';
    
    return `${types}, ${location}, ${budget}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header ve Ekle Butonu */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Müşteriler</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Toplam {customers.length} müşteri</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Yeni Müşteri Ekle
        </button>
      </div>

      {/* Müşteri Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-300 text-lg">Henüz müşteri bulunmuyor</p>
            <p className="text-gray-400 text-sm mt-2">
              Yeni müşteri ekleyerek başlayın
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Müşteri</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">İletişim</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Durum</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Aradığı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/customers/${customer.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(customer.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getCriteriaText(customer)}
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
        <CustomerForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddCustomer}
        />
      )}
    </DashboardLayout>
  );
}