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
};
