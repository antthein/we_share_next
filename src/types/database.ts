export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          excerpt: string | null
          content: string | null
          topic: string
          tags: string[]
          author_id: string
          read_time: number
          trust_score: number
          verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      votes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          type: 'upvote' | 'vouch'
        }
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id'>
        Update: never
      }
      bookmarks: {
        Row: {
          id: string
          post_id: string
          user_id: string
        }
        Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id'>
        Update: never
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          text: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>
        Update: never
      }
      shares: {
        Row: {
          id: string
          content: string
          tags: string[]
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['shares']['Row'], 'id' | 'created_at'>
        Update: never
      }
      share_reactions: {
        Row: {
          id: string
          share_id: string
          user_id: string
        }
        Insert: Omit<Database['public']['Tables']['share_reactions']['Row'], 'id'>
        Update: never
      }
      quotes: {
        Row: {
          id: string
          text: string
          author: string
          source: string | null
          theme: string
          is_ai_generated: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>
      }
      daily_quotes: {
        Row: {
          id: string
          quote_id: string
          date: string
          display_order: number
        }
        Insert: Omit<Database['public']['Tables']['daily_quotes']['Row'], 'id'>
        Update: never
      }
      quote_reactions: {
        Row: {
          id: string
          quote_id: string
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quote_reactions']['Row'], 'id' | 'created_at'>
        Update: never
      }
      quote_bookmarks: {
        Row: {
          id: string
          quote_id: string
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quote_bookmarks']['Row'], 'id' | 'created_at'>
        Update: never
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          expertise: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
  }
}

// Convenience types
export type Post     = Database['public']['Tables']['posts']['Row']
export type Vote     = Database['public']['Tables']['votes']['Row']
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type Comment  = Database['public']['Tables']['comments']['Row']
export type Share    = Database['public']['Tables']['shares']['Row']
export type Profile  = Database['public']['Tables']['profiles']['Row']

export type PostWithAuthor = Post & {
  profiles: Pick<Profile, 'display_name' | 'avatar_url' | 'expertise'>
  upvote_count: number
  vouch_count: number
}

export type ShareWithAuthor = Share & {
  profiles: Pick<Profile, 'display_name' | 'avatar_url'>
  co_sharer_count: number
}
