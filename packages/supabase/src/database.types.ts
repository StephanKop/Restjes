Initialising login role...
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          consumer_id: string
          created_at: string
          dish_id: string | null
          id: string
          last_message_at: string | null
          merchant_id: string
        }
        Insert: {
          consumer_id: string
          created_at?: string
          dish_id?: string | null
          id?: string
          last_message_at?: string | null
          merchant_id: string
        }
        Update: {
          consumer_id?: string
          created_at?: string
          dish_id?: string | null
          id?: string
          last_message_at?: string | null
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_allergies: {
        Row: {
          allergen: Database["public"]["Enums"]["allergen"]
          dish_id: string
          id: string
        }
        Insert: {
          allergen: Database["public"]["Enums"]["allergen"]
          dish_id: string
          id?: string
        }
        Update: {
          allergen?: Database["public"]["Enums"]["allergen"]
          dish_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_allergies_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_ingredients: {
        Row: {
          dish_id: string
          id: string
          name: string
        }
        Insert: {
          dish_id: string
          id?: string
          name: string
        }
        Update: {
          dish_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_ingredients_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          bring_own_container: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_vegan: boolean
          is_vegetarian: boolean
          merchant_id: string
          pickup_end: string | null
          pickup_start: string | null
          quantity_available: number
          search_vector: unknown
          status: Database["public"]["Enums"]["dish_status"]
          title: string
          updated_at: string
        }
        Insert: {
          bring_own_container?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_vegan?: boolean
          is_vegetarian?: boolean
          merchant_id: string
          pickup_end?: string | null
          pickup_start?: string | null
          quantity_available?: number
          search_vector?: unknown
          status?: Database["public"]["Enums"]["dish_status"]
          title: string
          updated_at?: string
        }
        Update: {
          bring_own_container?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_vegan?: boolean
          is_vegetarian?: boolean
          merchant_id?: string
          pickup_end?: string | null
          pickup_start?: string | null
          quantity_available?: number
          search_vector?: unknown
          status?: Database["public"]["Enums"]["dish_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dishes_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avg_rating: number
          banner_url: string | null
          business_name: string
          city: string | null
          country: string
          created_at: string
          description: string | null
          id: string
          is_verified: boolean
          kvk_number: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          phone: string | null
          postal_code: string | null
          profile_id: string
          review_count: number
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avg_rating?: number
          banner_url?: string | null
          business_name: string
          city?: string | null
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          kvk_number?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string | null
          profile_id: string
          review_count?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avg_rating?: number
          banner_url?: string | null
          business_name?: string
          city?: string | null
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          kvk_number?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string | null
          profile_id?: string
          review_count?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          display_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          profile_id: string
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          profile_id: string
          token: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          profile_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          consumer_id: string
          created_at: string
          dish_id: string
          id: string
          merchant_id: string
          notes: string | null
          pickup_time: string | null
          quantity: number
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          consumer_id: string
          created_at?: string
          dish_id: string
          id?: string
          merchant_id: string
          notes?: string | null
          pickup_time?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          consumer_id?: string
          created_at?: string
          dish_id?: string
          id?: string
          merchant_id?: string
          notes?: string | null
          pickup_time?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          consumer_id: string
          created_at: string
          id: string
          merchant_id: string
          rating: number
          reservation_id: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          consumer_id: string
          created_at?: string
          id?: string
          merchant_id: string
          rating: number
          reservation_id?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          consumer_id?: string
          created_at?: string
          id?: string
          merchant_id?: string
          rating?: number
          reservation_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_reservation"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
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
      allergen:
        | "gluten"
        | "crustaceans"
        | "eggs"
        | "fish"
        | "peanuts"
        | "soybeans"
        | "milk"
        | "nuts"
        | "celery"
        | "mustard"
        | "sesame"
        | "sulphites"
        | "lupin"
        | "molluscs"
      dish_status: "available" | "reserved" | "collected" | "expired"
      reservation_status:
        | "pending"
        | "confirmed"
        | "collected"
        | "cancelled"
        | "no_show"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      allergen: [
        "gluten",
        "crustaceans",
        "eggs",
        "fish",
        "peanuts",
        "soybeans",
        "milk",
        "nuts",
        "celery",
        "mustard",
        "sesame",
        "sulphites",
        "lupin",
        "molluscs",
      ],
      dish_status: ["available", "reserved", "collected", "expired"],
      reservation_status: [
        "pending",
        "confirmed",
        "collected",
        "cancelled",
        "no_show",
      ],
    },
  },
} as const
A new version of Supabase CLI is available: v2.84.2 (currently installed v2.75.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
