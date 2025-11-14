"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { turkiyeService } from '../services/turkiye.service';

interface SavedLocation {
  id: string;
  name: string;
  il: string;
  ilce: string;
  mahalleler: string[];
  color: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<SavedLocation[]>([
    {
      id: '1',
      name: 'Kadıköy Sahil',
      il: 'istanbul',
      ilce: 'kadikoy',
      mahalleler: ['caddebostan', 'bostanci', 'moda'],
      color: 'blue',
    },
    {
      id: '2',
      name: 'Üsküdar Merkez',
      il: 'istanbul',
      ilce: 'uskudar',
      mahalleler: ['cengelkoy', 'kuzguncuk'],
      color: 'green',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    il: 'istanbul',
    ilce: '',
    mahalleler: [] as string[],
    color: 'blue',
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
        const ds = await turkiyeService.getDistrictsByProvinceSlug(formData.il);
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
        if (mounted) setAvailableMahalleler(m.map(x => x.slug));
      } catch (err) {
        console.error('Failed loading mahalleler', err);
      }
    })();
    return () => { mounted = false; };
  }, [formData.il, formData.ilce]);

  const colors = [
    { value: 'blue', label: 'Mavi', class: 'bg-blue-500' },
    { value: 'green', label: 'Yeşil', class: 'bg-green-500' },
    { value: 'purple', label: 'Mor', class: 'bg-purple-500' },
    { value: 'orange', label: 'Turuncu', class: 'bg-orange-500' },
    { value: 'red', label: 'Kırmızı', class: 'bg-red-500' },
  ];

  

  const toggleMahalle = (mahalle: string) => {
    setFormData(prev => ({
      ...prev,
      mahalleler: prev.mahalleler.includes(mahalle)
        ? prev.mahalleler.filter(m => m !== mahalle)
        : [...prev.mahalleler, mahalle]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mahalleler.length === 0) return;
    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      ...formData,
    };
    setLocations([...locations, newLocation]);
    setFormData({
      name: '',
      il: 'istanbul',
      ilce: '',
      mahalleler: [],
      color: 'blue',
    });
    setShowForm(false);
  };

  const deleteLocation = (id: string) => {
    if (confirm('Bu konumu silmek istediğinizden emin misiniz?')) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const getColorClass = (colorValue: string) => {
    return colors.find(c => c.value === colorValue)?.class || 'bg-gray-500';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Konumlarım</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sık kullandığınız bölgeleri kaydedin, hızlıca erişin
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Yeni Konum Ekle
        </button>
      </div>

      {/* Konumlar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4"
            style={{ borderLeftColor: colors.find(c => c.value === location.color)?.class.replace('bg-', '') || '#3B82F6' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${getColorClass(location.color)} rounded-lg flex items-center justify-center`}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{location.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {location.ilce}, {location.il}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteLocation(location.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Mahalleler:</p>
              <div className="flex flex-wrap gap-2">
                {location.mahalleler.map((mahalle) => (
                  <span
                    key={mahalle}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded capitalize"
                  >
                    {mahalle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Boş State */}
      {locations.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-300 text-lg">Henüz kayıtlı konum yok</p>
          <p className="text-gray-400 text-sm mt-2">
            Sık kullandığınız bölgeleri kaydederek hızlıca erişebilirsiniz
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Konum Ekle</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* İsim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Konum Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Kadıköy Sahil"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* İl ve İlçe */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İl</label>
                  <select
                    value={formData.il}
                    onChange={(e) => setFormData({ ...formData, il: e.target.value, ilce: '', mahalleler: [] })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.slug}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İlçe</label>
                  <select
                    value={formData.ilce}
                    onChange={(e) => setFormData({ ...formData, ilce: e.target.value, mahalleler: [] })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.slug}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mahalleler */}
              {formData.ilce && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mahalleler <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableMahalleler.map((mahalle) => (
                      <button
                        key={mahalle}
                        type="button"
                        onClick={() => toggleMahalle(mahalle)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all text-sm capitalize ${
                          formData.mahalleler.includes(mahalle)
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {mahalle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Renk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Renk</label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 ${color.class} rounded-lg transition-all ${
                        formData.color === color.value
                          ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800'
                          : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={formData.mahalleler.length === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}