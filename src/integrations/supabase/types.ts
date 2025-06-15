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
      absensi: {
        Row: {
          catatan: string | null
          created_at: string | null
          id_absensi: string
          id_jurnal: string
          id_siswa: string
          status: string
          updated_at: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id_absensi?: string
          id_jurnal: string
          id_siswa: string
          status: string
          updated_at?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id_absensi?: string
          id_jurnal?: string
          id_siswa?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "absensi_id_jurnal_fkey"
            columns: ["id_jurnal"]
            isOneToOne: false
            referencedRelation: "jurnal_harian"
            referencedColumns: ["id_jurnal"]
          },
          {
            foreignKeyName: "absensi_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id_siswa"]
          },
        ]
      }
      guru: {
        Row: {
          alamat: string | null
          created_at: string | null
          email: string
          foto_url: string | null
          id_guru: string
          nama_lengkap: string
          nip: string
          nomor_telepon: string | null
          password: string
          status: string | null
          updated_at: string | null
          wali_kelas: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          email: string
          foto_url?: string | null
          id_guru?: string
          nama_lengkap: string
          nip: string
          nomor_telepon?: string | null
          password: string
          status?: string | null
          updated_at?: string | null
          wali_kelas?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          email?: string
          foto_url?: string | null
          id_guru?: string
          nama_lengkap?: string
          nip?: string
          nomor_telepon?: string | null
          password?: string
          status?: string | null
          updated_at?: string | null
          wali_kelas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_guru_wali_kelas"
            columns: ["wali_kelas"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id_kelas"]
          },
        ]
      }
      guru_mata_pelajaran: {
        Row: {
          created_at: string | null
          id: string
          id_guru: string
          id_mapel: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_guru: string
          id_mapel: string
        }
        Update: {
          created_at?: string | null
          id?: string
          id_guru?: string
          id_mapel?: string
        }
        Relationships: [
          {
            foreignKeyName: "guru_mata_pelajaran_id_guru_fkey"
            columns: ["id_guru"]
            isOneToOne: false
            referencedRelation: "guru"
            referencedColumns: ["id_guru"]
          },
          {
            foreignKeyName: "guru_mata_pelajaran_id_mapel_fkey"
            columns: ["id_mapel"]
            isOneToOne: false
            referencedRelation: "mata_pelajaran"
            referencedColumns: ["id_mapel"]
          },
        ]
      }
      guru_roles: {
        Row: {
          created_at: string | null
          id: string
          id_guru: string
          role: Database["public"]["Enums"]["guru_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_guru: string
          role: Database["public"]["Enums"]["guru_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          id_guru?: string
          role?: Database["public"]["Enums"]["guru_role"]
        }
        Relationships: [
          {
            foreignKeyName: "guru_roles_id_guru_fkey"
            columns: ["id_guru"]
            isOneToOne: false
            referencedRelation: "guru"
            referencedColumns: ["id_guru"]
          },
        ]
      }
      jurnal_harian: {
        Row: {
          created_at: string | null
          id_guru: string
          id_jurnal: string
          id_kelas: string
          id_mapel: string
          judul_materi: string
          materi_diajarkan: string
          tanggal_pelajaran: string
          updated_at: string | null
          waktu_mulai: string
          waktu_selesai: string
        }
        Insert: {
          created_at?: string | null
          id_guru: string
          id_jurnal?: string
          id_kelas: string
          id_mapel: string
          judul_materi: string
          materi_diajarkan: string
          tanggal_pelajaran: string
          updated_at?: string | null
          waktu_mulai: string
          waktu_selesai: string
        }
        Update: {
          created_at?: string | null
          id_guru?: string
          id_jurnal?: string
          id_kelas?: string
          id_mapel?: string
          judul_materi?: string
          materi_diajarkan?: string
          tanggal_pelajaran?: string
          updated_at?: string | null
          waktu_mulai?: string
          waktu_selesai?: string
        }
        Relationships: [
          {
            foreignKeyName: "jurnal_harian_id_guru_fkey"
            columns: ["id_guru"]
            isOneToOne: false
            referencedRelation: "guru"
            referencedColumns: ["id_guru"]
          },
          {
            foreignKeyName: "jurnal_harian_id_kelas_fkey"
            columns: ["id_kelas"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id_kelas"]
          },
          {
            foreignKeyName: "jurnal_harian_id_mapel_fkey"
            columns: ["id_mapel"]
            isOneToOne: false
            referencedRelation: "mata_pelajaran"
            referencedColumns: ["id_mapel"]
          },
        ]
      }
      kelas: {
        Row: {
          created_at: string | null
          id_kelas: string
          logo_url: string | null
          nama_kelas: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id_kelas?: string
          logo_url?: string | null
          nama_kelas: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id_kelas?: string
          logo_url?: string | null
          nama_kelas?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mata_pelajaran: {
        Row: {
          created_at: string | null
          id_mapel: string
          nama_mapel: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id_mapel?: string
          nama_mapel: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id_mapel?: string
          nama_mapel?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nilai: {
        Row: {
          catatan: string | null
          created_at: string | null
          id_jurnal: string
          id_mapel: string
          id_nilai: string
          id_siswa: string
          jenis_nilai: string
          judul_tugas: string
          skor: number
          tanggal_nilai: string
          tanggal_tugas_dibuat: string | null
          updated_at: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id_jurnal: string
          id_mapel: string
          id_nilai?: string
          id_siswa: string
          jenis_nilai: string
          judul_tugas: string
          skor: number
          tanggal_nilai: string
          tanggal_tugas_dibuat?: string | null
          updated_at?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id_jurnal?: string
          id_mapel?: string
          id_nilai?: string
          id_siswa?: string
          jenis_nilai?: string
          judul_tugas?: string
          skor?: number
          tanggal_nilai?: string
          tanggal_tugas_dibuat?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nilai_id_jurnal_fkey"
            columns: ["id_jurnal"]
            isOneToOne: false
            referencedRelation: "jurnal_harian"
            referencedColumns: ["id_jurnal"]
          },
          {
            foreignKeyName: "nilai_id_mapel_fkey"
            columns: ["id_mapel"]
            isOneToOne: false
            referencedRelation: "mata_pelajaran"
            referencedColumns: ["id_mapel"]
          },
          {
            foreignKeyName: "nilai_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id_siswa"]
          },
        ]
      }
      siswa: {
        Row: {
          alamat: string
          created_at: string | null
          foto_url: string | null
          id_guru_wali: string | null
          id_kelas: string | null
          id_siswa: string
          jenis_kelamin: string
          nama_lengkap: string
          nama_orang_tua: string
          nisn: string
          nomor_telepon: string | null
          nomor_telepon_orang_tua: string | null
          tahun_masuk: number
          tanggal_lahir: string
          tempat_lahir: string
          updated_at: string | null
        }
        Insert: {
          alamat: string
          created_at?: string | null
          foto_url?: string | null
          id_guru_wali?: string | null
          id_kelas?: string | null
          id_siswa?: string
          jenis_kelamin: string
          nama_lengkap: string
          nama_orang_tua: string
          nisn: string
          nomor_telepon?: string | null
          nomor_telepon_orang_tua?: string | null
          tahun_masuk: number
          tanggal_lahir: string
          tempat_lahir: string
          updated_at?: string | null
        }
        Update: {
          alamat?: string
          created_at?: string | null
          foto_url?: string | null
          id_guru_wali?: string | null
          id_kelas?: string | null
          id_siswa?: string
          jenis_kelamin?: string
          nama_lengkap?: string
          nama_orang_tua?: string
          nisn?: string
          nomor_telepon?: string | null
          nomor_telepon_orang_tua?: string | null
          tahun_masuk?: number
          tanggal_lahir?: string
          tempat_lahir?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "siswa_id_guru_wali_fkey"
            columns: ["id_guru_wali"]
            isOneToOne: false
            referencedRelation: "guru"
            referencedColumns: ["id_guru"]
          },
          {
            foreignKeyName: "siswa_id_kelas_fkey"
            columns: ["id_kelas"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id_kelas"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_guru_roles: {
        Args: { guru_id: string }
        Returns: Database["public"]["Enums"]["guru_role"][]
      }
      guru_has_role: {
        Args: {
          guru_id: string
          check_role: Database["public"]["Enums"]["guru_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      guru_role: "admin" | "guru" | "wali_kelas"
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
    Enums: {
      guru_role: ["admin", "guru", "wali_kelas"],
    },
  },
} as const
