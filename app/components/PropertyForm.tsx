"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { propertyOwnerService } from "../services/property-owner.service";
import OwnerForm from './OwnerForm';

interface PropertyFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  property?: any;
}

export default function PropertyForm({ onClose, onSubmit, property }: PropertyFormProps) {
  const [formData, setFormData] = useState<any>({
    title: '',
    ownerId: "",
    status: "satilik",
    type: "daire",
    il: "",
    ilce: "",
    mahalle: "",
    price: "",
    rooms: "2+1",
    squareMeters: "",
    balcony: false,
    parking: false,
    inComplex: false,
    furnished: false,
    newBuilding: false,
    imageUrls: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [owners, setOwners] = useState<any[]>([]);
  const [showOwnerForm, setShowOwnerForm] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await propertyOwnerService.getAll();
        if (mounted) setOwners(data || []);
      } catch (err) {
        console.error("Error loading owners", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Prefill form when editing an existing property
  useEffect(() => {
    if (!property) return;
    const p = property;
    setFormData((prev: any) => ({
      ...prev,
      ownerId: p.owner_id || prev.ownerId || '',
      status: p.status || prev.status,
      type: p.type || prev.type,
      il: p.il || prev.il,
      ilce: p.ilce || prev.ilce,
      mahalle: p.mahalle || prev.mahalle,
      price: p.price ?? prev.price,
      rooms: p.rooms || prev.rooms,
      squareMeters: p.square_meters ?? prev.squareMeters,
      balcony: p.features?.balcony ?? prev.balcony,
      parking: p.features?.parking ?? prev.parking,
      inComplex: p.features?.inComplex ?? prev.inComplex,
      furnished: p.features?.furnished ?? prev.furnished,
      newBuilding: p.features?.newBuilding ?? prev.newBuilding,
      imageUrls: p.property_images ? p.property_images.map((img: any) => img.image_url) : prev.imageUrls,
      title: p.title || prev.title,
    }));
  }, [property]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.ownerId) newErrors.ownerId = "Mal sahibi seçmelisiniz";
      if (!formData.type) newErrors.type = "Emlak tipi gerekli";
      if (!formData.status) newErrors.status = "Durum gerekli";
    }
    if (step === 2) {
      if (!formData.il) newErrors.il = "İl seçiniz";
      if (!formData.ilce) newErrors.ilce = "İlçe seçiniz";
      if (!formData.mahalle) newErrors.mahalle = "Mahalle seçiniz";
    }
    if (step === 3) {
      const priceVal = Number(formData.price);
      if (!formData.price || isNaN(priceVal) || priceVal <= 0) newErrors.price = "Geçerli bir fiyat girin";
      const sqm = Number(formData.squareMeters);
      if (!formData.squareMeters || isNaN(sqm) || sqm <= 0) newErrors.squareMeters = "Geçerli metrekare girin";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleImagesUploaded = (urls: string[]) => {
    setFormData((prev: any) => ({ ...prev, imageUrls: urls }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      const ok = validateStep(currentStep);
      if (!ok) return;
      setCurrentStep((s) => s + 1);
      return;
    }
    // final validation
    if (!validateStep(currentStep)) return;
    onSubmit(formData);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{property ? 'Portföyü Düzenle' : 'Yeni Portföy Ekle'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Adım {currentStep} / {totalSteps}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Step 1: Temel Bilgiler */}
          {currentStep === 1 && (
            <div className="bg-blue-50 dark:bg-blue-900/50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                Temel Bilgiler
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Durum <span className="text-red-500">*</span></label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    <option value="satilik">Satılık</option>
                    <option value="kiralik">Kiralık</option>
                  </select>
                  {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emlak Tipi <span className="text-red-500">*</span></label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    <option value="daire">Daire</option>
                    <option value="mustakil">Müstakil Ev</option>
                    <option value="isyeri">İş Yeri</option>
                    <option value="arsa">Arsa</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Emlak türünü seçin (Daire, İşyeri, Arsa...)</p>
                  {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mal Sahibi <span className="text-red-500">*</span></label>
                    <button type="button" onClick={() => setShowOwnerForm(true)} className="text-sm text-blue-600 hover:underline">Yeni Mal Sahibi Ekle</button>
                  </div>
                  <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    <option value="">Seçiniz</option>
                    {owners.map((o) => <option key={o.id} value={o.id}>{o.full_name}{o.phone ? ` (${o.phone})` : ''}</option>)}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Portföyün sahibi önceden oluşturulmuş olmalı. Bulamazsanız yeni oluşturun.</p>
                  {errors.ownerId && <p className="text-sm text-red-500 mt-1">{errors.ownerId}</p>}

                  {/* OwnerForm is rendered outside the main <form> to avoid nested forms */}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Lokasyon */}
          {currentStep === 2 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                Lokasyon
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İl <span className="text-red-500">*</span></label>
                  <select name="il" value={formData.il} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required>
                    <option value="">Seçiniz</option>
                    <option value="istanbul">İstanbul</option>
                    <option value="ankara">Ankara</option>
                    <option value="izmir">İzmir</option>
                    <option value="bursa">Bursa</option>
                  </select>
                  {errors.il && <p className="text-sm text-red-500 mt-1">{errors.il}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İlçe <span className="text-red-500">*</span></label>
                  <select name="ilce" value={formData.ilce} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required disabled={!formData.il}>
                    <option value="">Seçiniz</option>
                    {formData.il === 'istanbul' && (<><option value="kadikoy">Kadıköy</option><option value="uskudar">Üsküdar</option><option value="besiktas">Beşiktaş</option><option value="sisli">Şişli</option></>)}
                  </select>
                  {errors.ilce && <p className="text-sm text-red-500 mt-1">{errors.ilce}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mahalle <span className="text-red-500">*</span></label>
                  <select name="mahalle" value={formData.mahalle} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required disabled={!formData.ilce}>
                    <option value="">Seçiniz</option>
                    {formData.ilce === 'kadikoy' && (<><option value="caddebostan">Caddebostan</option><option value="bostanci">Bostancı</option><option value="moda">Moda</option></>)}
                  </select>
                  {errors.mahalle && <p className="text-sm text-red-500 mt-1">{errors.mahalle}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Fiyat ve Detaylar */}
          {currentStep === 3 && (
            <div className="bg-amber-50 dark:bg-amber-900/50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                Fiyat ve Detaylar
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fiyat (₺) <span className="text-red-500">*</span></label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Örn: 5000000" min={0} step={1000} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
                  <p className="text-xs text-gray-500 mt-1">Yalnızca sayısal değer girin. Binlik ayırıcı okunabilirlik içindir.</p>
                  {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Oda Sayısı <span className="text-red-500">*</span></label>
                  <select name="rooms" value={formData.rooms} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required>
                    <option value="1+0">1+0</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+1">5+1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Net m² <span className="text-red-500">*</span></label>
                  <input type="number" name="squareMeters" value={formData.squareMeters} onChange={handleChange} placeholder="Örn: 120" min={1} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
                  {errors.squareMeters && <p className="text-sm text-red-500 mt-1">{errors.squareMeters}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Özellikler */}
          {currentStep === 4 && (
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
                    <input type="checkbox" name={feature.name} checked={formData[feature.name]} onChange={handleChange} className="w-5 h-5 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-gray-100 dark:bg-gray-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Resimler */}
          {currentStep === 5 && (
            <div className="bg-pink-50 dark:bg-pink-900/50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
                Resimler (Opsiyonel)
              </h3>

              <ImageUpload onImagesUploaded={handleImagesUploaded} maxImages={10} existingImages={formData.imageUrls} />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            {currentStep > 1 && (
              <button type="button" onClick={goBack} className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">← Geri</button>
            )}
            {currentStep === 1 && (
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">İptal</button>
            )}
            <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg hover:shadow-xl transition-all">{currentStep < totalSteps ? 'İleri →' : (property ? 'Güncelle' : 'Portföy Ekle')}</button>
          </div>
        </form>
        {/* Render OwnerForm modal outside of the parent <form> to prevent nested <form> elements */}
        {showOwnerForm && (
          <OwnerForm
            onClose={() => setShowOwnerForm(false)}
            onCreated={(newOwner: any) => {
              setOwners((prev) => [newOwner, ...prev]);
              setFormData((prev: any) => ({ ...prev, ownerId: newOwner.id }));
              setShowOwnerForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}