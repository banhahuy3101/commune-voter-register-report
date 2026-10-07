/**
 * Google Sheets API v4 Service
 * Creates and synchronizes official Cambodian commune voter registration templates
 */
import { CommuneEntry, SheetMetadata, calculateRowFormulas } from '../types/sheet';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface CreateSheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Creates an authentic, fully styled Google Spreadsheet matching the user's template
 */
export async function createCommuneSpreadsheet(
  accessToken: string,
  metadata: SheetMetadata,
  initialData: CommuneEntry[],
  customTitle?: string
): Promise<CreateSheetResponse> {
  const title =
    customTitle ||
    (metadata.reportDateKh
      ? `លទ្ធផលនៃការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ២០២៦ - ស្រុកជើងព្រៃ (${metadata.reportDateKh})`
      : `លទ្ធផលនៃការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ២០២៦ - ស្រុកជើងព្រៃ`);

  // 1. Create Spreadsheet
  const createRes = await fetch(SHEETS_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
        locale: 'en_US',
        defaultFormat: {
          textFormat: {
            fontFamily: 'Kantumruy Pro',
            fontSize: 10,
          },
        },
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: 'ទិន្នន័យឃុំទាំង១០',
            gridProperties: {
              rowCount: 35,
              columnCount: 31,
              frozenRowCount: 9,
              frozenColumnCount: 2,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetId = sheetData.sheets?.[0]?.properties?.sheetId ?? 0;

  // 2. Build rows data (Values & Formulas)
  const rows: any[][] = [];

  // Row 1: Header Ministry & Slogan & CPP Logo
  const row1 = new Array(30).fill('');
  row1[0] = 'គណបក្សប្រជាជនកម្ពុជា';
  row1[12] = `=IMAGE("https://www.cpp.org.kh/wp-content/themes/cpptwentyseventeen/assets/images/cpp-logo.png", 1)`;
  row1[18] = 'ឯករាជ្យ សន្តិភាព សេរីភាព ប្រជាធិបតេយ្យ';
  rows.push(row1);

  // Row 2
  const row2 = new Array(30).fill('');
  row2[0] = 'គណៈកម្មាធិការខេត្តកំពង់ចាម';
  row2[18] = 'អព្យាក្រឹត និងវឌ្ឍនភាពសង្គម';
  rows.push(row2);

  // Row 3
  const row3 = new Array(30).fill('');
  row3[0] = 'គណៈកម្មាធិការស្រុកជើងព្រៃ';
  rows.push(row3);

  // Row 4: Empty space
  rows.push(new Array(30).fill(''));

  // Row 5: Main Report Title
  const row5 = new Array(30).fill('');
  row5[0] = 'លទ្ធផលនៃការពិនិត្យបញ្ជីឈ្មោះ និងការចុះឈ្មោះបោះឆ្នោត ឆ្នាំ ២០២៦';
  rows.push(row5);

  // Row 6: Report Subtitle / Date
  const row6 = new Array(30).fill('');
  row6[6] = metadata.reportDateKh || 'ប្រចាំថ្ងៃទី ៧ ខែ តុលា ឆ្នាំ ២០២៦';
  rows.push(row6);

  // Row 7: Header Level 1
  const row7 = new Array(30).fill('');
  row7[0] = 'ល.រ';
  row7[1] = 'ឃុំ';
  row7[2] = 'ចំនួនក្នុងបញ្ជីឆ្នាំ២០២៥';
  row7[4] = 'ចុះឈ្មោះបោះឆ្នោតថ្មី';
  row7[10] = 'លុបឈ្មោះចេញពីបញ្ជី';
  row7[16] = 'កែទិន្ន័យជីវប្រវត្តិ';
  row7[22] = 'បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ';
  row7[28] = 'ចំនួនក្នុងបញ្ជី ឆ្នាំ២០២៦';
  rows.push(row7);

  // Row 8: Header Level 2 (Subsections)
  const row8 = new Array(30).fill('');
  row8[4] = 'ដើមគ្រា';
  row8[6] = 'ក្នុងគ្រា';
  row8[8] = 'បូកយោង';
  row8[10] = 'ដើមគ្រា';
  row8[12] = 'ក្នុងគ្រា';
  row8[14] = 'បូកយោង';
  row8[16] = 'ដើមគ្រា';
  row8[18] = 'ក្នុងគ្រា';
  row8[20] = 'បូកយោង';
  row8[22] = 'ដើមគ្រា';
  row8[24] = 'ក្នុងគ្រា';
  row8[26] = 'បូកយោង';
  rows.push(row8);

  // Row 9: Header Level 3 (Columns: សរុប / CPP)
  const row9 = new Array(30).fill('');
  row9[0] = '';
  row9[1] = '';
  for (let c = 2; c < 30; c += 2) {
    row9[c] = 'សរុប';
    row9[c + 1] = 'CPP';
  }
  rows.push(row9);

  // Rows 10 to 19: 10 Communes
  initialData.forEach((entry, idx) => {
    const r = 10 + idx; // 1-based index in Excel/Sheets formulas
    const rData = new Array(30).fill(0);
    rData[0] = entry.communeNumberKh;
    rData[1] = entry.communeName;
    rData[2] = entry.list2025Total;
    rData[3] = entry.list2025Cpp;

    // ចុះឈ្មោះថ្មី
    rData[4] = entry.newRegStartTotal;
    rData[5] = entry.newRegStartCpp;
    rData[6] = entry.newRegCurrentTotal;
    rData[7] = entry.newRegCurrentCpp;
    rData[8] = `=E${r}+G${r}`; // បូកយោង សរុប
    rData[9] = `=F${r}+H${r}`; // បូកយោង CPP

    // លុបឈ្មោះ
    rData[10] = entry.deletedStartTotal;
    rData[11] = entry.deletedStartCpp;
    rData[12] = entry.deletedCurrentTotal;
    rData[13] = entry.deletedCurrentCpp;
    rData[14] = `=K${r}+M${r}`; // បូកយោង សរុប
    rData[15] = `=L${r}+N${r}`; // បូកយោង CPP

    // កែទិន្នន័យ
    rData[16] = entry.bioCorrectionStartTotal;
    rData[17] = entry.bioCorrectionStartCpp;
    rData[18] = entry.bioCorrectionCurrentTotal;
    rData[19] = entry.bioCorrectionCurrentCpp;
    rData[20] = `=Q${r}+S${r}`;
    rData[21] = `=R${r}+T${r}`;

    // ជីវមាត្រ
    rData[22] = entry.biometricStartTotal;
    rData[23] = entry.biometricStartCpp;
    rData[24] = entry.biometricCurrentTotal;
    rData[25] = entry.biometricCurrentCpp;
    rData[26] = `=W${r}+Y${r}`;
    rData[27] = `=X${r}+Z${r}`;

    // ២០២៦ សរុប = ២០២៥ + ចុះថ្មី(បូកយោង) - លុប(បូកយោង)
    rData[28] = `=C${r}+I${r}-O${r}`;
    rData[29] = `=D${r}+J${r}-P${r}`;

    rows.push(rData);
  });

  // Row 20: សរុប Summary Row
  const totalRow = new Array(30).fill('');
  totalRow[0] = '';
  totalRow[1] = 'សរុប';
  const cols = [
    'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'AA', 'AB', 'AC', 'AD'
  ];
  cols.forEach((colLetter, cIdx) => {
    totalRow[2 + cIdx] = `=SUM(${colLetter}10:${colLetter}19)`;
  });
  rows.push(totalRow);

  // Blank row
  rows.push(new Array(30).fill(''));

  // Signatures
  const sigRow1 = new Array(30).fill('');
  sigRow1[1] = 'បានឃើញ និងឯកភាព';
  sigRow1[24] = metadata.signerRightDateLocation || 'ជើងព្រៃ ថ្ងៃទី ០៧ ខែតុលា ឆ្នាំ២០២៦';
  rows.push(sigRow1);

  const sigRow2 = new Array(30).fill('');
  sigRow2[1] = 'ជ.គណៈអចិន្ត្រៃយ៍';
  sigRow2[24] = 'អ្នកធ្វើតារាង';
  rows.push(sigRow2);

  const sigRow3 = new Array(30).fill('');
  sigRow3[1] = 'អនុប្រធានប្រចាំការ';
  rows.push(sigRow3);

  // Spacing for stamps / signatures
  rows.push(new Array(30).fill(''));
  rows.push(new Array(30).fill(''));
  rows.push(new Array(30).fill(''));

  const sigRowNames = new Array(30).fill('');
  sigRowNames[1] = metadata.signerLeftName || 'ឆាយ វ៉ាន់ស៊ី';
  sigRowNames[24] = metadata.signerRightName || 'ស៊ីម ល័ក្ខ';
  rows.push(sigRowNames);

  // Write all values into Google Sheets
  await fetch(`${SHEETS_API}/${spreadsheetId}/values/ទិន្នន័យឃុំទាំង១០!A1:AD32?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'ទិន្នន័យឃុំទាំង១០!A1:AD32',
      majorDimension: 'ROWS',
      values: rows,
    }),
  });

  // 3. Format and Style Google Sheet to match official image:
  // Merged headers, background fills, borders, text alignment, font styling
  const requests: any[] = [
    // Merge Ministry / Slogan
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 18, endColumnIndex: 30 },
        mergeType: 'MERGE_ALL',
      },
    },
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 18, endColumnIndex: 30 },
        mergeType: 'MERGE_ALL',
      },
    },
    // Main Title: merge A5 to AD5
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 30 },
        mergeType: 'MERGE_ALL',
      },
    },
    // Sub Title: merge G6 to V6
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 5, endRowIndex: 6, startColumnIndex: 6, endColumnIndex: 24 },
        mergeType: 'MERGE_ALL',
      },
    },
    // Merge Header Cells
    // Col 0: ល.រ (Row 6 to 9)
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 1 },
        mergeType: 'MERGE_ALL',
      },
    },
    // Col 1: ឃុំ (Row 6 to 9)
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 1, endColumnIndex: 2 },
        mergeType: 'MERGE_ALL',
      },
    },
    // 2025 List: C7 to D8
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 8, startColumnIndex: 2, endColumnIndex: 4 },
        mergeType: 'MERGE_ALL',
      },
    },
    // 2026 List: AC7 to AD8
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 8, startColumnIndex: 28, endColumnIndex: 30 },
        mergeType: 'MERGE_ALL',
      },
    },
    // Category 1: ចុះឈ្មោះបោះឆ្នោតថ្មី (E7 to J7)
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 4, endColumnIndex: 10 },
        mergeType: 'MERGE_ALL',
      },
    },
    // Category 2: លុបឈ្មោះចេញពីបញ្ជី (K7 to P7)
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 10, endColumnIndex: 16 },
        mergeType: 'MERGE_ALL',
      },
    },
    // Category 3: កែទិន្ន័យជីវប្រវត្តិ (Q7 to V7)
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 16, endColumnIndex: 22 },
        mergeType: 'MERGE_ALL',
      },
    },
    // Category 4: បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ (W7 to AB7)
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 22, endColumnIndex: 28 },
        mergeType: 'MERGE_ALL',
      },
    },
  ];

  // Merge subheaders in Row 8 for each 2 columns
  for (let c = 4; c < 28; c += 2) {
    requests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: 7, endRowIndex: 8, startColumnIndex: c, endColumnIndex: c + 2 },
        mergeType: 'MERGE_ALL',
      },
    });
  }

  // Format Main Title
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 30 },
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          textFormat: { bold: true, fontSize: 14, fontFamily: 'Kantumruy Pro' },
        },
      },
      fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)',
    },
  });

  // Format Subtitle
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 5, endRowIndex: 6, startColumnIndex: 0, endColumnIndex: 30 },
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          textFormat: { bold: true, fontSize: 11, italic: false, fontFamily: 'Kantumruy Pro' },
        },
      },
      fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)',
    },
  });

  // Table Borders (A7 to AD20)
  requests.push({
    updateBorders: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 20, startColumnIndex: 0, endColumnIndex: 30 },
      top: { style: 'SOLID', width: 1, color: { red: 0.2, green: 0.2, blue: 0.2 } },
      bottom: { style: 'SOLID', width: 1, color: { red: 0.2, green: 0.2, blue: 0.2 } },
      left: { style: 'SOLID', width: 1, color: { red: 0.2, green: 0.2, blue: 0.2 } },
      right: { style: 'SOLID', width: 1, color: { red: 0.2, green: 0.2, blue: 0.2 } },
      innerHorizontal: { style: 'SOLID', width: 1, color: { red: 0.6, green: 0.6, blue: 0.6 } },
      innerVertical: { style: 'SOLID', width: 1, color: { red: 0.6, green: 0.6, blue: 0.6 } },
    },
  });

  // Table Header Background Colors (matching the photo)
  // Base headers: Row 6 to 9
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 30 },
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          wrapStrategy: 'WRAP',
          textFormat: { bold: true, fontSize: 10, fontFamily: 'Kantumruy Pro' },
        },
      },
      fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)',
    },
  });

  // Color Section 2025: Col 2-4 (Soft Gray-Blue)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 2, endColumnIndex: 4 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.88, green: 0.91, blue: 0.94 },
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Color Section New Reg: Col 4-10 (Pale Mint/Teal)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 4, endColumnIndex: 10 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.85, green: 0.92, blue: 0.92 },
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Color Section Deleted: Col 10-16 (Pale Sky Blue)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 10, endColumnIndex: 16 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.85, green: 0.89, blue: 0.95 },
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Color Section Bio Correction: Col 16-22 (Pale Amber/Warm)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 16, endColumnIndex: 22 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.94, green: 0.92, blue: 0.88 },
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Color Section Biometric: Col 22-28 (Pale Lavender/Violet)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 22, endColumnIndex: 28 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.90, green: 0.88, blue: 0.94 },
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Color Section 2026: Col 28-30 (Light Slate)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 28, endColumnIndex: 30 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.88, green: 0.91, blue: 0.94 },
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Format Numeric Cells: C10 to AD20 with thousand separator `#,##0` and right/center alignment
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 9, endRowIndex: 20, startColumnIndex: 2, endColumnIndex: 30 },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'NUMBER', pattern: '#,##0' },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
    },
  });

  // Format Summary Row (Row 20, 0-indexed 19)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 19, endRowIndex: 20, startColumnIndex: 0, endColumnIndex: 30 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.98, green: 0.97, blue: 0.92 },
          textFormat: { bold: true, fontSize: 10, fontFamily: 'Kantumruy Pro' },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // Adjust Column Widths
  // Col 0: No. (45px)
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 45 },
      fields: 'pixelSize',
    },
  });
  // Col 1: Commune name (110px)
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
      properties: { pixelSize: 110 },
      fields: 'pixelSize',
    },
  });
  // Data columns: 2 to 30 (55px each)
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 30 },
      properties: { pixelSize: 56 },
      fields: 'pixelSize',
    },
  });

  // Send batch styling update
  await fetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Sync entire commune data back to Google Sheet
 */
