
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MataPelajaran } from '@/types';

export const useGuruMataPelajaran = (idGuru: string) => {
  const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuruMataPelajaran = async () => {
      if (!idGuru) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('guru_mata_pelajaran')
          .select(`
            mata_pelajaran:id_mapel (
              id_mapel,
              nama_mapel,
              created_at,
              updated_at
            )
          `)
          .eq('id_guru', idGuru);

        if (error) {
          console.error('Error fetching guru mata pelajaran:', error);
          setError(error.message);
          return;
        }

        // Extract mata pelajaran from the nested structure
        const mapelList = data
          ?.map(item => item.mata_pelajaran)
          .filter(Boolean) as MataPelajaran[];

        setMataPelajaran(mapelList || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan tidak terduga');
      } finally {
        setLoading(false);
      }
    };

    fetchGuruMataPelajaran();
  }, [idGuru]);

  return { mataPelajaran, loading, error };
};
