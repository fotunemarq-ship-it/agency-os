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
      leads: {
        Row: {
          id: string
          company_name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          industry: string | null
          city: string | null
          status: 'new' | 'first_call_pending' | 'calling' | 'contacted' | 'qualified' | 'strategy_booked' | 'strategy_completed' | 'nurture' | 'disqualified' | 'closed_won' | 'closed_lost'
          assigned_sales_exec: string | null
          assigned_strategist: string | null
          import_batch_id: string | null
          next_action_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          industry?: string | null
          city?: string | null
          status?: 'new' | 'first_call_pending' | 'calling' | 'contacted' | 'qualified' | 'strategy_booked' | 'strategy_completed' | 'nurture' | 'disqualified' | 'closed_won' | 'closed_lost'
          assigned_sales_exec?: string | null
          assigned_strategist?: string | null
          import_batch_id?: string | null
          next_action_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          industry?: string | null
          city?: string | null
          status?: 'new' | 'first_call_pending' | 'calling' | 'contacted' | 'qualified' | 'strategy_booked' | 'strategy_completed' | 'nurture' | 'disqualified' | 'closed_won' | 'closed_lost'
          assigned_sales_exec?: string | null
          assigned_strategist?: string | null
          import_batch_id?: string | null
          next_action_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      market_insights: {
        Row: {
          id: string
          industry: string
          city: string
          search_volume: string | null
          market_difficulty: string | null
          top_competitors: Json | null
          pitch_angle: string | null
          created_at: string
        }
        Insert: {
          id?: string
          industry: string
          city: string
          search_volume?: string | null
          market_difficulty?: string | null
          top_competitors?: Json | null
          pitch_angle?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          industry?: string
          city?: string
          search_volume?: string | null
          market_difficulty?: string | null
          top_competitors?: Json | null
          pitch_angle?: string | null
          created_at?: string
        }
      }
    }
  }
}

