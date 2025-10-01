export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      communities: {
        Row: {
          club_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          is_public: boolean
          name: string
          tagname: string[]
          updated_at: string
        }
        Insert: {
          club_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          is_public?: boolean
          name: string
          tagname?: string[]
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          is_public?: boolean
          name?: string
          tagname?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          club_id: string
          deleted_at: string | null
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          club_id: string
          deleted_at?: string | null
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          club_id?: string
          deleted_at?: string | null
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_member_club'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['club_id']
          },
          {
            foreignKeyName: 'fk_member_user'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string
          deleted_at: string | null
          emoji: string
          goal_id: string
          reaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          emoji: string
          goal_id: string
          reaction_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          emoji?: string
          goal_id?: string
          reaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_reaction_goal'
            columns: ['goal_id']
            isOneToOne: false
            referencedRelation: 'study_goals'
            referencedColumns: ['goal_id']
          },
          {
            foreignKeyName: 'fk_reaction_user'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
      study_goals: {
        Row: {
          club_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          end_date: string
          goal_id: string
          is_team: boolean
          owner_id: string
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          end_date: string
          goal_id?: string
          is_team?: boolean
          owner_id: string
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string
          goal_id?: string
          is_team?: boolean
          owner_id?: string
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_goal_club'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['club_id']
          },
          {
            foreignKeyName: 'fk_goal_owner'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          nickname: string | null
          provider: string
          provider_id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          nickname?: string | null
          provider: string
          provider_id: string
          updated_at?: string
          user_id?: string
          username: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          nickname?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      is_community_admin: {
        Args: { p_club_id: string; p_user_id: string }
        Returns: boolean
      }
      is_community_member: {
        Args: { p_club_id: string; p_user_id: string }
        Returns: boolean
      }
      is_public_community: {
        Args: { p_club_id: string }
        Returns: boolean
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
