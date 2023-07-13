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
      profiles: {
        Row: {
          created_at: string | null
          current_plan: string | null
          id: string
          Name: string | null
          remaining_messages: number | null
        }
        Insert: {
          created_at?: string | null
          current_plan?: string | null
          id: string
          Name?: string | null
          remaining_messages?: number | null
        }
        Update: {
          created_at?: string | null
          current_plan?: string | null
          id?: string
          Name?: string | null
          remaining_messages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
