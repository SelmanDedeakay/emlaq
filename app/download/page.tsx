'use client';

import React, { useState } from 'react';
import { customerService } from '../services/customer.service';
import { locationService } from '../services/location.service';
import { portfolioService } from '../services/portfolio.service';
import { propertyOwnerService } from '../services/property-owner.service';
import { Download, Loader2 } from 'lucide-react';

const DownloadPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customers, locations, portfolios, propertyOwners] = await Promise.all([
        customerService.getAll(),
        locationService.getAll(),
        portfolioService.getAll(),
        propertyOwnerService.getAll(),
      ]);

      const allData = {
        customers,
        locations,
        portfolios,
        propertyOwners,
        downloadDate: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'emlaq_veri_yedeği.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Veri indirilirken hata oluştu:', err);
      setError('Veriler indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Download className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Veri İndirme Merkezi
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tüm emlak verilerinizi (portföyler, müşteriler, mal sahipleri ve bölgeler) tek bir JSON dosyası olarak bilgisayarınıza indirebilirsiniz. Bu, verilerinizi yedeklemek veya başka sistemlere aktarmak için kullanışlıdır.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Veriler Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Tüm Verileri İndir</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            İndirme işlemi, veri miktarına bağlı olarak birkaç saniye sürebilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
