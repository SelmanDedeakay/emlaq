// app/property-owners/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import { propertyOwnerService } from '../../services/property-owner.service';
import { portfolioService } from '../../services/portfolio.service';
import { User, Phone, Mail, Home, Banknote, Building, Briefcase, Calendar, Edit, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import OwnerForm from '../../components/OwnerForm';
import PropertyForm from '../../components/PropertyForm';

// Placeholder for PropertyCard component
const PropertyCard = ({ portfolio }: { portfolio: any }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
    <div className="p-5">
      <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">{portfolio.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{portfolio.il}, {portfolio.ilce}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-800 dark:text-white">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(portfolio.price)}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${portfolio.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {portfolio.status === 'active' ? 'Aktif' : 'Pasif'}
        </span>
      </div>
    </div>
  </div>
);

export default function PropertyOwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [owner, setOwner] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const ownerData = await propertyOwnerService.getById(id);
      if (!ownerData) {
        throw new Error('Mal sahibi bulunamadı.');
      }
      setOwner(ownerData);
      
      const portfolioData = await portfolioService.getByOwnerId(id);
      setPortfolios(portfolioData || []);

    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg p-8">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-red-700 dark:text-red-400">Hata</h2>
          <p className="mt-2 text-center text-red-600 dark:text-red-300">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!owner) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>Mal sahibi bulunamadı.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{owner.full_name}</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
              Mal Sahibi Detayları ve Mülkleri
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowEditForm(true)} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Edit className="w-4 h-4" /> Düzenle
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Trash2 className="w-4 h-4" /> Sil
            </button>
          </div>
        </div>

        {/* Ana İçerik Grid'i */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf: Mal Sahibi Bilgileri */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                İletişim Bilgileri
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                    <p className="font-medium text-gray-900 dark:text-white">{owner.phone || 'Belirtilmemiş'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">E-posta</p>
                    <p className="font-medium text-gray-900 dark:text-white">{owner.email || 'Belirtilmemiş'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adres</p>
                    <p className="font-medium text-gray-900 dark:text-white">{owner.address || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                Finansal Bilgiler
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">IBAN</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{owner.iban || 'Belirtilmemiş'}</p>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hesap Sahibi</p>
                    <p className="font-medium text-gray-900 dark:text-white">{owner.bank_account_name || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                Notlar
              </h2>
                <p className="font-medium text-gray-700 dark:text-gray-300">{owner.notes || 'Mal sahibi için not bulunmuyor.'}</p>
            </div>
          </div>

          {/* Sağ Taraf: Mülkler */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Mülkler ({portfolios.length})
              </h2>
              <button onClick={() => setShowPropertyForm(true)} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium">
                <Plus className="w-5 h-5" />
                Yeni Mülk Ekle
              </button>
            </div>
            {portfolios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolios.map(p => <PropertyCard key={p.id} portfolio={p} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                <Building className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Bu mal sahibine ait mülk bulunmuyor.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">"Yeni Mülk Ekle" butonu ile yeni bir mülk ekleyebilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditForm && (
        <OwnerForm
          owner={owner}
          onClose={() => setShowEditForm(false)}
          onUpdated={() => {
            setShowEditForm(false);
            loadData();
          }}
        />
      )}

      {showPropertyForm && (
        <PropertyForm
          ownerId={owner.id}
          onClose={() => setShowPropertyForm(false)}
          onPortfolioCreated={() => {
            setShowPropertyForm(false);
            loadData();
          }}
        />
      )}
    </DashboardLayout>
  );
}
