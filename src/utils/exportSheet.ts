import { CommuneEntry, SheetMetadata, calculateDistrictTotal } from '../types/sheet';

/**
 * Triggers clean printing of ONLY the official document sheet element
 */
export const printSheetContentOnly = (elementId: string = 'official-document-sheet') => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Remove any previously created print iframe
  const existingFrame = document.getElementById('print-sheet-iframe');
  if (existingFrame) {
    existingFrame.remove();
  }

  // Create isolated hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.id = 'print-sheet-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    window.print();
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>លទ្ធផលពិនិត្យបញ្ជីឈ្មោះ និងចុះឈ្មោះបោះឆ្នោត - ស្រុកជើងព្រៃ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&family=Moul&family=Battambang:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 6mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Kantumruy Pro', -apple-system, sans-serif;
      background: #ffffff;
      color: #0f172a;
      font-size: 10px;
      line-height: 1.3;
    }
    .font-moul {
      font-family: 'Moul', cursive, serif !important;
    }
    .font-kantumruy {
      font-family: 'Kantumruy Pro', sans-serif !important;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
      font-size: 9px;
    }
    th, td {
      border: 1px solid #000;
      padding: 2.5px 3px;
      text-align: center;
    }
    th {
      font-weight: bold;
    }
    .bg-slate-100 { background-color: #f1f5f9 !important; }
    .bg-slate-200 { background-color: #e2e8f0 !important; }
    .bg-slate-300 { background-color: #cbd5e1 !important; }
    .bg-teal-50 { background-color: #f0fdfa !important; }
    .bg-teal-100 { background-color: #ccfbf1 !important; }
    .bg-teal-200 { background-color: #99f6e4 !important; }
    .bg-sky-50 { background-color: #f0f9ff !important; }
    .bg-sky-100 { background-color: #e0f2fe !important; }
    .bg-sky-200 { background-color: #bae6fd !important; }
    .bg-amber-50 { background-color: #fffbeb !important; }
    .bg-amber-100 { background-color: #fef3c7 !important; }
    .bg-amber-200 { background-color: #fde68a !important; }
    .bg-purple-50 { background-color: #faf5ff !important; }
    .bg-purple-100 { background-color: #f3e8ff !important; }
    .bg-purple-200 { background-color: #e9d5ff !important; }
    img { max-width: 100%; height: auto; }
    .signatures-section {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding: 0 40px;
    }
  </style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>`;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      iframe.remove();
    }, 3000);
  }, 500);
};

/**
 * Exports exclusively the Sheet content to a CSV file formatted for Excel (UTF-8 with BOM)
 */
export const exportSheetToCSV = (data: CommuneEntry[], metadata: SheetMetadata) => {
  const total = calculateDistrictTotal(data);

  const clean = (val: any) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[][] = [
    // Header rows
    ['គណបក្សប្រជាជនកម្ពុជា', '', '', '', 'ឯករាជ្យ សន្តិភាព សេរីភាព ប្រជាធិបតេយ្យ'],
    ['គណៈកម្មាធិការខេត្តកំពង់ចាម', '', '', '', 'អព្យាក្រឹត និងវឌ្ឍនភាពសង្គម'],
    ['គណៈកម្មាធិការស្រុកជើងព្រៃ'],
    [''],
    [metadata.reportTitleKh || 'លទ្ធផលនៃការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ឆ្នាំ ២០២៦'],
    [metadata.reportDateKh || ''],
    [''],
    // Table Header 1
    [
      'ល.រ',
      'ឃុំ',
      'ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៥ (សរុប)',
      'ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៥ (CPP)',
      'ចុះឈ្មោះបោះឆ្នោតថ្មី - ដើមគ្រា (សរុប)',
      'ចុះឈ្មោះបោះឆ្នោតថ្មី - ដើមគ្រា (CPP)',
      'ចុះឈ្មោះបោះឆ្នោតថ្មី - ក្នុងគ្រា (សរុប)',
      'ចុះឈ្មោះបោះឆ្នោតថ្មី - ក្នុងគ្រា (CPP)',
      'ចុះឈ្មោះបោះឆ្នោតថ្មី - បូកយោង (សរុប)',
      'ចុះឈ្មោះបោះឆ្នោតថ្មី - បូកយោង (CPP)',
      'លុបឈ្មោះចេញពីបញ្ជី - ដើមគ្រា (សរុប)',
      'លុបឈ្មោះចេញពីបញ្ជី - ដើមគ្រា (CPP)',
      'លុបឈ្មោះចេញពីបញ្ជី - ក្នុងគ្រា (សរុប)',
      'លុបឈ្មោះចេញពីបញ្ជី - ក្នុងគ្រា (CPP)',
      'លុបឈ្មោះចេញពីបញ្ជី - បូកយោង (សរុប)',
      'លុបឈ្មោះចេញពីបញ្ជី - បូកយោង (CPP)',
      'កែទិន្នន័យជីវប្រវត្តិ - ដើមគ្រា (សរុប)',
      'កែទិន្នន័យជីវប្រវត្តិ - ដើមគ្រា (CPP)',
      'កែទិន្នន័យជីវប្រវត្តិ - ក្នុងគ្រា (សរុប)',
      'កែទិន្នន័យជីវប្រវត្តិ - ក្នុងគ្រា (CPP)',
      'កែទិន្នន័យជីវប្រវត្តិ - បូកយោង (សរុប)',
      'កែទិន្នន័យជីវប្រវត្តិ - បូកយោង (CPP)',
      'បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ - ដើមគ្រា (សរុប)',
      'បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ - ដើមគ្រា (CPP)',
      'បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ - ក្នុងគ្រា (សរុប)',
      'បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ - ក្នុងគ្រា (CPP)',
      'បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ - បូកយោង (សរុប)',
      'បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ - បូកយោង (CPP)',
      'ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៦ (សរុប)',
      'ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៦ (CPP)',
    ],
  ];

  // 10 Commune Data Rows
  data.forEach((c) => {
    rows.push([
      c.communeNumberKh,
      c.communeName,
      String(c.list2025Total),
      String(c.list2025Cpp),
      String(c.newRegStartTotal),
      String(c.newRegStartCpp),
      String(c.newRegCurrentTotal),
      String(c.newRegCurrentCpp),
      String(c.newRegCumulativeTotal),
      String(c.newRegCumulativeCpp),
      String(c.deletedStartTotal),
      String(c.deletedStartCpp),
      String(c.deletedCurrentTotal),
      String(c.deletedCurrentCpp),
      String(c.deletedCumulativeTotal),
      String(c.deletedCumulativeCpp),
      String(c.bioCorrectionStartTotal),
      String(c.bioCorrectionStartCpp),
      String(c.bioCorrectionCurrentTotal),
      String(c.bioCorrectionCurrentCpp),
      String(c.bioCorrectionCumulativeTotal),
      String(c.bioCorrectionCumulativeCpp),
      String(c.biometricStartTotal),
      String(c.biometricStartCpp),
      String(c.biometricCurrentTotal),
      String(c.biometricCurrentCpp),
      String(c.biometricCumulativeTotal),
      String(c.biometricCumulativeCpp),
      String(c.list2026Total),
      String(c.list2026Cpp),
    ]);
  });

  // District Total Row
  rows.push([
    '',
    'សរុបស្រុកជើងព្រៃ',
    String(total.list2025Total),
    String(total.list2025Cpp),
    String(total.newRegStartTotal),
    String(total.newRegStartCpp),
    String(total.newRegCurrentTotal),
    String(total.newRegCurrentCpp),
    String(total.newRegCumulativeTotal),
    String(total.newRegCumulativeCpp),
    String(total.deletedStartTotal),
    String(total.deletedStartCpp),
    String(total.deletedCurrentTotal),
    String(total.deletedCurrentCpp),
    String(total.deletedCumulativeTotal),
    String(total.deletedCumulativeCpp),
    String(total.bioCorrectionStartTotal),
    String(total.bioCorrectionStartCpp),
    String(total.bioCorrectionCurrentTotal),
    String(total.bioCorrectionCurrentCpp),
    String(total.bioCorrectionCumulativeTotal),
    String(total.bioCorrectionCumulativeCpp),
    String(total.biometricStartTotal),
    String(total.biometricStartCpp),
    String(total.biometricCurrentTotal),
    String(total.biometricCurrentCpp),
    String(total.biometricCumulativeTotal),
    String(total.biometricCumulativeCpp),
    String(total.list2026Total),
    String(total.list2026Cpp),
  ]);

  // Signatures
  rows.push(['']);
  rows.push([
    'បានឃើញ និងឯកភាព (ជ.គណៈអចិន្ត្រៃយ៍ អនុប្រធានប្រចាំការ)',
    '',
    '',
    '',
    metadata.signerRightDateLocation || 'ជើងព្រៃ',
  ]);
  rows.push(['', '', '', '', 'អ្នកធ្វើតារាង']);
  rows.push([metadata.signerLeftName || 'ឆាយ វ៉ាន់ស៊ី', '', '', '', metadata.signerRightName || 'ស៊ីម ល័ក្ខ']);

  // Convert to CSV with UTF-8 BOM
  const csvContent =
    '\uFEFF' +
    rows.map((row) => row.map((cell) => clean(cell)).join(',')).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = (metadata.reportDateKh || 'Report').replace(/[/\\?%*:|"<>]/g, '_');
  link.setAttribute('download', `តារាងស្រុកជើងព្រៃ_${cleanName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports exclusively the Sheet content to a standalone HTML file
 */
export const exportSheetToStandaloneHTML = (elementId: string = 'official-document-sheet') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const fullHtml = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>លទ្ធផលពិនិត្យបញ្ជីឈ្មោះ និងចុះឈ្មោះបោះឆ្នោត - ស្រុកជើងព្រៃ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&family=Moul&family=Battambang:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 6mm;
    }
    * { box-sizing: border-box; }
    body {
      margin: 20px auto;
      max-width: 1400px;
      font-family: 'Kantumruy Pro', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 20px;
    }
    .sheet-card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
    .font-moul { font-family: 'Moul', cursive, serif !important; }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #000;
      padding: 3px 4px;
      text-align: center;
    }
    th { font-weight: bold; }
    .bg-slate-100 { background-color: #f1f5f9; }
    .bg-slate-200 { background-color: #e2e8f0; }
    .bg-slate-300 { background-color: #cbd5e1; }
    .bg-teal-50 { background-color: #f0fdfa; }
    .bg-teal-100 { background-color: #ccfbf1; }
    .bg-teal-200 { background-color: #99f6e4; }
    .bg-sky-50 { background-color: #f0f9ff; }
    .bg-sky-100 { background-color: #e0f2fe; }
    .bg-sky-200 { background-color: #bae6fd; }
    .bg-amber-50 { background-color: #fffbeb; }
    .bg-amber-100 { background-color: #fef3c7; }
    .bg-amber-200 { background-color: #fde68a; }
    .bg-purple-50 { background-color: #faf5ff; }
    .bg-purple-100 { background-color: #f3e8ff; }
    .bg-purple-200 { background-color: #e9d5ff; }
    @media print {
      body { background: white; padding: 0; margin: 0; }
      .sheet-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet-card">
    ${element.innerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `សន្លឹករបាយការណ៍_ស្រុកជើងព្រៃ.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
