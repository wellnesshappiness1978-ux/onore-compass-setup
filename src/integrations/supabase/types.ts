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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      account_settings: {
        Row: {
          key: string
          updated_at: string
          user_id: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          user_id: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      consultation_bookmarks: {
        Row: {
          content: string
          created_at: string
          id: string
          language: string
          message_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          language: string
          message_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          language?: string
          message_id?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          feature: string
          updated_at: string
          usage_day: string
          used: number
          user_id: string
        }
        Insert: {
          feature: string
          updated_at?: string
          usage_day: string
          used?: number
          user_id: string
        }
        Update: {
          feature?: string
          updated_at?: string
          usage_day?: string
          used?: number
          user_id?: string
        }
        Relationships: []
      }
      divination_results: {
        Row: {
          art_id: string
          created_at: string
          id: string
          methodology: string
          profile_version: string
          result: Json
          user_id: string
        }
        Insert: {
          art_id: string
          created_at?: string
          id?: string
          methodology: string
          profile_version: string
          result: Json
          user_id: string
        }
        Update: {
          art_id?: string
          created_at?: string
          id?: string
          methodology?: string
          profile_version?: string
          result?: Json
          user_id?: string
        }
        Relationships: []
      }
      family_readings: {
        Row: {
          created_at: string
          error: string | null
          fingerprint: string
          result: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          fingerprint: string
          result?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          fingerprint?: string
          result?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_memberships: {
        Row: {
          debug_expires_at: string | null
          debug_previous_plan: string | null
          plan: string
          stripe_customer_id: string | null
          stripe_status: string | null
          stripe_subscription_id: string | null
          stripe_valid_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          debug_expires_at?: string | null
          debug_previous_plan?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          stripe_valid_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          debug_expires_at?: string | null
          debug_previous_plan?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          stripe_valid_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_city: string
          birth_date: string | null
          birth_place: string
          birth_time: string | null
          birth_time_unknown: boolean
          blood_type: string
          design_mode: string
          gender: string
          goal: string
          goal_preset: string
          name_kana: string
          name_kanji: string
          name_romaji: string
          parents: Json | null
          profile_version: string
          sibling_order: string
          target_id: string | null
          target_kind: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_city?: string
          birth_date?: string | null
          birth_place?: string
          birth_time?: string | null
          birth_time_unknown?: boolean
          blood_type?: string
          design_mode?: string
          gender?: string
          goal?: string
          goal_preset?: string
          name_kana?: string
          name_kanji?: string
          name_romaji?: string
          parents?: Json | null
          profile_version?: string
          sibling_order?: string
          target_id?: string | null
          target_kind?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_city?: string
          birth_date?: string | null
          birth_place?: string
          birth_time?: string | null
          birth_time_unknown?: boolean
          blood_type?: string
          design_mode?: string
          gender?: string
          goal?: string
          goal_preset?: string
          name_kana?: string
          name_kanji?: string
          name_romaji?: string
          parents?: Json | null
          profile_version?: string
          sibling_order?: string
          target_id?: string | null
          target_kind?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_devices: {
        Row: {
          language: string
          last_sent: Json
          paused: boolean
          reminders: Json
          timezone: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          language?: string
          last_sent?: Json
          paused?: boolean
          reminders?: Json
          timezone?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          language?: string
          last_sent?: Json
          paused?: boolean
          reminders?: Json
          timezone?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_device_cache: {
        Row: {
          cache_key: string
          local_key: string | null
          result: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          cache_key: string
          local_key?: string | null
          result: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          local_key?: string | null
          result?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          user_id?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      team_groups: {
        Row: {
          created_at: string
          id: string
          member_ids: string[]
          name: string
          nickname: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_ids?: string[]
          name?: string
          nickname?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_ids?: string[]
          name?: string
          nickname?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          birth_city: string
          birth_date: string
          birth_place: string
          birth_time: string | null
          birth_time_unknown: boolean
          blood_type: string
          created_at: string
          gender: string
          id: string
          name: string
          name_kana: string
          nickname: string
          parents: Json | null
          relationship: string
          relationship_type: string
          role: string
          sibling_order: string
          skills: string[]
          user_id: string
        }
        Insert: {
          birth_city?: string
          birth_date: string
          birth_place?: string
          birth_time?: string | null
          birth_time_unknown?: boolean
          blood_type?: string
          created_at?: string
          gender?: string
          id?: string
          name: string
          name_kana?: string
          nickname?: string
          parents?: Json | null
          relationship?: string
          relationship_type?: string
          role?: string
          sibling_order?: string
          skills?: string[]
          user_id: string
        }
        Update: {
          birth_city?: string
          birth_date?: string
          birth_place?: string
          birth_time?: string | null
          birth_time_unknown?: boolean
          blood_type?: string
          created_at?: string
          gender?: string
          id?: string
          name?: string
          name_kana?: string
          nickname?: string
          parents?: Json | null
          relationship?: string
          relationship_type?: string
          role?: string
          sibling_order?: string
          skills?: string[]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_daily_usage: {
        Args: { p_day: string; p_feature: string }
        Returns: number
      }
      current_feature_daily_usage_limit: {
        Args: { p_feature: string }
        Returns: number
      }
      current_plan_daily_usage_limit: { Args: never; Returns: number }
      expire_stripe_membership_plan: {
        Args: { p_customer: string; p_plan: string; p_until: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      plan_consultation_usage_limit: {
        Args: { p_plan: string }
        Returns: number
      }
      plan_daily_usage_limit: { Args: { p_plan: string }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
