'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { propertyOwnerService } from '../services/property-owner.service';
import OwnerForm from '../components/OwnerForm';
import { Loader2, Plus, Home, Edit, Trash } from 'lucide-react';

export default function PropertyOwnersPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<any | null>(null);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const data = await propertyOwnerService.getAll();
      setOwners(data || []);
    } catch (err) {
      console.error('Error loading owners', err);
      alert('Mal sahipleri yüklenirken hata oldu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mal Sahipleri</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Toplam {owners.length} kayıt</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Plus className="w-4 h-4"/> Yeni Mal Sahibi
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin"/></div>
        ) : owners.length === 0 ? (
          <div className="p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-300 text-lg">Henüz mal sahibi kaydı yok</p>
            <p className="text-gray-400 text-sm mt-2">Yeni mal sahibi ekleyerek başlayın</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">İsim</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Telefon</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">E-posta</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">TC No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Banka Hesap</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">IBAN</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Adres</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Notlar</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {owners.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{o.full_name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.tc_no || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.bank_account_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.iban || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.address || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.notes || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button title="Düzenle" onClick={() => { setEditingOwner(o); }} className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button title="Sil" onClick={async () => {
                          const ok = confirm('Bu mal sahibini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
                          if (!ok) return;
                          try {
                            await propertyOwnerService.remove(o.id);
                            await loadOwners();
                          } catch (err) {
                            console.error('Delete error', err);
                            alert('Silme işlemi başarısız oldu');
                          }
                        }} className="text-red-600 hover:text-red-800 p-1 rounded-md">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <OwnerForm onClose={() => { setShowForm(false); loadOwners(); }} onCreated={() => { setShowForm(false); loadOwners(); }} />
      )}

      {editingOwner && (
        <OwnerForm owner={editingOwner} onClose={() => { setEditingOwner(null); loadOwners(); }} onUpdated={() => { setEditingOwner(null); loadOwners(); }} />
      )}
    </DashboardLayout>
  );
}
