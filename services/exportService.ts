
export class ExportService {
  /**
   * تصدير محتوى إلى PDF باستخدام html2pdf
   */
  async exportToPDF(elementId: string, fileName: string = 'Academic_Report.pdf') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
  }

  /**
   * تصدير الجداول من النص الماركدون إلى Excel
   */
  exportToExcel(content: string, fileName: string = 'Research_Data.xlsx') {
    // محاولة بسيطة لاستخراج الجداول من الماركدون
    const lines = content.split('\n');
    const tableData: string[][] = [];
    let inTable = false;

    lines.forEach(line => {
      if (line.includes('|') && line.trim().startsWith('|')) {
        const row = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        if (row.length > 0 && !line.includes('---')) {
          tableData.push(row);
        }
        inTable = true;
      } else {
        if (inTable && tableData.length > 0) {
          // إضافة سطر فارغ بين الجداول
          tableData.push([]);
          inTable = false;
        }
      }
    });

    if (tableData.length === 0) {
      // إذا لم يوجد جدول، نضع النص كاملاً في خلية واحدة كخطة بديلة
      tableData.push(['المحتوى البحثي']);
      tableData.push([content]);
    }

    // @ts-ignore
    const ws = window.XLSX.utils.aoa_to_sheet(tableData);
    // @ts-ignore
    const wb = window.XLSX.utils.book_new();
    // @ts-ignore
    window.XLSX.utils.book_append_sheet(wb, ws, "Research Report");
    // @ts-ignore
    window.XLSX.writeFile(wb, fileName);
  }
}

export const exportService = new ExportService();
