export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string | null
          location: string
          venue: string
          date: string
          end_date: string | null
          price: number | null
          is_featured: boolean
          category_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          image_url?: string | null
          location: string
          venue?: string
          date: string
          end_date?: string | null
          price?: number | null
          is_featured?: boolean
          category_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string | null
          location?: string
          venue?: string
          date?: string
          end_date?: string | null
          price?: number | null
          is_featured?: boolean
          category_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
