import { supabase } from '../lib/supabase';

export interface PropertyOwnerData {
  full_name: string;
  phone?: string;
  email?: string;
  tc_no?: string;
  bank_account_name?: string;
  iban?: string;
  address?: string;
  notes?: string;
}

export const propertyOwnerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('property_owners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(owner: PropertyOwnerData) {
    // get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // get user's profile to obtain organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.organization_id) {
      throw new Error('User does not belong to an organization');
    }

    const payload = {
      organization_id: profile.organization_id,
      user_id: user.id,
      full_name: owner.full_name,
      phone: owner.phone,
      email: owner.email,
      tc_no: owner.tc_no,
      bank_account_name: owner.bank_account_name,
      iban: owner.iban,
      address: owner.address,
      notes: owner.notes,
    };

    const { data, error } = await supabase
      .from('property_owners')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
,

  async getById(id: string) {
    const { data, error } = await supabase
      .from('property_owners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, owner: Partial<PropertyOwnerData>) {
    // ensure user belongs to same organization
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

    // verify owner exists and belongs to the same organization
    const { data: existing, error: existingError } = await supabase
      .from('property_owners')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (existingError) throw existingError;
    if (existing.organization_id !== profile.organization_id) throw new Error('Not allowed to update this owner');

    const { data, error } = await supabase
      .from('property_owners')
      .update({ ...owner })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    // ensure user belongs to same organization
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

    // verify owner exists and belongs to the same organization
    const { data: existing, error: existingError } = await supabase
      .from('property_owners')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (existingError) throw existingError;
    if (existing.organization_id !== profile.organization_id) throw new Error('Not allowed to delete this owner');

    const { data, error } = await supabase
      .from('property_owners')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
