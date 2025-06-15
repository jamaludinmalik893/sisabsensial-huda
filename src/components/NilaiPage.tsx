
import React from "react";

const NilaiPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] py-10">
      <h2 className="text-2xl font-bold mb-4">Menu Nilai</h2>
      <p className="text-gray-600 mb-2">
        Pilih submenu <b>Rekapitulasi Nilai</b> atau <b>Entry Nilai</b> di menu samping.
      </p>
      <p className="text-gray-400 text-sm">
        (Jika Anda tidak melihat submenu, refresh aplikasi.)
      </p>
    </div>
  );
};

export default NilaiPage;