export async function syncSpreadsheetData(
  accessToken: string,
  spreadsheetId: string,
  data: CommuneEntry[]
): Promise<void> {
  const rows: any[][] = [];

  data.forEach((entry, idx) => {
    const r = 10 + idx;
    const rData = new Array(30).fill(0);
    rData[0] = entry.communeNumberKh;
    rData[1] = entry.communeName;
    rData[2] = entry.list2025Total;
    rData[3] = entry.list2025Cpp;

    rData[4] = entry.newRegStartTotal;
    rData[5] = entry.newRegStartCpp;
    rData[6] = entry.newRegCurrentTotal;
    rData[7] = entry.newRegCurrentCpp;
    rData[8] = `=E${r}+G${r}`;
    rData[9] = `=F${r}+H${r}`;

    rData[10] = entry.deletedStartTotal;
    rData[11] = entry.deletedStartCpp;
    rData[12] = entry.deletedCurrentTotal;
    rData[13] = entry.deletedCurrentCpp;
    rData[14] = `=K${r}+M${r}`;
    rData[15] = `=L${r}+N${r}`;

    rData[16] = entry.bioCorrectionStartTotal;
    rData[17] = entry.bioCorrectionStartCpp;
    rData[18] = entry.bioCorrectionCurrentTotal;
    rData[19] = entry.bioCorrectionCurrentCpp;
    rData[20] = `=Q${r}+S${r}`;
    rData[21] = `=R${r}+T${r}`;

    rData[22] = entry.biometricStartTotal;
    rData[23] = entry.biometricStartCpp;
    rData[24] = entry.biometricCurrentTotal;
    rData[25] = entry.biometricCurrentCpp;
    rData[26] = `=W${r}+Y${r}`;
    rData[27] = `=X${r}+Z${r}`;

    rData[28] = `=C${r}+I${r}-O${r}`;
    rData[29] = `=D${r}+J${r}-P${r}`;

    rows.push(rData);
  });

  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/ទិន្នន័យឃុំទាំង១០!A10:AD19?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'ទិន្នន័យឃុំទាំង១០!A10:AD19',
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to sync spreadsheet: ${errorText}`);
  }
}

/**
 * Fetch latest cell values directly from Google Sheet
 */
export async function fetchSpreadsheetData(
  accessToken: string,
  spreadsheetId: string
): Promise<CommuneEntry[]> {
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/ទិន្នន័យឃុំទាំង១០!A10:AD19?valueRenderOption=UNFORMATTED_VALUE`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to read from Google Sheet: ${err}`);
  }

  const json = await res.json();
  const rawRows: any[][] = json.values || [];

  return rawRows.map((r, idx) => {
    const parseNum = (val: any) => {
      if (val === undefined || val === null || val === '') return 0;
      const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
      return isNaN(n) ? 0 : n;
    };

    const entry: CommuneEntry = {
      id: idx + 1,
      communeNumberKh: String(r[0] || idx + 1),
      communeName: String(r[1] || `ឃុំទី${idx + 1}`),
      list2025Total: parseNum(r[2]),
      list2025Cpp: parseNum(r[3]),

      newRegStartTotal: parseNum(r[4]),
      newRegStartCpp: parseNum(r[5]),
      newRegCurrentTotal: parseNum(r[6]),
      newRegCurrentCpp: parseNum(r[7]),
      newRegCumulativeTotal: parseNum(r[8]),
      newRegCumulativeCpp: parseNum(r[9]),

      deletedStartTotal: parseNum(r[10]),
      deletedStartCpp: parseNum(r[11]),
      deletedCurrentTotal: parseNum(r[12]),
      deletedCurrentCpp: parseNum(r[13]),
      deletedCumulativeTotal: parseNum(r[14]),
      deletedCumulativeCpp: parseNum(r[15]),

      bioCorrectionStartTotal: parseNum(r[16]),
      bioCorrectionStartCpp: parseNum(r[17]),
      bioCorrectionCurrentTotal: parseNum(r[18]),
      bioCorrectionCurrentCpp: parseNum(r[19]),
      bioCorrectionCumulativeTotal: parseNum(r[20]),
      bioCorrectionCumulativeCpp: parseNum(r[21]),

      biometricStartTotal: parseNum(r[22]),
      biometricStartCpp: parseNum(r[23]),
      biometricCurrentTotal: parseNum(r[24]),
      biometricCurrentCpp: parseNum(r[25]),
      biometricCumulativeTotal: parseNum(r[26]),
      biometricCumulativeCpp: parseNum(r[27]),

      list2026Total: parseNum(r[28]),
      list2026Cpp: parseNum(r[29]),
    };

    return calculateRowFormulas(entry);
  });
}
