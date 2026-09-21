export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: number;
          metadata: Json;
          site_id: string | null;
        };
        Insert: {
          action: string;
          actor?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: never;
          metadata?: Json;
          site_id?: string | null;
        };
        Update: {
          action?: string;
          actor?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: never;
          metadata?: Json;
          site_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      organization_members: {
        Row: {
          created_at: string;
          organization_id: string;
          role: Database['public']['Enums']['member_role'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          organization_id: string;
          role?: Database['public']['Enums']['member_role'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          organization_id?: string;
          role?: Database['public']['Enums']['member_role'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      page_drafts: {
        Row: {
          document: Json;
          page_id: string;
          revision: number;
          site_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          document: Json;
          page_id: string;
          revision?: number;
          site_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          document?: Json;
          page_id?: string;
          revision?: number;
          site_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'page_drafts_page_id_fkey';
            columns: ['page_id'];
            isOneToOne: true;
            referencedRelation: 'pages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'page_drafts_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      page_versions: {
        Row: {
          created_at: string;
          created_by: string | null;
          document: Json;
          id: string;
          note: string | null;
          number: number;
          page_id: string;
          site_id: string;
          source: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          document: Json;
          id?: string;
          note?: string | null;
          number: number;
          page_id: string;
          site_id: string;
          source?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          document?: Json;
          id?: string;
          note?: string | null;
          number?: number;
          page_id?: string;
          site_id?: string;
          source?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'page_versions_page_id_fkey';
            columns: ['page_id'];
            isOneToOne: false;
            referencedRelation: 'pages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'page_versions_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      pages: {
        Row: {
          created_at: string;
          id: string;
          published_at: string | null;
          published_version_id: string | null;
          site_id: string;
          slug: string;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          published_at?: string | null;
          published_version_id?: string | null;
          site_id: string;
          slug: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          published_at?: string | null;
          published_version_id?: string | null;
          site_id?: string;
          slug?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pages_published_version_id_fkey';
            columns: ['published_version_id'];
            isOneToOne: false;
            referencedRelation: 'page_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pages_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      site_members: {
        Row: {
          created_at: string;
          role: Database['public']['Enums']['member_role'];
          site_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role?: Database['public']['Enums']['member_role'];
          site_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: Database['public']['Enums']['member_role'];
          site_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'site_members_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      sites: {
        Row: {
          business_type: string;
          created_at: string;
          id: string;
          name: string;
          organization_id: string;
          published_theme: Json | null;
          slug: string;
          theme: Json;
          updated_at: string;
        };
        Insert: {
          business_type?: string;
          created_at?: string;
          id?: string;
          name: string;
          organization_id: string;
          published_theme?: Json | null;
          slug: string;
          theme: Json;
          updated_at?: string;
        };
        Update: {
          business_type?: string;
          created_at?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          published_theme?: Json | null;
          slug?: string;
          theme?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sites_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_page: {
        Args: {
          p_document: Json;
          p_site: string;
          p_slug: string;
          p_title: string;
        };
        Returns: string;
      };
      create_site: {
        Args: {
          p_business_type?: string;
          p_name: string;
          p_slug: string;
          p_theme: Json;
        };
        Returns: string;
      };
      delete_page: { Args: { p_page: string }; Returns: undefined };
      get_published_page: {
        Args: { p_site_slug: string; p_slug: string };
        Returns: Json;
      };
      get_published_site: { Args: { p_site_slug: string }; Returns: Json };
      has_site_role: {
        Args: {
          p_min: Database['public']['Enums']['member_role'];
          p_site: string;
        };
        Returns: boolean;
      };
      publish_page: {
        Args: { p_note?: string; p_page: string };
        Returns: {
          number: number;
          version_id: string;
        }[];
      };
      restore_version: { Args: { p_version: string }; Returns: number };
      role_rank: {
        Args: { r: Database['public']['Enums']['member_role'] };
        Returns: number;
      };
      save_page_draft: {
        Args: { p_document: Json; p_expected_revision: number; p_page: string };
        Returns: number;
      };
      site_role: {
        Args: { p_site: string };
        Returns: Database['public']['Enums']['member_role'];
      };
      unpublish_page: { Args: { p_page: string }; Returns: undefined };
      update_site_theme: {
        Args: { p_site: string; p_theme: Json };
        Returns: undefined;
      };
    };
    Enums: {
      member_role: 'owner' | 'admin' | 'editor' | 'publisher' | 'viewer';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      member_role: ['owner', 'admin', 'editor', 'publisher', 'viewer'],
    },
  },
} as const;
