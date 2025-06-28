export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          message: string
          response: string
          subject_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          message: string
          response: string
          subject_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          message?: string
          response?: string
          subject_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          content_outline: Json | null
          created_at: string
          grade_level: number
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          content_outline?: Json | null
          created_at?: string
          grade_level: number
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          content_outline?: Json | null
          created_at?: string
          grade_level?: number
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor_conversations: {
        Row: {
          ai_response: string
          child_name: string
          conversation_turn: number | null
          created_at: string
          id: string
          key_stage: string | null
          lesson_context: Json | null
          message_length: number | null
          response_length: number | null
          response_time_ms: number | null
          session_id: string | null
          subject: string | null
          user_id: string
          user_message: string
        }
        Insert: {
          ai_response: string
          child_name: string
          conversation_turn?: number | null
          created_at?: string
          id?: string
          key_stage?: string | null
          lesson_context?: Json | null
          message_length?: number | null
          response_length?: number | null
          response_time_ms?: number | null
          session_id?: string | null
          subject?: string | null
          user_id: string
          user_message: string
        }
        Update: {
          ai_response?: string
          child_name?: string
          conversation_turn?: number | null
          created_at?: string
          id?: string
          key_stage?: string | null
          lesson_context?: Json | null
          message_length?: number | null
          response_length?: number | null
          response_time_ms?: number | null
          session_id?: string | null
          subject?: string | null
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          grade_level: number | null
          id: string
          name: string
          preferences: Json | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          grade_level?: number | null
          id: string
          name: string
          preferences?: Json | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          grade_level?: number | null
          id?: string
          name?: string
          preferences?: Json | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      tutor_analytics: {
        Row: {
          avg_message_length: number | null
          avg_response_length: number | null
          avg_response_time: number | null
          child_name: string | null
          conversation_date: string | null
          key_stage: string | null
          last_conversation: string | null
          subject: string | null
          total_conversations: number | null
          total_sessions: number | null
          user_id: string | null
        }
        Relationships: []
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
