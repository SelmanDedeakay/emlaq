'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { turkiyeService } from '../services/turkiye.service';

interface CustomerFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CustomerForm({ onClose, onSubmit }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    // İletişim
    name: '',
    phone: '',
    email: '',
    status: 'aktif',
    
    // Kriterler
    criteriaStatus: 'satilik',
    types: [] as string[],
    il: '',
    ilce: '',
    mahalleler: [] as string[],
    minPrice: '',
    maxPrice: '',
    minRooms: '2+1',
    
    // Özellikler
    balcony: false,
    parking: false,
    inComplex: false,
    furnished: false,
    newBuilding: false,
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [availableMahalleler, setAvailableMahalleler] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const provs = await turkiyeService.getProvinces();
        if (mounted) setProvinces(provs || []);
      } catch (err) {
        console.error('Failed loading provinces', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

useEffect(() => {
    if (!formData.il) { setDistricts([]); setAvailableMahalleler([]); return; }
    let mounted = true;
    (async () => {
      try {
        const ds = await turkiyeService.getDistrictsByProvinceName(formData.il);
        if (mounted) setDistricts(ds || []);
      } catch (err) {
        console.error('Failed loading districts', err);
      }
    })();
    return () => { mounted = false; };
  }, [formData.il]);

  useEffect(() => {
    if (!formData.il || !formData.ilce) { setAvailableMahalleler([]); return; }
    let mounted = true;
    (async () => {
      try {
        const m = await turkiyeService.getNeighborhoods(formData.il, formData.ilce);
        if (mounted) setAvailableMahalleler(m.map(x => x.name));
      } catch (err) {
        console.error('Failed loading mahalleler', err);
      }
    })();
    return () => { mounted = false; };
  }, [formData.il, formData.ilce]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure we don't send slugs to the DB: convert il/ilce slugs to names
    const provinceName = (provinces as any[]).find((p) => p.slug === formData.il)?.name || formData.il;
    const districtName = (districts as any[]).find((d) => d.slug === formData.ilce)?.name || formData.ilce;
    const payload = { ...formData, il: provinceName, ilce: districtName };
    onSubmit(payload);
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

  const toggleType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const toggleMahalle = (mahalle: string) => {
    setFormData(prev => ({
      ...prev,
      mahalleler: prev.mahalleler.includes(mahalle)
        ? prev.mahalleler.filter(m => m !== mahalle)
        : [...prev.mahalleler, mahalle]
    }));
  };

  // availableMahalleler is loaded from API into state

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Müşteri Ekle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* İletişim Bilgileri */}
          <div className="bg-blue-50 dark:bg-blue-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              İletişim Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0532 123 45 67"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Müşteri Durumu <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="aktif">Aktif Arıyor</option>
                  <option value="pasif">Pasif</option>
                  <option value="buldu">Buldu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aradığı Emlak Kriterleri */}
          <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Aradığı Emlak Kriterleri
            </h3>
            
            <div className="space-y-4">
              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ne Arıyor? <span className="text-red-500">*</span>
                </label>
                <select
                  name="criteriaStatus"
                  value={formData.criteriaStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="satilik">Satılık</option>
                  <option value="kiralik">Kiralık</option>
                </select>
              </div>

              {/* Emlak Tipleri (Çoklu Seçim) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emlak Tipleri <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'daire', label: 'Daire' },
                    { value: 'mustakil', label: 'Müstakil Ev' },
                    { value: 'isyeri', label: 'İş Yeri' },
                    { value: 'arsa', label: 'Arsa' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleType(type.value)}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all font-medium ${
                        formData.types.includes(type.value)
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lokasyon */}
          <div className="bg-purple-50 dark:bg-purple-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Lokasyon Tercihleri
            </h3>
            
            <div className="space-y-4">
              {/* İl ve İlçe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* İl */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İl <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="il"
                    value={formData.il}
                    onChange={(e) => { handleChange(e); setFormData((prev: any) => ({ ...prev, ilce: '', mahalleler: [] })); }}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.slug}>{p.name}</option>
                    ))}
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
                    onChange={(e) => { handleChange(e); setFormData((prev: any) => ({ ...prev, mahalleler: [] })); }}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    disabled={!formData.il}
                  >
                    <option value="">Seçiniz</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.slug}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mahalleler (Çoklu Seçim) */}
              {formData.ilce && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mahalleler <span className="text-gray-500 text-xs">(Birden fazla seçilebilir)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableMahalleler.map((mahalle) => (
                      <button
                        key={mahalle}
                        type="button"
                        onClick={() => toggleMahalle(mahalle)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                          formData.mahalleler.includes(mahalle)
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {mahalle}
                      </button>
                    ))}
                  </div>
                  {formData.mahalleler.length > 0 && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      {formData.mahalleler.length} mahalle seçildi
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bütçe ve Detaylar */}
          <div className="bg-amber-50 dark:bg-amber-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
              Bütçe ve Detaylar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Min Fiyat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min. Fiyat (₺)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleChange}
                  placeholder="Örn: 3000000"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Max Fiyat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maks. Fiyat (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleChange}
                  placeholder="Örn: 7000000"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Min Oda Sayısı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min. Oda Sayısı <span className="text-red-500">*</span>
                </label>
                <select
                  name="minRooms"
                  value={formData.minRooms}
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
            </div>
          </div>

          {/* İstenen Özellikler */}
          <div className="bg-rose-50 dark:bg-rose-900/50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
              İstenen Özellikler
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'balcony', label: 'Balkonlu olmalı' },
                { name: 'parking', label: 'Otoparklı olmalı' },
                { name: 'inComplex', label: 'Sitede olmalı' },
                { name: 'furnished', label: 'Eşyalı olmalı' },
                { name: 'newBuilding', label: 'Yeni Bina (0-5 Yaş)' },
              ].map((feature) => (
                <label key={feature.name} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name={feature.name}
                    checked={formData[feature.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="w-5 h-5 text-rose-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-rose-500 bg-gray-100 dark:bg-gray-600"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Müşteri Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}