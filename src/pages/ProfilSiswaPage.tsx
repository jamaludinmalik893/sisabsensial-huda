
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfilSiswaPopup from "@/components/ProfilSiswaPopup";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const ProfilSiswaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [siswa, setSiswa] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getSiswaById(id);
    }
  }, [id]);

  const getSiswaById = async (id_siswa: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("siswa")
      .select(`
        *,
        kelas:kelas(nama_kelas),
        guru_wali:guru_wali(nama_lengkap)
      `)
      .eq("id_siswa", id_siswa)
      .single();

    if (error || !data) {
      setSiswa(null);
    } else {
      setSiswa(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl relative">
        <Button variant="outline" className="absolute left-4 top-4" onClick={() => navigate(-1)}>
          Kembali
        </Button>
        {loading ? (
          <div className="p-12 text-center text-gray-500">Memuat data siswa...</div>
        ) : siswa ? (
          <ProfilSiswaPopup
            siswa={siswa}
            isOpen={true}
            onClose={() => navigate(-1)}
          />
        ) : (
          <div className="p-12 text-center text-red-500">Siswa tidak ditemukan.</div>
        )}
      </div>
    </div>
  );
};

export default ProfilSiswaPage;
