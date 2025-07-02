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
          jam_pelajaran: number | null
          semester: Database["public"]["Enums"]["semester_type"] | null
          status: string
          updated_at: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id_absensi?: string
          id_jurnal: string
          id_siswa: string
          jam_pelajaran?: number | null
          semester?: Database["public"]["Enums"]["semester_type"] | null
          status: string
          updated_at?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id_absensi?: string
          id_jurnal?: string
          id_siswa?: string
          jam_pelajaran?: number | null
          semester?: Database["public"]["Enums"]["semester_type"] | null
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
          {
            foreignKeyName: "absensi_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_siswa"
            referencedColumns: ["id_siswa"]
          },
          {
            foreignKeyName: "absensi_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "v_statistik_nilai"
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
          {
            foreignKeyName: "fk_guru_wali_kelas"
            columns: ["wali_kelas"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_kelas"
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
            foreignKeyName: "guru_mata_pelajaran_id_guru_fkey"
            columns: ["id_guru"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_siswa"
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
          {
            foreignKeyName: "guru_roles_id_guru_fkey"
            columns: ["id_guru"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_siswa"
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
          jam_pelajaran: number | null
          judul_materi: string
          materi_diajarkan: string
          semester: Database["public"]["Enums"]["semester_type"] | null
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
          jam_pelajaran?: number | null
          judul_materi: string
          materi_diajarkan: string
          semester?: Database["public"]["Enums"]["semester_type"] | null
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
          jam_pelajaran?: number | null
          judul_materi?: string
          materi_diajarkan?: string
          semester?: Database["public"]["Enums"]["semester_type"] | null
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
            foreignKeyName: "jurnal_harian_id_guru_fkey"
            columns: ["id_guru"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_siswa"
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
            foreignKeyName: "jurnal_harian_id_kelas_fkey"
            columns: ["id_kelas"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_kelas"
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
          id_mapel: string
          id_nilai: string
          id_siswa: string
          jenis_nilai: string
          judul_tugas: string
          semester: Database["public"]["Enums"]["semester_type"] | null
          skor: number
          tanggal_nilai: string
          tanggal_tugas_dibuat: string | null
          updated_at: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id_mapel: string
          id_nilai?: string
          id_siswa: string
          jenis_nilai: string
          judul_tugas: string
          semester?: Database["public"]["Enums"]["semester_type"] | null
          skor: number
          tanggal_nilai: string
          tanggal_tugas_dibuat?: string | null
          updated_at?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id_mapel?: string
          id_nilai?: string
          id_siswa?: string
          jenis_nilai?: string
          judul_tugas?: string
          semester?: Database["public"]["Enums"]["semester_type"] | null
          skor?: number
          tanggal_nilai?: string
          tanggal_tugas_dibuat?: string | null
          updated_at?: string | null
        }
        Relationships: [
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
          {
            foreignKeyName: "nilai_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_siswa"
            referencedColumns: ["id_siswa"]
          },
          {
            foreignKeyName: "nilai_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "v_statistik_nilai"
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
          nomor_telepon_siswa: string | null
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
          nomor_telepon_siswa?: string | null
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
          nomor_telepon_siswa?: string | null
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
            foreignKeyName: "siswa_id_guru_wali_fkey"
            columns: ["id_guru_wali"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_siswa"
            referencedColumns: ["id_guru"]
          },
          {
            foreignKeyName: "siswa_id_kelas_fkey"
            columns: ["id_kelas"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id_kelas"]
          },
          {
            foreignKeyName: "siswa_id_kelas_fkey"
            columns: ["id_kelas"]
            isOneToOne: false
            referencedRelation: "v_statistik_kehadiran_kelas"
            referencedColumns: ["id_kelas"]
          },
        ]
      }
    }
    Views: {
      v_statistik_kehadiran_kelas: {
        Row: {
          id_kelas: string | null
          nama_kelas: string | null
          persentase_hadir: number | null
          total_alpha: number | null
          total_hadir: number | null
          total_izin: number | null
          total_pertemuan: number | null
          total_sakit: number | null
          total_siswa: number | null
        }
        Relationships: []
      }
      v_statistik_kehadiran_siswa: {
        Row: {
          id_guru: string | null
          id_siswa: string | null
          nama_kelas: string | null
          nama_lengkap: string | null
          nama_mapel: string | null
          nisn: string | null
          persentase_hadir: number | null
          tanggal_pelajaran: string | null
          total_alpha: number | null
          total_hadir: number | null
          total_izin: number | null
          total_pertemuan: number | null
          total_sakit: number | null
        }
        Relationships: []
      }
      v_statistik_nilai: {
        Row: {
          id_siswa: string | null
          jenis_nilai: string | null
          jumlah_nilai: number | null
          nama_kelas: string | null
          nama_lengkap: string | null
          nama_mapel: string | null
          nilai_maksimum: number | null
          nilai_minimum: number | null
          nisn: string | null
          rata_rata: number | null
          tanggal_nilai: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_attendance_statistics: {
        Args:
          | {
              p_guru_id: string
              p_start_date?: string
              p_end_date?: string
              p_kelas_id?: string
              p_mapel_id?: string
            }
          | {
              p_guru_id: string
              p_start_date?: string
              p_end_date?: string
              p_kelas_id?: string
              p_mapel_id?: string
              p_semester?: Database["public"]["Enums"]["semester_type"]
            }
        Returns: {
          nama_siswa: string
          nisn: string
          kelas: string
          total_hadir: number
          total_izin: number
          total_sakit: number
          total_alpha: number
          total_pertemuan: number
          persentase_hadir: number
        }[]
      }
      get_attendance_trend: {
        Args:
          | {
              p_guru_id: string
              p_start_date?: string
              p_end_date?: string
              p_period?: string
            }
          | {
              p_guru_id: string
              p_start_date?: string
              p_end_date?: string
              p_period?: string
              p_semester?: Database["public"]["Enums"]["semester_type"]
            }
        Returns: {
          periode: string
          persentase_hadir: number
        }[]
      }
      get_class_attendance_stats: {
        Args:
          | {
              p_guru_id: string
              p_start_date?: string
              p_end_date?: string
              p_kelas_id?: string
              p_mapel_id?: string
            }
          | {
              p_guru_id: string
              p_start_date?: string
              p_end_date?: string
              p_kelas_id?: string
              p_mapel_id?: string
              p_semester?: Database["public"]["Enums"]["semester_type"]
            }
        Returns: {
          nama_kelas: string
          total_hadir: number
          total_izin: number
          total_sakit: number
          total_alpha: number
          persentase_hadir: number
        }[]
      }
      get_guru_roles: {
        Args: { guru_id: string }
        Returns: Database["public"]["Enums"]["guru_role"][]
      }
      get_semester_from_date: {
        Args: { input_date: string }
        Returns: Database["public"]["Enums"]["semester_type"]
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
      semester_type: "Ganjil" | "Genap"
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
      semester_type: ["Ganjil", "Genap"],
    },
  },
} as const
