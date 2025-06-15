
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';

interface JurnalSelectorProps {
  userSession: UserSession;
  onJurnalSelected: (jurnal: any) => void;
}

interface JurnalHarian {
  id_jurnal: string;
  tanggal_pelajaran: string;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  mata_pelajaran: {
    nama_mapel: string;
  };
  kelas: {
    nama_kelas: string;
  };
}

const JurnalSelector: React.FC<JurnalSelectorProps> = ({ userSession, onJurnalSelected }) => {
  const [jurnalList, setJurnalList] = useState<JurnalHarian[]>([]);
  const [selectedJurnalId, setSelectedJurnalId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJurnalList();
  }, [userSession]);

  const loadJurnalList = async () => {
    try {
      setLoading(true);
      
      // Hanya load jurnal dari mata pelajaran yang diampu oleh guru ini
      const { data, error } = await supabase
        .from('jurnal_harian')
        .select(`
          id_jurnal,
          tanggal_pelajaran,
          waktu_mulai,
          waktu_selesai,
          judul_materi,
          mata_pelajaran!inner(nama_mapel, guru_mata_pelajaran!inner(id_guru)),
          kelas!inner(nama_kelas)
        `)
        .eq('mata_pelajaran.guru_mata_pelajaran.id_guru', userSession.guru.id_guru)
        .order('tanggal_pelajaran', { ascending: false })
        .order('waktu_mulai', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setJurnalList(data || []);
    } catch (error) {
      console.error('Error loading jurnal list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJurnalSelect = () => {
    const selectedJurnal = jurnalList.find(j => j.id_jurnal === selectedJurnalId);
    if (selectedJurnal) {
      onJurnalSelected(selectedJurnal);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getSelectedJurnal = () => {
    return jurnalList.find(j => j.id_jurnal === selectedJurnalId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Memuat daftar jurnal...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Pilih Jurnal untuk Absensi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {jurnalList.length > 0 ? (
          <>
            <div>
              <Select value={selectedJurnalId} onValueChange={setSelectedJurnalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jurnal harian" />
                </SelectTrigger>
                <SelectContent>
                  {jurnalList.map((jurnal) => (
                    <SelectItem key={jurnal.id_jurnal} value={jurnal.id_jurnal}>
                      <div className="flex flex-col">
                        <span className="font-medium">{jurnal.judul_materi}</span>
                        <span className="text-xs text-gray-500">
                          {jurnal.mata_pelajaran.nama_mapel} - {jurnal.kelas.nama_kelas} | {formatDate(jurnal.tanggal_pelajaran)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedJurnalId && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <h4 className="font-medium text-blue-900 mb-2">Detail Jurnal Terpilih:</h4>
                  {(() => {
                    const selectedJurnal = getSelectedJurnal();
                    return selectedJurnal ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{selectedJurnal.mata_pelajaran.nama_mapel}</span>
                          <Badge variant="outline">{selectedJurnal.kelas.nama_kelas}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>{formatDate(selectedJurnal.tanggal_pelajaran)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{formatTime(selectedJurnal.waktu_mulai)} - {formatTime(selectedJurnal.waktu_selesai)}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-blue-800 font-medium">{selectedJurnal.judul_materi}</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                <Button onClick={handleJurnalSelect} className="w-full">
                  Mulai Absensi
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Belum Ada Jurnal</h3>
              <p className="text-sm text-gray-500 mt-1">
                Anda belum memiliki jurnal harian untuk mata pelajaran yang Anda ampu. 
                Silakan buat jurnal terlebih dahulu sebelum melakukan absensi.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JurnalSelector;
