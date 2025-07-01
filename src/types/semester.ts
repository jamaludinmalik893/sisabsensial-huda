
export type SemesterType = 'Ganjil' | 'Genap';

export interface SemesterInfo {
  semester: SemesterType;
  tahun: number;
  label: string;
}

export const getSemesterFromDate = (date: Date): SemesterType => {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  return month >= 7 && month <= 12 ? 'Ganjil' : 'Genap';
};

export const getCurrentSemester = (): SemesterInfo => {
  const now = new Date();
  const semester = getSemesterFromDate(now);
  const tahun = now.getFullYear();
  
  return {
    semester,
    tahun,
    label: `${semester} ${tahun}/${tahun + 1}`
  };
};

export const getSemesterOptions = (): SemesterInfo[] => {
  const currentYear = new Date().getFullYear();
  const options: SemesterInfo[] = [];
  
  // Generate semester options for current and previous years
  for (let year = currentYear; year >= currentYear - 2; year--) {
    options.push({
      semester: 'Ganjil',
      tahun: year,
      label: `Ganjil ${year}/${year + 1}`
    });
    options.push({
      semester: 'Genap',
      tahun: year,
      label: `Genap ${year}/${year + 1}`
    });
  }
  
  return options;
};
