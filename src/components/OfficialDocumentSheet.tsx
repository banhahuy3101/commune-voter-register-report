import React from 'react';
import {
  CommuneEntry,
  SheetMetadata,
  calculateDistrictTotal,
  formatKhmerNumber,
} from '../types/sheet';
import {
  SIGNATURE_CHHAY_VANNSY_BASE64,
  SIGNATURE_SIM_LEAKH_BASE64,
} from '../constants/signatures';

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
          <thead className="font-moul font-normal text-slate-950">
            {/* Row 1 */}
            <tr className="bg-white text-center border-b border-slate-900 text-[8.5px] md:text-[10px] leading-snug">
              <th rowSpan={3} className="p-1 border border-slate-900 min-w-[32px] bg-white font-normal">
                ល.រ
              </th>
              <th rowSpan={3} className="p-1 border border-slate-900 min-w-[95px] bg-white font-normal">
                ឃុំ
              </th>
              <th colSpan={2} rowSpan={2} className="p-1 border border-slate-900 bg-white font-normal">
                ចំនួនក្នុង <br /> បញ្ជីឆ្នាំ២០២៥
              </th>
              <th colSpan={6} className="p-1 border border-slate-900 bg-teal-50 font-normal">
                ចុះឈ្មោះបោះឆ្នោតថ្មី
              </th>
              <th colSpan={6} className="p-1 border border-slate-900 bg-sky-50 font-normal">
                លុបឈ្មោះចេញពីបញ្ជី
              </th>
              <th colSpan={6} className="p-1 border border-slate-900 bg-amber-50 font-normal">
                កែទិន្ន័យជីវប្រវត្តិ
              </th>
              <th colSpan={6} className="p-1 border border-slate-900 bg-purple-50 font-normal">
                បច្ចុប្បន្នភាពទិន្នន័យជីវមាត្រ
              </th>
              <th colSpan={2} rowSpan={2} className="p-1 border border-slate-900 bg-white font-normal">
                ចំនួនក្នុងបញ្ជី <br /> ឆ្នាំ២០២៦
              </th>
            </tr>

            {/* Row 2 */}
            <tr className="text-center border-b border-slate-900 text-[8px] md:text-[9.5px] leading-snug">
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-teal-50 font-normal">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-teal-50 font-normal">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-teal-100 font-normal">
                បូកយោង
              </th>

              <th colSpan={2} className="p-0.5 border border-slate-900 bg-sky-50 font-normal">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-sky-50 font-normal">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-sky-100 font-normal">
                បូកយោង
              </th>

              <th colSpan={2} className="p-0.5 border border-slate-900 bg-amber-50 font-normal">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-amber-50 font-normal">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-amber-100 font-normal">
                បូកយោង
              </th>

              <th colSpan={2} className="p-0.5 border border-slate-900 bg-purple-50 font-normal">
                ដើមគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-purple-50 font-normal">
                ក្នុងគ្រា
              </th>
              <th colSpan={2} className="p-0.5 border border-slate-900 bg-purple-100 font-normal">
                បូកយោង
              </th>
            </tr>

            {/* Row 3 */}
            <tr className="text-center border-b border-slate-900 bg-white text-[7.5px] md:text-[8.5px] leading-tight">
              <th className="p-0.5 border border-slate-900 bg-white font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-white font-normal">CPP</th>

              <th className="p-0.5 border border-slate-900 bg-teal-50/50 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-teal-50/50 font-normal">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-teal-50/50 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-teal-50/50 font-normal">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-teal-100/60 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-teal-100/60 font-normal">CPP</th>

              <th className="p-0.5 border border-slate-900 bg-sky-50/50 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-sky-50/50 font-normal">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-sky-50/50 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-sky-50/50 font-normal">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-sky-100/60 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-sky-100/60 font-normal">CPP</th>

              <th className="p-0.5 border border-slate-900 bg-amber-50/50 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-amber-50/50 font-normal">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-amber-50/50 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-amber-50/50 font-normal">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-amber-100/60 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-amber-100/60 font-normal">CPP</th>

              <th className="p-0.5 border border-slate-900 bg-purple-50/50 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-purple-50/50 font-normal">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-purple-50/50 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-purple-50/50 font-normal">CPP</th>
              <th className="p-0.5 border border-slate-900 bg-purple-100/60 font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-purple-100/60 font-normal">CPP</th>

              <th className="p-0.5 border border-slate-900 bg-white font-normal">សរុប</th>
              <th className="p-0.5 border border-slate-900 bg-white font-normal">CPP</th>
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
                <td className="p-1 border border-slate-900 font-bold bg-white">
                  {formatKhmerNumber(row.list2026Total)}
                </td>
                <td className="p-1 border border-slate-900 font-bold bg-white text-blue-900">
                  {formatKhmerNumber(row.list2026Cpp)}
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="text-center font-bold bg-white border-t-2 border-slate-900 text-slate-950">
              <td colSpan={2} className="p-1.5 border border-slate-900 text-center font-moul text-xs bg-white">
                សរុបស្រុកជើងព្រៃ
              </td>

              {/* 2025 Total */}
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.list2025Total)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.list2025Cpp)}
              </td>

              {/* ចុះឈ្មោះថ្មី */}
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.newRegStartTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.newRegStartCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.newRegCurrentTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.newRegCurrentCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-teal-100">
                {formatKhmerNumber(districtTotal.newRegCumulativeTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-teal-100">
                {formatKhmerNumber(districtTotal.newRegCumulativeCpp)}
              </td>

              {/* លុបឈ្មោះ */}
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.deletedStartTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.deletedStartCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.deletedCurrentTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.deletedCurrentCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-sky-100">
                {formatKhmerNumber(districtTotal.deletedCumulativeTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-sky-100">
                {formatKhmerNumber(districtTotal.deletedCumulativeCpp)}
              </td>

              {/* កែទិន្នន័យ */}
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.bioCorrectionStartTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.bioCorrectionStartCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.bioCorrectionCurrentTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.bioCorrectionCurrentCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-amber-100">
                {formatKhmerNumber(districtTotal.bioCorrectionCumulativeTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-amber-100">
                {formatKhmerNumber(districtTotal.bioCorrectionCumulativeCpp)}
              </td>

              {/* ជីវមាត្រ */}
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.biometricStartTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.biometricStartCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.biometricCurrentTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-white">
                {formatKhmerNumber(districtTotal.biometricCurrentCpp)}
              </td>
              <td className="p-1 border border-slate-900 bg-purple-100">
                {formatKhmerNumber(districtTotal.biometricCumulativeTotal)}
              </td>
              <td className="p-1 border border-slate-900 bg-purple-100">
                {formatKhmerNumber(districtTotal.biometricCumulativeCpp)}
              </td>

              {/* 2026 */}
              <td className="p-1 border border-slate-900 bg-white font-bold">
                {formatKhmerNumber(districtTotal.list2026Total)}
              </td>
              <td className="p-1 border border-slate-900 bg-white font-bold text-blue-900">
                {formatKhmerNumber(districtTotal.list2026Cpp)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures & Seal Section (Matching Official Document) */}
      <div className="flex justify-between items-start mt-10 px-4 md:px-12 text-center text-xs md:text-sm">
        {/* Left Signer */}
        <div className="space-y-1 font-moul w-64 flex flex-col items-center">
          <div className="text-slate-900 font-normal">បានឃើញ និងឯកភាព</div>
          <div className="text-slate-900 font-normal">ជ.គណៈអចិន្ត្រៃយ៍</div>
          <div className="text-slate-900 font-normal">អនុប្រធានប្រចាំការ</div>

          {/* Official Stamp & Signature of ឆាយ វ៉ាន់ស៊ី */}
          <div className="h-28 my-1 flex items-center justify-center">
            <img
              src={SIGNATURE_CHHAY_VANNSY_BASE64}
              alt="ត្រា និងហត្ថលេខា ឆាយ វ៉ាន់ស៊ី"
              className="h-28 max-w-[240px] object-contain select-none pointer-events-none drop-shadow-xs"
            />
          </div>

          <div className="text-slate-950 font-bold text-sm tracking-wide mt-1">
            {metadata.signerLeftName || 'ឆាយ វ៉ាន់ស៊ី'}
          </div>
        </div>

        {/* Right Signer */}
        <div className="space-y-1 font-moul w-64 flex flex-col items-center">
          <div className="text-slate-800 text-xs font-semibold">
            {metadata.signerRightDateLocation || 'ជើងព្រៃ ថ្ងៃទី ៧ ខែតុលា ឆ្នាំ២០២៦'}
          </div>
          <div className="text-slate-900 font-normal">អ្នកធ្វើតារាង</div>

          {/* Authentic Signature of ស៊ីម ល័ក្ខ */}
          <div className="h-28 my-1 flex items-center justify-center">
            <img
              src={SIGNATURE_SIM_LEAKH_BASE64}
              alt="ហត្ថលេខា ស៊ីម ល័ក្ខ"
              className="h-24 max-w-[200px] object-contain select-none pointer-events-none drop-shadow-xs"
            />
          </div>

          <div className="text-slate-950 font-bold text-sm tracking-wide mt-1">
            {metadata.signerRightName || 'ស៊ីម ល័ក្ខ'}
          </div>
        </div>
      </div>
    </div>
  );
};
