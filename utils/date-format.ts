import { format, isValid, differenceInYears, parse } from "date-fns";
import { id } from "date-fns/locale/id";


export const toValidDate = (dateInput: any): Date | null => {
  if (!dateInput) return null;

  let dateObj: Date;

  try {
    // 1. Handle Firebase Timestamp ({seconds: ...})
    if (typeof dateInput === 'object' && 'seconds' in dateInput) {
      dateObj = new Date(dateInput.seconds * 1000);
    }
    // 2. Handle Firestore .toDate()
    else if (typeof dateInput?.toDate === 'function') {
      dateObj = dateInput.toDate();
    }
    // 3. Handle String
    else if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (trimmed === "" || trimmed === "-" || trimmed.toLowerCase() === "belum baptis") {
        return null;
      }
      // Handle format DD/MM/YYYY agar tidak terbalik/invalid
      if (trimmed.includes('/')) {
        dateObj = parse(trimmed, 'dd/MM/yyyy', new Date());
      } else {
        dateObj = new Date(trimmed);
      }
    }
    // 4. Handle Date object atau number timestamp
    else {
      dateObj = new Date(dateInput);
    }

    return isValid(dateObj) ? dateObj : null;
  } catch (error) {
    return null;
  }
};


/**
 * 1. Helper Universal untuk Format Tanggal di Indonesia
 * Bisa menerima: Date, String ISO, Number, atau Firestore Timestamp
 */
export const formatTanggal = (
  dateInput: any,
  formatStr: string = "dd MMM yyyy",
  fallback: string = "-"
): string => {
  const dateObj = toValidDate(dateInput);

  // Jika toValidDate mengembalikan null, pakai fallback
  if (!dateObj) return fallback;

  return format(dateObj, formatStr, { locale: id });
};

/**
 * 2. Helper khusus untuk input HTML type="date" (yyyy-MM-dd)
 */
export const formatForInput = (dateInput: any): string => {
  return formatTanggal(dateInput, "yyyy-MM-dd", "");
};

/**
 * 3. Helper untuk menghitung Umur (Selisih Tahun)
 */
export const hitungUmur = (dateInput: any): number | string => {
  if (!dateInput) return "-";

  let dateObj: Date | null = null;

  if (typeof dateInput === 'string' && dateInput.includes('/')) {
    dateObj = parse(dateInput, 'dd/MM/yyyy', new Date());
  } else {
    // Gunakan logika konversi standar Anda di sini
    dateObj = new Date(dateInput);
  }

  // Kuncinya ada di sini:
  if (!dateObj || !isValid(dateObj)) return "-";

  return differenceInYears(new Date(), dateObj);
};
