// Generated from committed migrations by npm run gen:types.
// Do not edit by hand. Generated from committed migrations.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = {
  public: {
    Tables: {
      aggregator_branch_links: {
        Row: {
          id: string;
          workspace_id: string;
          connection_id: string;
          branch_id: string;
          external_vendor_id: string | null;
          is_demo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          connection_id: string;
          branch_id: string;
          external_vendor_id?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          connection_id?: string;
          branch_id?: string;
          external_vendor_id?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      aggregator_connections: {
        Row: {
          id: string;
          workspace_id: string;
          provider: string;
          mode: Database["public"]["Enums"]["connection_mode"];
          status: Database["public"]["Enums"]["connection_status"];
          display_name: string;
          external_account_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider: string;
          mode?: Database["public"]["Enums"]["connection_mode"];
          status?: Database["public"]["Enums"]["connection_status"];
          display_name?: string;
          external_account_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          provider?: string;
          mode?: Database["public"]["Enums"]["connection_mode"];
          status?: Database["public"]["Enums"]["connection_status"];
          display_name?: string;
          external_account_id?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      approval_requests: {
        Row: {
          id: string;
          workspace_id: string;
          opportunity_id: string;
          branch_id: string | null;
          requested_by: string | null;
          reviewed_by: string | null;
          status: string;
          rationale: string;
          decided_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          opportunity_id: string;
          branch_id?: string | null;
          requested_by?: string | null;
          reviewed_by?: string | null;
          status?: string;
          rationale?: string;
          decided_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          opportunity_id?: string;
          branch_id?: string | null;
          requested_by?: string | null;
          reviewed_by?: string | null;
          status?: string;
          rationale?: string;
          decided_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      branches: {
        Row: {
          id: string;
          workspace_id: string;
          brand_id: string;
          code: string;
          name: string;
          name_ar: string | null;
          city: string;
          timezone: string;
          is_demo: boolean;
          created_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          brand_id: string;
          code: string;
          name: string;
          name_ar?: string | null;
          city?: string;
          timezone?: string;
          is_demo?: boolean;
          created_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          brand_id?: string;
          code?: string;
          name?: string;
          name_ar?: string | null;
          city?: string;
          timezone?: string;
          is_demo?: boolean;
          created_at?: string;
          archived_at?: string | null;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          name_ar: string | null;
          is_demo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          name_ar?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          name_ar?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      catalog_products: {
        Row: {
          id: string;
          workspace_id: string;
          brand_id: string;
          sku: string;
          name_en: string;
          name_ar: string;
          category: string;
          description_en: string;
          price_sar: number;
          cost_sar: number | null;
          listing_quality: number;
          is_demo: boolean;
          updated_at: string;
          image_path: string | null;
          price_basis: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          brand_id: string;
          sku: string;
          name_en: string;
          name_ar?: string;
          category: string;
          description_en?: string;
          price_sar: number;
          cost_sar?: number | null;
          listing_quality?: number;
          is_demo?: boolean;
          updated_at?: string;
          image_path?: string | null;
          price_basis?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          brand_id?: string;
          sku?: string;
          name_en?: string;
          name_ar?: string;
          category?: string;
          description_en?: string;
          price_sar?: number;
          cost_sar?: number | null;
          listing_quality?: number;
          is_demo?: boolean;
          updated_at?: string;
          image_path?: string | null;
          price_basis?: string;
        };
        Relationships: [];
      };
      demo_audit_events: {
        Row: {
          id: string;
          workspace_id: string;
          actor_user_id: string | null;
          action: string;
          entity_kind: string;
          entity_id: string | null;
          details: Json;
          is_demo: boolean;
          created_at: string;
          branch_id: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          actor_user_id?: string | null;
          action: string;
          entity_kind: string;
          entity_id?: string | null;
          details?: Json;
          is_demo?: boolean;
          created_at?: string;
          branch_id?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          actor_user_id?: string | null;
          action?: string;
          entity_kind?: string;
          entity_id?: string | null;
          details?: Json;
          is_demo?: boolean;
          created_at?: string;
          branch_id?: string | null;
        };
        Relationships: [];
      };
      demo_drafts: {
        Row: {
          id: string;
          workspace_id: string;
          kind: string;
          title: string;
          payload: Json;
          status: string;
          created_by: string | null;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          kind: string;
          title: string;
          payload?: Json;
          status?: string;
          created_by?: string | null;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          kind?: string;
          title?: string;
          payload?: Json;
          status?: string;
          created_by?: string | null;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      demo_executions: {
        Row: {
          id: string;
          workspace_id: string;
          approval_id: string;
          status: string;
          external_confirmation: string;
          explanation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          approval_id: string;
          status?: string;
          external_confirmation?: string;
          explanation?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          approval_id?: string;
          status?: string;
          external_confirmation?: string;
          explanation?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      membership_branch_access: {
        Row: {
          membership_id: string;
          workspace_id: string;
          branch_id: string;
        };
        Insert: {
          membership_id: string;
          workspace_id: string;
          branch_id: string;
        };
        Update: {
          membership_id?: string;
          workspace_id?: string;
          branch_id?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          workspace_id: string;
          branch_id: string | null;
          product_id: string | null;
          demo_key: string;
          domain: string;
          title: string;
          description: string;
          priority: string;
          status: string;
          estimated_impact_sar: number | null;
          confidence: number | null;
          evidence: Json;
          recommendation: Json;
          source: string;
          observed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          branch_id?: string | null;
          product_id?: string | null;
          demo_key: string;
          domain: string;
          title: string;
          description: string;
          priority: string;
          status?: string;
          estimated_impact_sar?: number | null;
          confidence?: number | null;
          evidence?: Json;
          recommendation?: Json;
          source?: string;
          observed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          branch_id?: string | null;
          product_id?: string | null;
          demo_key?: string;
          domain?: string;
          title?: string;
          description?: string;
          priority?: string;
          status?: string;
          estimated_impact_sar?: number | null;
          confidence?: number | null;
          evidence?: Json;
          recommendation?: Json;
          source?: string;
          observed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_import_batches: {
        Row: {
          id: string;
          workspace_id: string;
          branch_id: string;
          source: string;
          source_files_sha256: string;
          source_store_sha256: string;
          source_file_count: number;
          source_order_count: number;
          first_order_day: string;
          last_order_day: string;
          imported_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          branch_id: string;
          source: string;
          source_files_sha256: string;
          source_store_sha256: string;
          source_file_count: number;
          source_order_count: number;
          first_order_day: string;
          last_order_day: string;
          imported_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          branch_id?: string;
          source?: string;
          source_files_sha256?: string;
          source_store_sha256?: string;
          source_file_count?: number;
          source_order_count?: number;
          first_order_day?: string;
          last_order_day?: string;
          imported_at?: string;
        };
        Relationships: [];
      };
      order_performance_daily: {
        Row: {
          workspace_id: string;
          branch_id: string;
          import_batch_id: string;
          day: string;
          delivered_orders: number;
          cancelled_orders: number;
          complaint_orders: number;
          gross_sales_sar: number;
          reported_payout_sar: number;
          estimated_earnings_sar: number;
          vendor_discount_sar: number;
          commission_sar: number;
          online_payment_fee_sar: number;
          operational_charges_sar: number;
          ads_fee_sar: number;
          delivery_minutes_sum: number;
          delivery_minutes_count: number;
        };
        Insert: {
          workspace_id: string;
          branch_id: string;
          import_batch_id: string;
          day: string;
          delivered_orders: number;
          cancelled_orders: number;
          complaint_orders: number;
          gross_sales_sar: number;
          reported_payout_sar: number;
          estimated_earnings_sar: number;
          vendor_discount_sar: number;
          commission_sar: number;
          online_payment_fee_sar: number;
          operational_charges_sar: number;
          ads_fee_sar: number;
          delivery_minutes_sum: number;
          delivery_minutes_count: number;
        };
        Update: {
          workspace_id?: string;
          branch_id?: string;
          import_batch_id?: string;
          day?: string;
          delivered_orders?: number;
          cancelled_orders?: number;
          complaint_orders?: number;
          gross_sales_sar?: number;
          reported_payout_sar?: number;
          estimated_earnings_sar?: number;
          vendor_discount_sar?: number;
          commission_sar?: number;
          online_payment_fee_sar?: number;
          operational_charges_sar?: number;
          ads_fee_sar?: number;
          delivery_minutes_sum?: number;
          delivery_minutes_count?: number;
        };
        Relationships: [];
      };
      performance_daily: {
        Row: {
          workspace_id: string;
          branch_id: string;
          day: string;
          orders: number;
          revenue_sar: number;
          ad_spend_sar: number;
          source: string;
        };
        Insert: {
          workspace_id: string;
          branch_id: string;
          day: string;
          orders: number;
          revenue_sar: number;
          ad_spend_sar: number;
          source?: string;
        };
        Update: {
          workspace_id?: string;
          branch_id?: string;
          day?: string;
          orders?: number;
          revenue_sar?: number;
          ad_spend_sar?: number;
          source?: string;
        };
        Relationships: [];
      };
      product_branch_state: {
        Row: {
          workspace_id: string;
          product_id: string;
          branch_id: string;
          is_available: boolean;
          price_sar: number;
          is_demo: boolean;
          updated_at: string;
        };
        Insert: {
          workspace_id: string;
          product_id: string;
          branch_id: string;
          is_available?: boolean;
          price_sar: number;
          is_demo?: boolean;
          updated_at?: string;
        };
        Update: {
          workspace_id?: string;
          product_id?: string;
          branch_id?: string;
          is_available?: boolean;
          price_sar?: number;
          is_demo?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          full_name: string;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name?: string;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          full_name?: string;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_memberships: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["workspace_role"];
          status: Database["public"]["Enums"]["membership_status"];
          scope_all_branches: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["workspace_role"];
          status?: Database["public"]["Enums"]["membership_status"];
          scope_all_branches?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["workspace_role"];
          status?: Database["public"]["Enums"]["membership_status"];
          scope_all_branches?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          onboarding_stage: string;
          created_at: string;
          updated_at: string;
          reporting_mode: string;
          logo_path: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          onboarding_stage?: string;
          created_at?: string;
          updated_at?: string;
          reporting_mode?: string;
          logo_path?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          onboarding_stage?: string;
          created_at?: string;
          updated_at?: string;
          reporting_mode?: string;
          logo_path?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_workspace: { Args: { p_name: string }; Returns: string };
      create_mock_connection: { Args: { p_workspace_id: string }; Returns: string };
      bootstrap_demo_workspace: { Args: { p_workspace_id: string }; Returns: number };
      demo_update_opportunity: {
        Args: { p_opportunity_id: string; p_action: string };
        Returns: string;
      };
      demo_decide_approval: {
        Args: { p_approval_id: string; p_decision: string; p_reason?: string };
        Returns: string;
      };
      demo_save_product_draft: {
        Args: {
          p_product_id: string;
          p_name_en: string;
          p_name_ar: string;
          p_description_en: string;
          p_price_sar: number;
        };
        Returns: string;
      };
      demo_save_draft: {
        Args: { p_workspace_id: string; p_kind: string; p_title: string; p_payload: Json };
        Returns: string;
      };
    };
    Enums: {
      connection_mode: "mock" | "sandbox";
      connection_status: "draft" | "mock_ready" | "pending_credentials" | "connected" | "error";
      membership_status: "active" | "invited" | "suspended";
      workspace_role: "owner" | "general_manager" | "ecommerce_manager" | "operator" | "viewer";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
