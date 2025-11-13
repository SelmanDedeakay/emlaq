'use client';
import { getMahalleCoordinates } from '../utils/geocoding';
import { useState } from 'react';
import { X } from 'lucide-react';

interface PropertyFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function PropertyForm({ onClose, onSubmit }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    status: 'satilik',
    type: 'daire',
    il: '',
    ilce: '',
    mahalle: '',
    price: '',
    rooms: '2+1',
    squareMeters: '',
    balcony: false,
    parking: false,
    inComplex: false,
    furnished: false,
    newBuilding: false,
  });



const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Koordinatları ekle
  const coordinates = getMahalleCoordinates(formData.mahalle);
  
  onSubmit({
    ...formData,
    coordinates,
  });
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Portföy Ekle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Temel Bilgiler */}
          <div className="bg-blue-50 dark:bg-blue-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Temel Bilgiler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durum <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="satilik">Satılık</option>
                  <option value="kiralik">Kiralık</option>
                </select>
              </div>

              {/* Tip */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emlak Tipi <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="daire">Daire</option>
                  <option value="mustakil">Müstakil Ev</option>
                  <option value="isyeri">İş Yeri</option>
                  <option value="arsa">Arsa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lokasyon */}
          <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Lokasyon
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* İl */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İl <span className="text-red-500">*</span>
                </label>
                <select
                  name="il"
                  value={formData.il}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  <option value="izmir">İzmir</option>
                  <option value="bursa">Bursa</option>
                </select>
              </div>

              {/* İlçe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İlçe <span className="text-red-500">*</span>
                </label>
                <select
                  name="ilce"
                  value={formData.ilce}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  disabled={!formData.il}
                >
                  <option value="">Seçiniz</option>
                  {formData.il === 'istanbul' && (
                    <>
                      <option value="kadikoy">Kadıköy</option>
                      <option value="uskudar">Üsküdar</option>
                      <option value="besiktas">Beşiktaş</option>
                      <option value="sisli">Şişli</option>
                    </>
                  )}
                </select>
              </div>

              {/* Mahalle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mahalle <span className="text-red-500">*</span>
                </label>
                <select
                  name="mahalle"
                  value={formData.mahalle}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  disabled={!formData.ilce}
                >
                  <option value="">Seçiniz</option>
                  {formData.ilce === 'kadikoy' && (
                    <>
                      <option value="caddebostan">Caddebostan</option>
                      <option value="bostanci">Bostancı</option>
                      <option value="moda">Moda</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Fiyat ve Detaylar */}
          <div className="bg-amber-50 dark:bg-amber-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Fiyat ve Detaylar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fiyat (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Örn: 5000000"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Oda Sayısı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Oda Sayısı <span className="text-red-500">*</span>
                </label>
                <select
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="1+0">1+0</option>
                  <option value="1+1">1+1</option>
                  <option value="2+1">2+1</option>
                  <option value="3+1">3+1</option>
                  <option value="4+1">4+1</option>
                  <option value="5+1">5+1</option>
                </select>
              </div>

              {/* Metrekare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Net m² <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="squareMeters"
                  value={formData.squareMeters}
                  onChange={handleChange}
                  placeholder="Örn: 120"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Özellikler */}
          <div className="bg-purple-50 dark:bg-purple-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
              Özellikler
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'balcony', label: 'Balkonlu' },
                { name: 'parking', label: 'Otoparklı' },
                { name: 'inComplex', label: 'Sitede' },
                { name: 'furnished', label: 'Eşyalı' },
                { name: 'newBuilding', label: 'Yeni Bina (0-5 Yaş)' },
              ].map((feature) => (
                <label key={feature.name} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name={feature.name}
                    checked={formData[feature.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-gray-100 dark:bg-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {feature.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Portföy Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}