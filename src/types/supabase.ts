export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
        }
      }
      logs: {
        Row: {
          id: string
          user_id: string
          date: string
          start_time: string
          end_time: string
          duration_minutes: number
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          date: string
          start_time: string
          end_time: string
          duration_minutes: number
          notes?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted'
          created_at: string
        }
        Insert: {
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted'
        }
      }
    }
  }
}
