'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { propertyOwnerService, PropertyOwnerData } from '../services/property-owner.service';

interface OwnerFormProps {
  onClose: () => void;
  onCreated?: (owner: any) => void;
}

export default function OwnerForm({ onClose, onCreated }: OwnerFormProps) {
  const [form, setForm] = useState<PropertyOwnerData>({ full_name: '', phone: '', email: '', tc_no: '', bank_account_name: '', iban: '', address: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // normalize some fields
    const val = name === 'iban' ? value.toUpperCase() : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };
  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.full_name || form.full_name.trim().length < 3) e.full_name = 'İsim en az 3 karakter olmalı';
    if (form.phone && !/^\+?[0-9 \-()]{7,20}$/.test(form.phone)) e.phone = 'Geçerli bir telefon numarası girin';
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Geçerli bir e-posta girin';
    if (form.tc_no && !/^\d{11}$/.test(form.tc_no)) e.tc_no = 'TC No 11 rakam olmalı';
    if (form.iban && !/^TR\d{24}$/.test(form.iban)) e.iban = 'IBAN TR ile başlayıp 26 karakter olmalı (ör: TR00...)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const created = await propertyOwnerService.create(form);
      onCreated?.(created);
      onClose();
    } catch (err: any) {
      console.error('Error creating owner', err);
      alert(err.message || 'Mal sahibi oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Yeni Mal Sahibi Ekle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İsim Soyisim <span className="text-red-500">*</span></label>
            <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Örn: Ahmet Yılmaz" className="w-full px-4 py-2 border rounded-lg" />
            {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Örn: +90 532 000 0000" className="w-full px-4 py-2 border rounded-lg" />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-posta</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Örn: ahmet@example.com" className="w-full px-4 py-2 border rounded-lg" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">TC No</label>
              <input name="tc_no" value={form.tc_no} onChange={handleChange} placeholder="11 rakam" maxLength={11} className="w-full px-4 py-2 border rounded-lg" />
              {errors.tc_no && <p className="text-sm text-red-500 mt-1">{errors.tc_no}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banka Hesap Adı</label>
              <input name="bank_account_name" value={form.bank_account_name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IBAN</label>
            <input name="iban" value={form.iban} onChange={handleChange} placeholder="TR00 0000 0000 0000 0000 0000 00" className="w-full px-4 py-2 border rounded-lg" />
            {errors.iban && <p className="text-sm text-red-500 mt-1">{errors.iban}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adres</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="İkamet veya iletişim adresi" className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notlar</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" rows={4} />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">İptal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
