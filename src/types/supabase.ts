export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          discord_id: string | null;
          discord_username: string | null;
          discord_avatar_url: string | null;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          discord_id?: string | null;
          discord_username?: string | null;
          discord_avatar_url?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          discord_id?: string | null;
          discord_username?: string | null;
          discord_avatar_url?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          step_id: string;
          points_awarded: number;
          completed_at: string;
          postman_user_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          step_id: string;
          points_awarded?: number;
          completed_at?: string;
          postman_user_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          step_id?: string;
          points_awarded?: number;
          completed_at?: string;
          postman_user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      utm_attribution: {
        Row: {
          id: string;
          user_id: string;
          content_type: string;
          content_id: string;
          utm_source: string;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          first_seen_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_type: string;
          content_id: string;
          utm_source: string;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          first_seen_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_type?: string;
          content_id?: string;
          utm_source?: string;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          first_seen_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "utm_attribution_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      validation_contexts: {
        Row: {
          id: string;
          user_id: string;
          postman_user_id: string;
          context: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          postman_user_id: string;
          context?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          postman_user_id?: string;
          context?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "validation_contexts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      user_points: {
        Row: {
          user_id: string;
          total_points: number;
          total_steps_completed: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      switch_postman_org: {
        Args: {
          p_user_id: string;
          p_postman_user_id: string;
          p_initial_context?: Json;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
