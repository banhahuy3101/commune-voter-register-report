import { CommuneEntry, SheetMetadata, calculateDistrictTotal } from '../types/sheet';

/**
 * Triggers native clean browser print preview with document title matching report title and date
 */
export const printSheetContentOnly = (metadata?: SheetMetadata) => {
  const originalTitle = document.title;
  if (metadata) {
    const titleParts = [
      metadata.reportTitleKh || 'លទ្ធផលនៃការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ឆ្នាំ ២០២៦',
      metadata.reportDateKh || '',
    ].filter(Boolean);
    document.title = titleParts.join(' - ');
  }

  // Allow browser time to register title change before calling print
  setTimeout(() => {
    window.print();
    // Restore original document title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  }, 100);
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
 * Exports exclusively the Sheet content to a standalone HTML file with Tailwind CSS
 */
export const exportSheetToStandaloneHTML = (
  elementId: string = 'official-document-sheet',
  metadata?: SheetMetadata
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const docTitle = metadata
    ? [metadata.reportTitleKh || 'លទ្ធផលនៃការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត', metadata.reportDateKh || '']
        .filter(Boolean)
        .join(' - ')
    : 'លទ្ធផលពិនិត្យបញ្ជីឈ្មោះ និងចុះឈ្មោះបោះឆ្នោត - ស្រុកជើងព្រៃ';

  const fullHtml = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>${docTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&family=Moul&family=Battambang:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 6mm;
    }
    body {
      font-family: 'Kantumruy Pro', -apple-system, sans-serif;
      background: #ffffff !important;
      color: #0f172a;
      padding: 16px;
      margin: 0;
    }
    .font-moul {
      font-family: 'Moul', cursive, serif !important;
    }
    .font-kantumruy {
      font-family: 'Kantumruy Pro', sans-serif !important;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .sheet-container {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
        background: #ffffff !important;
      }
      table {
        font-size: 7.5pt !important;
        background: #ffffff !important;
      }
      th, td {
        padding: 1.5px 1px !important;
      }
    }
  </style>
</head>
<body class="bg-white">
  <div class="sheet-container max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-none border border-slate-200">
    ${element.innerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = (metadata?.reportDateKh || 'Report').replace(/[/\\?%*:|"<>]/g, '_');
  link.setAttribute('download', `${metadata?.reportTitleKh || 'សន្លឹករបាយការណ៍'}_${cleanName}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
