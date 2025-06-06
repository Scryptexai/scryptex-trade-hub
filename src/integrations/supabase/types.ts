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
      bridge_requests: {
        Row: {
          amount: number
          bridge_fee: number | null
          completed_at: string | null
          destination_chain_id: number
          destination_tx_hash: string | null
          id: string
          initiated_at: string
          metadata: Json | null
          source_chain_id: number
          source_tx_hash: string | null
          status: string | null
          token_id: string
          user_id: string
        }
        Insert: {
          amount: number
          bridge_fee?: number | null
          completed_at?: string | null
          destination_chain_id: number
          destination_tx_hash?: string | null
          id?: string
          initiated_at?: string
          metadata?: Json | null
          source_chain_id: number
          source_tx_hash?: string | null
          status?: string | null
          token_id: string
          user_id: string
        }
        Update: {
          amount?: number
          bridge_fee?: number | null
          completed_at?: string | null
          destination_chain_id?: number
          destination_tx_hash?: string | null
          id?: string
          initiated_at?: string
          metadata?: Json | null
          source_chain_id?: number
          source_tx_hash?: string | null
          status?: string | null
          token_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bridge_requests_destination_chain_id_fkey"
            columns: ["destination_chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "bridge_requests_source_chain_id_fkey"
            columns: ["source_chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "bridge_requests_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chains: {
        Row: {
          block_time: number | null
          chain_id: number
          created_at: string
          explorer_url: string | null
          features: Json | null
          gas_price_gwei: number | null
          id: string
          is_active: boolean | null
          is_testnet: boolean | null
          logo_url: string | null
          name: string
          rpc_url: string
          symbol: string
          updated_at: string
          ws_url: string | null
        }
        Insert: {
          block_time?: number | null
          chain_id: number
          created_at?: string
          explorer_url?: string | null
          features?: Json | null
          gas_price_gwei?: number | null
          id?: string
          is_active?: boolean | null
          is_testnet?: boolean | null
          logo_url?: string | null
          name: string
          rpc_url: string
          symbol: string
          updated_at?: string
          ws_url?: string | null
        }
        Update: {
          block_time?: number | null
          chain_id?: number
          created_at?: string
          explorer_url?: string | null
          features?: Json | null
          gas_price_gwei?: number | null
          id?: string
          is_active?: boolean | null
          is_testnet?: boolean | null
          logo_url?: string | null
          name?: string
          rpc_url?: string
          symbol?: string
          updated_at?: string
          ws_url?: string | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          chain_id: number
          contract_address: string
          created_at: string
          creator_id: string | null
          current_price: number | null
          decimals: number | null
          description: string | null
          id: string
          initial_price: number | null
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          market_cap: number | null
          max_supply: number | null
          metadata: Json | null
          name: string
          price_change_24h: number | null
          symbol: string
          telegram: string | null
          total_supply: number | null
          twitter: string | null
          updated_at: string
          volume_24h: number | null
          website: string | null
        }
        Insert: {
          chain_id: number
          contract_address: string
          created_at?: string
          creator_id?: string | null
          current_price?: number | null
          decimals?: number | null
          description?: string | null
          id?: string
          initial_price?: number | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          market_cap?: number | null
          max_supply?: number | null
          metadata?: Json | null
          name: string
          price_change_24h?: number | null
          symbol: string
          telegram?: string | null
          total_supply?: number | null
          twitter?: string | null
          updated_at?: string
          volume_24h?: number | null
          website?: string | null
        }
        Update: {
          chain_id?: number
          contract_address?: string
          created_at?: string
          creator_id?: string | null
          current_price?: number | null
          decimals?: number | null
          description?: string | null
          id?: string
          initial_price?: number | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          market_cap?: number | null
          max_supply?: number | null
          metadata?: Json | null
          name?: string
          price_change_24h?: number | null
          symbol?: string
          telegram?: string | null
          total_supply?: number | null
          twitter?: string | null
          updated_at?: string
          volume_24h?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "tokens_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_pairs: {
        Row: {
          base_token_id: string
          chain_id: number
          created_at: string
          fee_rate: number | null
          id: string
          is_active: boolean | null
          liquidity_usd: number | null
          pair_address: string | null
          quote_token_id: string
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          base_token_id: string
          chain_id: number
          created_at?: string
          fee_rate?: number | null
          id?: string
          is_active?: boolean | null
          liquidity_usd?: number | null
          pair_address?: string | null
          quote_token_id: string
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          base_token_id?: string
          chain_id?: number
          created_at?: string
          fee_rate?: number | null
          id?: string
          is_active?: boolean | null
          liquidity_usd?: number | null
          pair_address?: string | null
          quote_token_id?: string
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trading_pairs_base_token_id_fkey"
            columns: ["base_token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_pairs_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "trading_pairs_quote_token_id_fkey"
            columns: ["quote_token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          block_hash: string | null
          block_number: number | null
          chain_id: number
          created_at: string
          from_address: string
          gas_price: number | null
          gas_used: number | null
          id: string
          metadata: Json | null
          status: string | null
          to_address: string | null
          token_id: string | null
          transaction_fee: number | null
          transaction_index: number | null
          transaction_type: string
          tx_hash: string
          updated_at: string
          value: number | null
        }
        Insert: {
          amount?: number | null
          block_hash?: string | null
          block_number?: number | null
          chain_id: number
          created_at?: string
          from_address: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          to_address?: string | null
          token_id?: string | null
          transaction_fee?: number | null
          transaction_index?: number | null
          transaction_type: string
          tx_hash: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          amount?: number | null
          block_hash?: string | null
          block_number?: number | null
          chain_id?: number
          created_at?: string
          from_address?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          to_address?: string | null
          token_id?: string | null
          transaction_fee?: number | null
          transaction_index?: number | null
          transaction_type?: string
          tx_hash?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "transactions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          balance: number | null
          chain_id: number
          id: string
          last_updated: string
          locked_balance: number | null
          token_id: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          chain_id: number
          id?: string
          last_updated?: string
          locked_balance?: number | null
          token_id?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          chain_id?: number
          id?: string
          last_updated?: string
          locked_balance?: number | null
          token_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_balances_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["chain_id"]
          },
          {
            foreignKeyName: "user_balances_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          discord_handle: string | null
          email: string | null
          id: string
          telegram_handle: string | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord_handle?: string | null
          email?: string | null
          id?: string
          telegram_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord_handle?: string | null
          email?: string | null
          id?: string
          telegram_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_login: string | null
          nonce: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          nonce?: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          nonce?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
