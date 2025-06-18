
import React, { useState, useEffect, useRef } from 'react';
import { UserSession } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import PrintableAbsenHarian from './PrintableAbsenHarian';
import AbsensiStats from './components/AbsensiStats';
import PresensiTable from './components/PresensiTable';
import JurnalMengajarTable from './components/JurnalMengajarTable';
import CatatanAbsensiTable from './components/CatatanAbsensiTable';
import { useAbsenHarianData } from '@/hooks/useAbsenHarianData';

interface AbsenHarianPageProps {
  userSession: UserSession;
}

const AbsenHarianPage: React.FC<AbsenHarianPageProps> = ({ userSession }) => {
  const [tanggalPilihan, setTanggalPilihan] = useState(new Date().toISOString().split('T')[0]);
  const printRef = useRef<HTMLDivElement>(null);

  const {
    siswaAbsensi,
    jurnalHari,
    catatanAbsensi,
    loading,
    loadDataAbsensi,
    countStatus
  } = useAbsenHarianData(userSession, tanggalPilihan);

  useEffect(() => {
    if (userSession.isWaliKelas && userSession.kelasWali) {
      loadDataAbsensi();
    }
  }, [tanggalPilihan, userSession, loadDataAbsensi]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalDisplay = printContent.style.display;
    printContent.style.display = 'block';
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Presensi Harian - ${userSession.kelasWali?.nama_kelas}</title>
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 4px;
              text-align: center;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .text-left {
              text-align: left;
            }
            .text-center {
              text-align: center;
            }
            h1, h2 {
              margin: 5px 0;
            }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-4 { margin-top: 16px; }
            .p-1 { padding: 4px; }
            .p-2 { padding: 8px; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .text-xs { font-size: 10px; }
            .text-sm { font-size: 11px; }
            .text-lg { font-size: 16px; }
            .w-8 { width: 32px; }
            .w-6 { width: 24px; }
            .w-16 { width: 64px; }
            .h-12 { height: 48px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      printContent.style.display = originalDisplay;
    }, 250);
  };

  if (!userSession.isWaliKelas) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Anda bukan wali kelas dari kelas manapun.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presensi Harian</h1>
          <p className="text-gray-600">Kelas {userSession.kelasWali?.nama_kelas}</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              type="date"
              value={tanggalPilihan}
              onChange={(e) => setTanggalPilihan(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={loadDataAbsensi} disabled={loading}>
            {loading ? 'Memuat...' : 'Refresh'}
          </Button>
          <Button onClick={handlePrint} variant="outline" disabled={loading}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <AbsensiStats countStatus={countStatus} />

      {/* Tabel Presensi */}
      <PresensiTable
        tanggalPilihan={tanggalPilihan}
        siswaAbsensi={siswaAbsensi}
        jurnalHari={jurnalHari}
        loading={loading}
      />

      {/* Jurnal Mengajar */}
      <JurnalMengajarTable
        tanggalPilihan={tanggalPilihan}
        jurnalHari={jurnalHari}
      />

      {/* Catatan Absensi */}
      <CatatanAbsensiTable
        tanggalPilihan={tanggalPilihan}
        catatanAbsensi={catatanAbsensi}
        loading={loading}
      />

      {/* Printable Component */}
      <div ref={printRef}>
        <PrintableAbsenHarian
          tanggal={tanggalPilihan}
          siswaAbsensi={siswaAbsensi}
          jurnalHari={jurnalHari}
          namaKelas={userSession.kelasWali?.nama_kelas || ''}
          waliKelas={userSession.guru.nama_lengkap}
        />
      </div>
    </div>
  );
};

export default AbsenHarianPage;
