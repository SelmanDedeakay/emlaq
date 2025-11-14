// services/portfolio.service.ts (UPDATED)
import { supabase } from '../lib/supabase';
import { getMahalleCoordinates } from '@/app/utils/geocoding';

export interface PortfolioFormData {
  title: string;
  ownerId: string; // yeni required owner alanı
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
  imageUrls?: string[]; // Yeni alan
}

export const portfolioService = {
  // Tüm portföyleri getir (organizasyona göre)
  async getAll() {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        property_images(*),
        property_owners(full_name)
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
        property_owners(*),
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

    // Owner must be provided
    if (!formData.ownerId) {
      throw new Error('Mal sahibi seçilmesi zorunludur');
    }

    // Validate owner exists and belongs to same organization
    const { data: owner, error: ownerError } = await supabase
      .from('property_owners')
      .select('id')
      .eq('id', formData.ownerId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (ownerError || !owner) {
      throw new Error('Seçilen mal sahibi bulunamadı veya yetkiniz yok');
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
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        title: formData.title || `${formData.mahalle} ${formData.rooms}`,
        status: formData.status,
        type: formData.type,
        price: formData.price,
        owner_id: formData.ownerId,
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

    if (portfolioError) throw portfolioError;

    // Resimleri ekle (varsa)
    if (formData.imageUrls && formData.imageUrls.length > 0) {
      const imageInserts = formData.imageUrls.map((url, index) => ({
        portfolio_id: portfolio.id,
        image_url: url,
        sort_order: index,
      }));

      const { error: imagesError } = await supabase
        .from('property_images')
        .insert(imageInserts);

      if (imagesError) {
        console.error('Error inserting images:', imagesError);
        // Resim hatası olsa bile portföy eklendi, sadece log et
      }
    }

    return portfolio;
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

    // If ownerId provided, validate it belongs to the same organization and set owner_id
    if (formData.ownerId) {
      // Get current user to read organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('User does not belong to an organization');
      }

      const { data: owner, error: ownerError } = await supabase
        .from('property_owners')
        .select('id')
        .eq('id', formData.ownerId)
        .eq('organization_id', profile.organization_id)
        .single();

      if (ownerError || !owner) {
        throw new Error('Seçilen mal sahibi bulunamadı veya yetkiniz yok');
      }

      updates.owner_id = formData.ownerId;
    }

    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Resimleri güncelle (varsa)
    if (formData.imageUrls !== undefined) {
      // Önce mevcut resimleri sil
      await supabase
        .from('property_images')
        .delete()
        .eq('portfolio_id', id);

      // Yeni resimleri ekle
      if (formData.imageUrls.length > 0) {
        const imageInserts = formData.imageUrls.map((url, index) => ({
          portfolio_id: id,
          image_url: url,
          sort_order: index,
        }));

        await supabase
          .from('property_images')
          .insert(imageInserts);
      }
    }

    return data;
  },

  // Portföy sil
  async delete(id: string) {
    // Cascade delete will automatically remove images
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Tek resim ekle (mevcut portföye)
  async addImage(portfolioId: string, imageUrl: string, sortOrder?: number) {
    // Eğer sortOrder verilmediyse, mevcut resimlerin sayısını al
    if (sortOrder === undefined) {
      const { data: existingImages } = await supabase
        .from('property_images')
        .select('sort_order')
        .eq('portfolio_id', portfolioId)
        .order('sort_order', { ascending: false })
        .limit(1);

      sortOrder = existingImages && existingImages.length > 0 
        ? existingImages[0].sort_order + 1 
        : 0;
    }

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

  // Resim sil
  async deleteImage(imageId: string) {
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  },

  // Resim sırasını güncelle
  async updateImageOrder(portfolioId: string, imageUrls: string[]) {
    // Önce mevcut resimleri sil
    await supabase
      .from('property_images')
      .delete()
      .eq('portfolio_id', portfolioId);

    // Yeni sırayla ekle
    if (imageUrls.length > 0) {
      const imageInserts = imageUrls.map((url, index) => ({
        portfolio_id: portfolioId,
        image_url: url,
        sort_order: index,
      }));

      const { error } = await supabase
        .from('property_images')
        .insert(imageInserts);

      if (error) throw error;
    }
  },
};