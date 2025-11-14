// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          role: 'admin' | 'agent'
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: 'admin' | 'agent'
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: 'admin' | 'agent'
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          status: 'satilik' | 'kiralik' | 'satildi'
          type: 'daire' | 'mustakil' | 'isyeri' | 'arsa'
          price: number
          il: string
          ilce: string
          mahalle: string
          latitude: number | null
          longitude: number | null
          rooms: '1+0' | '1+1' | '2+1' | '3+1' | '4+1' | '5+1'
          square_meters: number
          features: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title: string
          status: 'satilik' | 'kiralik' | 'satildi'
          type: 'daire' | 'mustakil' | 'isyeri' | 'arsa'
          price: number
          il: string
          ilce: string
          mahalle: string
          latitude?: number | null
          longitude?: number | null
          rooms: '1+0' | '1+1' | '2+1' | '3+1' | '4+1' | '5+1'
          square_meters: number
          features?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          title?: string
          status?: 'satilik' | 'kiralik' | 'satildi'
          type?: 'daire' | 'mustakil' | 'isyeri' | 'arsa'
          price?: number
          il?: string
          ilce?: string
          mahalle?: string
          latitude?: number | null
          longitude?: number | null
          rooms?: '1+0' | '1+1' | '2+1' | '3+1' | '4+1' | '5+1'
          square_meters?: number
          features?: Record<string, any>
          created_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          portfolio_id: string
          image_url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          image_url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          image_url?: string
          sort_order?: number
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          phone: string | null
          email: string | null
          status: 'aktif' | 'pasif' | 'buldu'
          criteria: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          phone?: string | null
          email?: string | null
          status?: 'aktif' | 'pasif' | 'buldu'
          criteria?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          status?: 'aktif' | 'pasif' | 'buldu'
          criteria?: Record<string, any>
          created_at?: string
        }
      }
      saved_locations: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          il: string
          ilce: string
          mahalleler: string[]
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          il: string
          ilce: string
          mahalleler?: string[]
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string
          il?: string
          ilce?: string
          mahalleler?: string[]
          color?: string
          created_at?: string
        }
      }
    }
  }
}