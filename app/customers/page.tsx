'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CustomerForm from '../components/CustomerForm';
import { Users, Plus, Phone, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const [customers, setCustomers] = useState([
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      phone: '0532 123 45 67',
      email: 'ahmet@email.com',
      status: 'aktif',
      criteria: '2+1, Kadıköy, 3-5M ₺',
    },
    {
      id: '2',
      name: 'Zeynep Kaya',
      phone: '0533 987 65 43',
      email: 'zeynep@email.com',
      status: 'aktif',
      criteria: '3+1, Üsküdar, 5-8M ₺',
    },
  ]);

  const handleAddCustomer = (data: any) => {
    console.log('Yeni müşteri:', data);
    // Burada database'e kayıt yapılacak
    const newCustomer = {
      id: (customers.length + 1).toString(),
      ...data,
      criteria: `${data.minRooms}, ${data.ilce}, ${parseInt(data.minPrice).toLocaleString()}-${parseInt(data.maxPrice).toLocaleString()} ₺`
    };
    setCustomers(prev => [...prev, newCustomer]);
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      aktif: 'bg-green-100 text-green-800',
      pasif: 'bg-gray-100 text-gray-800',
      buldu: 'bg-blue-100 text-blue-800',
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
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(customer.status)}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{customer.criteria}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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