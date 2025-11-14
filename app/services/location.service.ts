// services/location.service.ts
import { supabase } from '../lib/supabase';

export interface LocationFormData {
  name: string;
  il: string;
  ilce: string;
  mahalleler: string[];
  color: string;
}

export const locationService = {
  // Tüm konumları getir (organizasyona göre)
  async getAll() {
    const { data, error } = await supabase
      .from('saved_locations')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Tek bir konum getir
  async getById(id: string) {
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Yeni konum ekle
  async create(formData: LocationFormData) {
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

    // Insert location
    const { data, error } = await supabase
      .from('saved_locations')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        name: formData.name,
        il: formData.il,
        ilce: formData.ilce,
        mahalleler: formData.mahalleler,
        color: formData.color,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Konum güncelle
  async update(id: string, formData: Partial<LocationFormData>) {
    const updates: any = {
      name: formData.name,
      il: formData.il,
      ilce: formData.ilce,
      mahalleler: formData.mahalleler,
      color: formData.color,
    };

    const { data, error } = await supabase
      .from('saved_locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Konum sil
  async delete(id: string) {
    const { error } = await supabase
      .from('saved_locations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};