import React from 'react';
import {
  CommuneEntry,
  SheetMetadata,
  calculateDistrictTotal,
  formatKhmerNumber,
} from '../types/sheet';

interface OfficialDocumentSheetProps {
  data: CommuneEntry[];
  metadata: SheetMetadata;
  id?: string;
  className?: string;
}

export const OfficialDocumentSheet: React.FC<OfficialDocumentSheetProps> = ({
  data,
  metadata,
  id = 'official-document-sheet',
  className = '',
}) => {
  const districtTotal = calculateDistrictTotal(data);

  return (
    <div
      id={id}
      className={`bg-white p-6 md:p-10 rounded-xl shadow-lg border border-slate-200 max-w-7xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0 text-slate-900 font-kantumruy ${className}`}
    >
      {/* Document Header */}
      <div className="flex justify-between items-start mb-6">
        {/* Top-Left Letterhead */}
        <div className="text-center font-moul space-y-1">
          <div className="text-sm md:text-base font-bold text-slate-900">គណបក្សប្រជាជនកម្ពុជា</div>
          <div className="text-xs md:text-sm font-bold text-slate-800">គណៈកម្មាធិការខេត្តកំពង់ចាម</div>
          <div className="text-xs md:text-sm font-bold text-slate-800">គណៈកម្មាធិការស្រុកជើងព្រៃ</div>
        </div>

        {/* CPP Official Logo */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            <img
              src={metadata.logoUrl || "/cpp-logo.png"}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://www.cpp.org.kh/wp-content/themes/cpptwentyseventeen/assets/images/cpp-logo.png";
              }}
              alt="CPP Official Logo"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
        </div>

        {/* Top-Right Motto */}
        <div className="text-center font-moul space-y-1">
          <div className="text-xs md:text-sm font-bold text-slate-900">
            ឯករាជ្យ សន្តិភាព សេរីភាព ប្រជាធិបតេយ្យ
          </div>
          <div className="text-xs md:text-sm font-bold text-slate-800">
            អព្យាក្រឹត និងវឌ្ឍនភាពសង្គម
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center my-6 space-y-2">
        <h2 className="text-base md:text-lg lg:text-xl font-bold font-moul text-slate-950">
          {metadata.reportTitleKh}
        </h2>
        <div className="text-xs md:text-sm font-semibold text-slate-800">
          {metadata.reportDateKh}
        </div>
      </div>

      {/* The Exact Table Layout */}
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full border-collapse border border-slate-900 text-[10px] md:text-xs">
          <thead>
            {/* Row 1 */}
            <tr className="bg-slate-100 font-bold text-center border-b border-slate-900">
              <th rowSpan={3} className="p-1 border border-slate-900 min-w-[32px]">
                ល.រ
              </th>
              <th rowSpan={3} className="p-1 border border-slate-900 min-w-[95px]">
                ឃុំ
              </th>
              <th colSpan={2} rowSpan={2} className="p-1 border border-slate-900 bg-slate-200">
                ចំនួនក្នុង <br /> បញ្ជីឆ្នាំ២០២៥
              </th>
              <th colSpan={6} className="p-1 border border-slate-900 bg-teal-100">
                ចុះឈ្មោះបោះឆ្នោតថ្មី
              </th>
              <th colSpan={6} className="p-1 border border-slate-900 bg-sky-100">
                លុបឈ្មោះចេញពីបញ្ជី
              </th>
              <th colSpan={6} className="p-1 border border-slate-900 bg-amber-100">
                កែទិន្ន័យជីវប្រវត្តិ
              </th>
              <th colSpan={6} className="p-1 border border-slate-900 bg-purple-100">
                បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ
              </th>
              <th colSpan={2} rowSpan={2} className="p-1 border border-slate-900 bg-slate-200">
                ចំនួនក្នុងបញ្ជី <br /> ឆ្នាំ២០២៦
              </th>
            </tr>

            {/* Row 2 */}
            <tr className="font-semibold text-center border-b border-slate-900">
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-teal-50">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-teal-50">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-teal-100">
                បូកយោង
              </th>

              <th colSpan={2} className="p-0.5 border border-slate-900 bg-sky-50">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-sky-50">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-sky-100">
                បូកយោង
              </th>

              <th colSpan={2} className="p-0.5 border border-slate-900 bg-amber-50">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-amber-50">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-amber-100">
                បូកយោង
              </th>

              <th colSpan={2} className="p-0.5 border border-slate-900 bg-purple-50">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-purple-50">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-purple-100">
                បូកយោង
              </th>
            </tr>

            {/* Row 3 */}
            <tr className="font-bold text-center border-b border-slate-900 bg-slate-50 text-[9px] md:text-[10px]">
              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>

              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>
              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-teal-100/70">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-teal-100/70">CPP</th>

              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>
              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-sky-100/70">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-sky-100/70">CPP</th>

              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>
              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-amber-100/70">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-amber-100/70">CPP</th>

              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>
              <th className="p-0.5 border border-slate-900">សរុប</th>
              <th className="p-0.5 border border-slate-900">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-purple-100/70">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-purple-100/70">CPP</th>

              <th className="p-0.5 border border-slate-900 bg-slate-200/70">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-slate-200/70">CPP</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="text-center">
                <td className="p-1 border border-slate-900 font-semibold">{row.communeNumberKh}</td>
                <td className="p-1 border border-slate-900 font-semibold text-left whitespace-nowrap pl-2">
                  {row.communeName}
                </td>

                {/* 2025 List */}
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.list2025Total)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.list2025Cpp)}
                </td>

                {/* ចុះឈ្មោះថ្មី */}
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.newRegStartTotal)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.newRegStartCpp)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.newRegCurrentTotal)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.newRegCurrentCpp)}
                </td>
                <td className="p-1 border border-slate-900 font-semibold bg-teal-50">
                  {formatKhmerNumber(row.newRegCumulativeTotal)}
                </td>
                <td className="p-1 border border-slate-900 font-semibold bg-teal-50">
                  {formatKhmerNumber(row.newRegCumulativeCpp)}
                </td>

                {/* លុបឈ្មោះ */}
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.deletedStartTotal)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.deletedStartCpp)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.deletedCurrentTotal)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.deletedCurrentCpp)}
                </td>
                <td className="p-1 border border-slate-900 font-semibold bg-sky-50">
                  {formatKhmerNumber(row.deletedCumulativeTotal)}
                </td>
                <td className="p-1 border border-slate-900 font-semibold bg-sky-50">
                  {formatKhmerNumber(row.deletedCumulativeCpp)}
                </td>

                {/* កែទិន្នន័យ */}
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.bioCorrectionStartTotal)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.bioCorrectionStartCpp)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.bioCorrectionCurrentTotal)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.bioCorrectionCurrentCpp)}
                </td>
                <td className="p-1 border border-slate-900 font-semibold bg-amber-50">
                  {formatKhmerNumber(row.bioCorrectionCumulativeTotal)}
                </td>
                <td className="p-1 border border-slate-900 font-semibold bg-amber-50">
                  {formatKhmerNumber(row.bioCorrectionCumulativeCpp)}
                </td>

                {/* ជីវមាត្រ */}
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.biometricStartTotal)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.biometricStartCpp)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.biometricCurrentTotal)}
                </td>
                <td className="p-1 border border-slate-900">
                  {formatKhmerNumber(row.biometricCurrentCpp)}
                </td>
                <td className="p-1 border border-slate-900 font-semibold bg-purple-50">
                  {formatKhmerNumber(row.biometricCumulativeTotal)}
                </td>
                <td className="p-1 border border-slate-900 font-semibold bg-purple-50">
                  {formatKhmerNumber(row.biometricCumulativeCpp)}
                </td>

                {/* 2026 List */}
                <td className="p-1 border border-slate-900 font-bold bg-slate-100">
                  {formatKhmerNumber(row.list2026Total)}
                </td>
                <td className="p-1 border border-slate-900 font-bold bg-slate-100 text-blue-900">
                  {formatKhmerNumber(row.list2026Cpp)}
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="text-center font-bold bg-slate-200 border-t-2 border-slate-900 text-slate-950">
              <td colSpan={2} className="p-1.5 border border-slate-900 text-center font-moul text-xs">
                សរុបស្រុកជើងព្រៃ
              </td>

              {/* 2025 Total */}
              <td className="p-1 border border-slate-900 bg-slate-300">
                {formatKhmerNumber(districtTotal.list2025Total)}
              </td>
              <td className="p-1 border border-slate-900 bg-slate-300">
                {formatKhmerNumber(districtTotal.list2025Cpp)}
              </td>

              {/* ចុះឈ្មោះថ្មី */}
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.newRegStartTotal)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.newRegStartCpp)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.newRegCurrentTotal)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.newRegCurrentCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-teal-200">
                {formatKhmerNumber(districtTotal.newRegCumulativeTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-teal-200">
                {formatKhmerNumber(districtTotal.newRegCumulativeCpp)}
              </td>

              {/* លុបឈ្មោះ */}
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.deletedStartTotal)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.deletedStartCpp)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.deletedCurrentTotal)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.deletedCurrentCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-sky-200">
                {formatKhmerNumber(districtTotal.deletedCumulativeTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-sky-200">
                {formatKhmerNumber(districtTotal.deletedCumulativeCpp)}
              </td>

              {/* កែទិន្នន័យ */}
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.bioCorrectionStartTotal)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.bioCorrectionStartCpp)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.bioCorrectionCurrentTotal)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.bioCorrectionCurrentCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-amber-200">
                {formatKhmerNumber(districtTotal.bioCorrectionCumulativeTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-amber-200">
                {formatKhmerNumber(districtTotal.bioCorrectionCumulativeCpp)}
              </td>

              {/* ជីវមាត្រ */}
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.biometricStartTotal)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.biometricStartCpp)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.biometricCurrentTotal)}
              </td>
              <td className="p-1 border border-slate-900">
                {formatKhmerNumber(districtTotal.biometricCurrentCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-purple-200">
                {formatKhmerNumber(districtTotal.biometricCumulativeTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-purple-200">
                {formatKhmerNumber(districtTotal.biometricCumulativeCpp)}
              </td>

              {/* 2026 */}
              <td className="p-1 border border-slate-900 bg-slate-300">
                {formatKhmerNumber(districtTotal.list2026Total)}
              </td>
              <td className="p-1 border border-slate-900 bg-slate-300">
                {formatKhmerNumber(districtTotal.list2026Cpp)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures & Seal Section (Matching Official Document) */}
      <div className="flex justify-between items-start mt-10 px-4 md:px-12 text-center text-xs md:text-sm">
        {/* Left Signer */}
        <div className="space-y-1 font-moul w-64">
          <div className="text-slate-900">បានឃើញ និងឯកភាព</div>
          <div className="text-slate-900">ជ.គណៈអចិន្ត្រៃយ៍</div>
          <div className="text-slate-900">អនុប្រធានប្រចាំការ</div>

          {/* Circular Red Official Stamp */}
          <div className="py-4 relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-red-600 border-dashed flex flex-col items-center justify-center text-red-600 font-bold p-1 bg-red-50/20 rotate-[-8deg] shadow-xs">
              <div className="text-[9px] font-moul">គណៈកម្មាធិការស្រុក</div>
              <div className="text-[14px]">★</div>
              <div className="text-[8px] font-moul">ជើងព្រៃ</div>
            </div>
          </div>

          <div className="text-slate-950 font-bold text-sm tracking-wide mt-2">
            {metadata.signerLeftName || 'ឆាយ វ៉ាន់ស៊ី'}
          </div>
        </div>

        {/* Right Signer */}
        <div className="space-y-1 font-moul w-64">
          <div className="text-slate-800 text-xs font-semibold">
            {metadata.signerRightDateLocation || 'ជើងព្រៃ ថ្ងៃទី ៧ ខែតុលា ឆ្នាំ២០២៦'}
          </div>
          <div className="text-slate-900">អ្នកធ្វើតារាង</div>

          {/* Stylized Ink Signature */}
          <div className="py-4 flex items-center justify-center">
            <svg viewBox="0 0 160 70" className="w-32 h-16 text-blue-700">
              <path
                d="M10 50 Q40 10 70 45 T110 30 Q130 15 150 40 Q90 65 30 55"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="115" cy="28" r="3" fill="currentColor" />
            </svg>
          </div>

          <div className="text-slate-950 font-bold text-sm tracking-wide mt-2">
            {metadata.signerRightName || 'ស៊ីម ល័ក្ខ'}
          </div>
        </div>
      </div>
    </div>
  );
};
