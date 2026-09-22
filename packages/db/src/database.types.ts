export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      asset_usages: {
        Row: {
          asset_id: string;
          kind: string;
          page_id: string;
          section_id: string;
          site_id: string;
        };
        Insert: {
          asset_id: string;
          kind: string;
          page_id: string;
          section_id: string;
          site_id: string;
        };
        Update: {
          asset_id?: string;
          kind?: string;
          page_id?: string;
          section_id?: string;
          site_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'asset_usages_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_usages_page_id_fkey';
            columns: ['page_id'];
            isOneToOne: false;
            referencedRelation: 'pages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_usages_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      asset_variants: {
        Row: {
          asset_id: string;
          height: number | null;
          key: string;
          mime_type: string;
          name: string;
          size: number;
          width: number | null;
        };
        Insert: {
          asset_id: string;
          height?: number | null;
          key: string;
          mime_type: string;
          name: string;
          size: number;
          width?: number | null;
        };
        Update: {
          asset_id?: string;
          height?: number | null;
          key?: string;
          mime_type?: string;
          name?: string;
          size?: number;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'asset_variants_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
        ];
      };
      assets: {
        Row: {
          alt: string;
          caption: string;
          created_at: string;
          decorative: boolean;
          filename: string;
          focal_x: number;
          focal_y: number;
          height: number | null;
          id: string;
          mime_type: string;
          sha256: string;
          site_id: string;
          size: number;
          tags: string[];
          updated_at: string;
          uploaded_by: string | null;
          width: number | null;
        };
        Insert: {
          alt?: string;
          caption?: string;
          created_at?: string;
          decorative?: boolean;
          filename: string;
          focal_x?: number;
          focal_y?: number;
          height?: number | null;
          id?: string;
          mime_type: string;
          sha256: string;
          site_id: string;
          size: number;
          tags?: string[];
          updated_at?: string;
          uploaded_by?: string | null;
          width?: number | null;
        };
        Update: {
          alt?: string;
          caption?: string;
          created_at?: string;
          decorative?: boolean;
          filename?: string;
          focal_x?: number;
          focal_y?: number;
          height?: number | null;
          id?: string;
          mime_type?: string;
          sha256?: string;
          site_id?: string;
          size?: number;
          tags?: string[];
          updated_at?: string;
          uploaded_by?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'assets_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
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
      content_entries: {
        Row: {
          collection: string;
          created_at: string;
          data: Json;
          id: string;
          site_id: string;
          sort_order: number;
          tags: string[];
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          collection: string;
          created_at?: string;
          data: Json;
          id?: string;
          site_id: string;
          sort_order?: number;
          tags?: string[];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          collection?: string;
          created_at?: string;
          data?: Json;
          id?: string;
          site_id?: string;
          sort_order?: number;
          tags?: string[];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'content_entries_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      form_submissions: {
        Row: {
          created_at: string;
          data: Json;
          form_id: string;
          id: string;
          meta: Json;
          site_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          data: Json;
          form_id: string;
          id?: string;
          meta?: Json;
          site_id: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          data?: Json;
          form_id?: string;
          id?: string;
          meta?: Json;
          site_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'form_submissions_form_id_fkey';
            columns: ['form_id'];
            isOneToOne: false;
            referencedRelation: 'forms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'form_submissions_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      forms: {
        Row: {
          created_at: string;
          fields: Json;
          id: string;
          name: string;
          settings: Json;
          site_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          fields?: Json;
          id?: string;
          name: string;
          settings?: Json;
          site_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          fields?: Json;
          id?: string;
          name?: string;
          settings?: Json;
          site_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'forms_site_id_fkey';
            columns: ['site_id'];
            isOneToOne: false;
            referencedRelation: 'sites';
            referencedColumns: ['id'];
          },
        ];
      };
      globals: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          revision: number;
          section: Json;
          site_id: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          revision?: number;
          section: Json;
          site_id: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          revision?: number;
          section?: Json;
          site_id?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'globals_site_id_fkey';
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
      redirects: {
        Row: {
          created_at: string;
          created_by: string | null;
          from_path: string;
          id: string;
          site_id: string;
          to_path: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          from_path: string;
          id?: string;
          site_id: string;
          to_path: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          from_path?: string;
          id?: string;
          site_id?: string;
          to_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'redirects_site_id_fkey';
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
          published_settings: Json | null;
          published_theme: Json | null;
          settings: Json;
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
          published_settings?: Json | null;
          published_theme?: Json | null;
          settings?: Json;
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
          published_settings?: Json | null;
          published_theme?: Json | null;
          settings?: Json;
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
      content_entry_refs: {
        Args: { p_entry: string };
        Returns: {
          page_id: string;
          page_title: string;
          section_id: string;
        }[];
      };
      create_asset: {
        Args: {
          p_filename: string;
          p_height: number;
          p_id: string;
          p_mime: string;
          p_sha256: string;
          p_site: string;
          p_size: number;
          p_variants: Json;
          p_width: number;
        };
        Returns: string;
      };
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
      delete_asset: {
        Args: { p_force?: boolean; p_id: string };
        Returns: string[];
      };
      delete_page: { Args: { p_page: string }; Returns: undefined };
      delete_site: { Args: { p_site: string }; Returns: string[] };
      get_public_form: { Args: { p_form: string }; Returns: Json };
      get_published_page: {
        Args: { p_site_slug: string; p_slug: string };
        Returns: Json;
      };
      get_published_site: { Args: { p_site_slug: string }; Returns: Json };
      get_redirect: {
        Args: { p_path: string; p_site_slug: string };
        Returns: string;
      };
      global_refs: {
        Args: { p_global: string };
        Returns: {
          page_id: string;
          page_title: string;
          section_id: string;
        }[];
      };
      has_site_role: {
        Args: {
          p_min: Database['public']['Enums']['member_role'];
          p_site: string;
        };
        Returns: boolean;
      };
      page_refs: {
        Args: { p_page: string };
        Returns: {
          page_id: string;
          page_title: string;
          section_id: string;
        }[];
      };
      publish_page: {
        Args: { p_document?: Json; p_note?: string; p_page: string };
        Returns: {
          number: number;
          version_id: string;
        }[];
      };
      refresh_asset_usages: {
        Args: { p_document: Json; p_kind: string; p_page: string };
        Returns: undefined;
      };
      restore_version: { Args: { p_version: string }; Returns: number };
      role_rank: {
        Args: { r: Database['public']['Enums']['member_role'] };
        Returns: number;
      };
      save_global: {
        Args: {
          p_expected_revision: number;
          p_id: string;
          p_name?: string;
          p_section: Json;
        };
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
      submit_form: {
        Args: { p_data: Json; p_form: string; p_meta?: Json };
        Returns: string;
      };
      unpublish_page: { Args: { p_page: string }; Returns: undefined };
      update_asset: {
        Args: {
          p_alt: string;
          p_caption: string;
          p_decorative: boolean;
          p_focal_x: number;
          p_focal_y: number;
          p_id: string;
          p_tags: string[];
        };
        Returns: undefined;
      };
      update_site_settings: {
        Args: { p_settings: Json; p_site: string };
        Returns: undefined;
      };
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
