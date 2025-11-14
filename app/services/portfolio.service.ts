// services/portfolio.service.ts
import { supabase } from '../lib/supabase';
import { getMahalleCoordinates } from '@/app/utils/geocoding';

export interface PortfolioFormData {
  title: string;
  status: 'satilik' | 'kiralik' | 'satildi';
  type: 'daire' | 'mustakil' | 'isyeri' | 'arsa';
  price: number;
  il: string;
  ilce: string;
  mahalle: string;
  rooms: '1+0' | '1+1' | '2+1' | '3+1' | '4+1' | '5+1';
  squareMeters: number;
  balcony: boolean;
  parking: boolean;
  inComplex: boolean;
  furnished: boolean;
  newBuilding: boolean;
}

export const portfolioService = {
  // Tüm portföyleri getir (organizasyona göre)
  async getAll() {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        property_images(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Tek bir portföy getir
  async getById(id: string) {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        property_images(*),
        profiles(full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Yeni portföy ekle
  async create(formData: PortfolioFormData) {
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

    // Get coordinates for the mahalle
    const coordinates = getMahalleCoordinates(formData.mahalle);

    // Prepare features object
    const features = {
      balcony: formData.balcony,
      parking: formData.parking,
      inComplex: formData.inComplex,
      furnished: formData.furnished,
      newBuilding: formData.newBuilding,
    };

    // Insert portfolio
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        title: formData.title || `${formData.mahalle} ${formData.rooms}`,
        status: formData.status,
        type: formData.type,
        price: formData.price,
        il: formData.il,
        ilce: formData.ilce,
        mahalle: formData.mahalle,
        latitude: coordinates[0],
        longitude: coordinates[1],
        rooms: formData.rooms,
        square_meters: formData.squareMeters,
        features,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Portföy güncelle
  async update(id: string, formData: Partial<PortfolioFormData>) {
    const updates: any = {
      title: formData.title,
      status: formData.status,
      type: formData.type,
      price: formData.price,
      il: formData.il,
      ilce: formData.ilce,
      mahalle: formData.mahalle,
      rooms: formData.rooms,
      square_meters: formData.squareMeters,
    };

    // Update coordinates if location changed
    if (formData.mahalle) {
      const coordinates = getMahalleCoordinates(formData.mahalle);
      updates.latitude = coordinates[0];
      updates.longitude = coordinates[1];
    }

    // Update features if provided
    if (formData.balcony !== undefined) {
      updates.features = {
        balcony: formData.balcony,
        parking: formData.parking,
        inComplex: formData.inComplex,
        furnished: formData.furnished,
        newBuilding: formData.newBuilding,
      };
    }

    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Portföy sil
  async delete(id: string) {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Portföy resmi ekle
  async addImage(portfolioId: string, imageUrl: string, sortOrder: number = 0) {
    const { data, error } = await supabase
      .from('property_images')
      .insert({
        portfolio_id: portfolioId,
        image_url: imageUrl,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Portföy resmi sil
  async deleteImage(imageId: string) {
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  },
};