
export interface BulkNilaiItem {
  id_siswa: string;
  skor: number;
  catatan: string;
}

export function valuesToBulkNilaiEntry(
  bulkValues: Record<string, { skor: string; catatan: string } | string>
): Record<string, BulkNilaiItem> {
  const result: Record<string, BulkNilaiItem> = {};
  Object.entries(bulkValues).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Normal format {skor, catatan}
      if (value.skor !== undefined && String(value.skor).trim() !== '') {
        result[key] = {
          id_siswa: key,
          skor: Number(value.skor),
          catatan: value.catatan ?? '',
        };
      }
    } else if (typeof value === 'string' && value.trim() !== '') {
      // Backward compatibility: string only
      result[key] = {
        id_siswa: key,
        skor: Number(value),
        catatan: '',
      };
    }
  });
  return result;
}
