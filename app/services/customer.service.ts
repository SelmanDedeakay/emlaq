// services/customer.service.ts
import { supabase } from '../lib/supabase';

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  status: 'aktif' | 'pasif' | 'buldu';
  criteriaStatus: 'satilik' | 'kiralik';
  types: string[];
  il: string;
  ilce: string;
  mahalleler: string[];
  minPrice?: string;
  maxPrice: string;
  minRooms: string;
  balcony: boolean;
  parking: boolean;
  inComplex: boolean;
  furnished: boolean;
  newBuilding: boolean;
}

export const customerService = {
  // Tüm müşterileri getir (organizasyona göre)
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Tek bir müşteri getir
  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Yeni müşteri ekle
  async create(formData: CustomerFormData) {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's profile to get organization_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('User does not belong to an organization');
    }

    // Prepare criteria object
    const criteria = {
      status: formData.criteriaStatus,
      types: formData.types,
      location: {
        il: formData.il,
        ilce: formData.ilce,
        mahalleler: formData.mahalleler,
      },
      budget: {
        min: formData.minPrice ? parseInt(formData.minPrice) : 0,
        max: parseInt(formData.maxPrice),
      },
      details: {
        minRooms: formData.minRooms,
      },
      features: {
        balcony: formData.balcony,
        parking: formData.parking,
        inComplex: formData.inComplex,
        furnished: formData.furnished,
        newBuilding: formData.newBuilding,
      },
    };

    // Insert customer
    const { data, error } = await supabase
      .from('customers')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        status: formData.status,
        criteria,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Müşteri güncelle
  async update(id: string, formData: Partial<CustomerFormData>) {
    const updates: any = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      status: formData.status,
    };

    // Update criteria if provided
    if (formData.criteriaStatus) {
      updates.criteria = {
        status: formData.criteriaStatus,
        types: formData.types,
        location: {
          il: formData.il,
          ilce: formData.ilce,
          mahalleler: formData.mahalleler,
        },
        budget: {
          min: formData.minPrice ? parseInt(formData.minPrice) : 0,
          max: parseInt(formData.maxPrice!),
        },
        details: {
          minRooms: formData.minRooms,
        },
        features: {
          balcony: formData.balcony,
          parking: formData.parking,
          inComplex: formData.inComplex,
          furnished: formData.furnished,
          newBuilding: formData.newBuilding,
        },
      };
    }

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Müşteri sil
  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Müşteriyi status'e göre güncelle
  async updateStatus(id: string, status: 'aktif' | 'pasif' | 'buldu') {
    const { data, error } = await supabase
      .from('customers')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};