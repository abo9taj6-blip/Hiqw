import * as XLSX from 'xlsx';

export const excelService = {
  exportToExcel: (data: any[], fileName: string) => {
    // Sanitize data strictly for Excel limits (32,767 characters per cell)
    const sanitizedData = data.map(item => {
      const newItem: any = {};
      for (const key in item) {
        let value = item[key];
        if (typeof value === 'string' && value.length > 32760) {
          value = value.substring(0, 32760) + '... [TRUNCATED]';
        }
        newItem[key] = value;
      }
      return newItem;
    });

    const ws = XLSX.utils.json_to_sheet(sanitizedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  },

  importFromExcel: (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellNF: false, cellText: false });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
};
