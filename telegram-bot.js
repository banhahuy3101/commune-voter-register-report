/**
 * Telegram Bot for Commune Voter Registration Report
 * Direct Real-Time Integration with Firebase Firestore
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, setDoc, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// 1. Firebase Configuration Setup
let firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCsxCGds6xfjugeChTYk3vQLSMsIcV28KM',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0648418690',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0648418690.firebaseapp.com',
  firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-communevoterregi-d8da2e15-db24-470c-8af3-702f703dc25d',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0648418690.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1066572318214',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:1066572318214:web:c3fe22e505a7c76b27e587',
};

// Fallback to firebase-applet-config.json if present
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(configPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    firebaseConfig = { ...firebaseConfig, ...raw };
  } catch (e) {
    console.warn('Notice: Could not parse firebase-applet-config.json');
  }
}

const firebaseApp = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

const COMMUNES_COLLECTION = 'communes';

const COMMUNES_MAP = {
  1: 'ឃុំខ្នុរដំបង',
  2: 'ឃុំគោករវៀង',
  3: 'ឃុំផ្ដៅជុំ',
  4: 'ឃុំព្រៃចារ',
  5: 'ឃុំព្រីងជ្រុំ',
  6: 'ឃុំសំពងជ័យ',
  7: 'ឃុំស្តើងជ័យ',
  8: 'ឃុំសូទិប',
  9: 'ឃុំស្រង៉ែ',
  10: 'ឃុំត្រពាំងព្រះ',
};

// Formula calculator for row consistency
function calculateRowFormulas(entry) {
  const newCumulativeTotal = (Number(entry.newRegStartTotal) || 0) + (Number(entry.newRegCurrentTotal) || 0);
  const newCumulativeCpp = (Number(entry.newRegStartCpp) || 0) + (Number(entry.newRegCurrentCpp) || 0);

  const deletedCumulativeTotal = (Number(entry.deletedStartTotal) || 0) + (Number(entry.deletedCurrentTotal) || 0);
  const deletedCumulativeCpp = (Number(entry.deletedStartCpp) || 0) + (Number(entry.deletedCurrentCpp) || 0);

  const bioCumulativeTotal = (Number(entry.bioCorrectionStartTotal) || 0) + (Number(entry.bioCorrectionCurrentTotal) || 0);
  const bioCumulativeCpp = (Number(entry.bioCorrectionStartCpp) || 0) + (Number(entry.bioCorrectionCurrentCpp) || 0);

  const bioMetricCumulativeTotal = (Number(entry.biometricStartTotal) || 0) + (Number(entry.biometricCurrentTotal) || 0);
  const bioMetricCumulativeCpp = (Number(entry.biometricStartCpp) || 0) + (Number(entry.biometricCurrentCpp) || 0);

  const list2026Total = (Number(entry.list2025Total) || 0) + newCumulativeTotal - deletedCumulativeTotal;
  const list2026Cpp = (Number(entry.list2025Cpp) || 0) + newCumulativeCpp - deletedCumulativeCpp;

  return {
    ...entry,
    newRegCumulativeTotal,
    newRegCumulativeCpp,
    deletedCumulativeTotal,
    deletedCumulativeCpp,
    bioCorrectionCumulativeTotal: bioCumulativeTotal,
    bioCorrectionCumulativeCpp: bioCumulativeCpp,
    biometricCumulativeTotal: bioMetricCumulativeTotal,
    biometricCumulativeCpp: bioMetricCumulativeCpp,
    list2026Total,
    list2026Cpp,
  };
}

// 2. Telegram Bot Client
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not defined in .env or environment variables!');
  process.exit(1);
}
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function tgRequest(method, payload = {}) {
  try {
    const res = await fetch(`${BASE_URL}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API request error (${method}):`, err);
    return null;
  }
}

async function sendMessage(chatId, text, options = {}) {
  return await tgRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...options,
  });
}

async function answerCallbackQuery(callbackQueryId, text = '') {
  return await tgRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  });
}

// 3. Command Handlers
async function handleStart(chatId, firstName = '') {
  const welcomeText =
    `👋 <b>សូមស្វាគមន៍ ${firstName || ''}!</b>\n\n` +
    `🤖 នេះជា <b>Telegram Bot រាយការណ៍ទិន្នន័យបោះឆ្នោត ស្រុកជើងព្រៃ</b>\n` +
    `ប្រព័ន្ធនេះភ្ជាប់ Real-time ជាមួយ Firebase Cloud Firestore។\n\n` +
    `📌 <b>របៀបបញ្ជា៖</b>\n` +
    `• ចុចប៊ូតុងខាងក្រោមដើម្បីជ្រើសរើសឃុំ\n` +
    `• ឬវាយ Command ដើម្បី Update ទិន្នន័យភ្លាមៗ៖\n` +
    `  👉 <code>/new [កូដឃុំ] [សរុប] [បក្ស]</code> (ចុះឈ្មោះថ្មី)\n` +
    `  👉 <code>/del [កូដឃុំ] [សរុប] [បក្ស]</code> (លុបឈ្មោះ)\n` +
    `  👉 <code>/bio [កូដឃុំ] [សរុប] [បក្ស]</code> (កែជីវប្រវត្តិ)\n` +
    `  👉 <code>/biometric [កូដឃុំ] [សរុប] [បក្ស]</code> (ជីវមាត្រ)\n\n` +
    `ឧទាហរណ៍៖ <code>/new 1 5 4</code>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📋 បញ្ជីឃុំទាំង ១០', callback_data: 'menu_communes' },
        { text: '📊 សរុបទូទាំងស្រុក', callback_data: 'menu_district_total' },
      ],
      [{ text: '❓ របៀបប្រើប្រាស់លម្អិត', callback_data: 'menu_help' }],
    ],
  };

  await sendMessage(chatId, welcomeText, { reply_markup: keyboard });
}

async function showCommunesList(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '១. ឃុំខ្នុរដំបង', callback_data: 'view_1' },
        { text: '២. ឃុំគោករវៀង', callback_data: 'view_2' },
      ],
      [
        { text: '៣. ឃុំផ្ដៅជុំ', callback_data: 'view_3' },
        { text: '៤. ឃុំព្រៃចារ', callback_data: 'view_4' },
      ],
      [
        { text: '៥. ឃុំព្រីងជ្រុំ', callback_data: 'view_5' },
        { text: '៦. ឃុំសំពងជ័យ', callback_data: 'view_6' },
      ],
      [
        { text: '៧. ឃុំស្តើងជ័យ', callback_data: 'view_7' },
        { text: '៨. ឃុំសូទិប', callback_data: 'view_8' },
      ],
      [
        { text: '៩. ឃុំស្រង៉ែ', callback_data: 'view_9' },
        { text: '១០. ឃុំត្រពាំងព្រះ', callback_data: 'view_10' },
      ],
      [{ text: '🔙 ត្រឡប់ក្រោយ', callback_data: 'menu_main' }],
    ],
  };

  await sendMessage(chatId, '📋 <b>សូមជ្រើសរើសឃុំដែលអ្នកចង់មើល ឬរាយការណ៍៖</b>', {
    reply_markup: keyboard,
  });
}

async function viewCommuneData(chatId, communeId) {
  const name = COMMUNES_MAP[communeId] || `ឃុំលេខ ${communeId}`;
  try {
    const docRef = doc(db, COMMUNES_COLLECTION, String(communeId));
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return await sendMessage(chatId, `⚠️ មិនទាន់មានទិន្នន័យសម្រាប់ <b>${name}</b> នៅឡើយទេ។`);
    }

    const d = snap.data();
    const formatted =
      `🏛️ <b>${name} (កូដឃុំ៖ ${communeId})</b>\n` +
      `──────────────────────\n` +
      `👥 <b>បញ្ជីឆ្នាំ ២០២៥៖</b> ${Number(d.list2025Total || 0).toLocaleString()} នាក់ (បក្ស: ${Number(d.list2025Cpp || 0).toLocaleString()})\n\n` +
      `📥 <b>ចុះឈ្មោះបោះឆ្នោតថ្មី៖</b>\n` +
      `  • ថ្ងៃនេះ: <b>${d.newRegCurrentTotal || 0}</b> | បក្ស: <b>${d.newRegCurrentCpp || 0}</b>\n` +
      `  • បូកយោងសរុប: <b>${d.newRegCumulativeTotal || 0}</b> | បក្ស: <b>${d.newRegCumulativeCpp || 0}</b>\n\n` +
      `🗑️ <b>លុបឈ្មោះចេញពីបញ្ជី៖</b>\n` +
      `  • ថ្ងៃនេះ: <b>${d.deletedCurrentTotal || 0}</b> | បក្ស: <b>${d.deletedCurrentCpp || 0}</b>\n` +
      `  • បូកយោងសរុប: <b>${d.deletedCumulativeTotal || 0}</b> | បក្ស: <b>${d.deletedCumulativeCpp || 0}</b>\n\n` +
      `✏️ <b>កែទិន្នន័យជីវប្រវត្តិ៖</b>\n` +
      `  • ថ្ងៃនេះ: <b>${d.bioCorrectionCurrentTotal || 0}</b> | បក្ស: <b>${d.bioCorrectionCurrentCpp || 0}</b>\n` +
      `  • បូកយោងសរុប: <b>${d.bioCorrectionCumulativeTotal || 0}</b> | បក្ស: <b>${d.bioCorrectionCumulativeCpp || 0}</b>\n\n` +
      `📸 <b>បច្ចុប្បន្នភាពជីវមាត្រ៖</b>\n` +
      `  • ថ្ងៃនេះ: <b>${d.biometricCurrentTotal || 0}</b> | បក្ស: <b>${d.biometricCurrentCpp || 0}</b>\n` +
      `  • បូកយោងសរុប: <b>${d.biometricCumulativeTotal || 0}</b> | បក្ស: <b>${d.biometricCumulativeCpp || 0}</b>\n\n` +
      `📊 <b>ចំនួនក្នុងបញ្ជីឆ្នាំ ២០២៦៖</b> <b>${Number(d.list2026Total || 0).toLocaleString()}</b> នាក់ (បក្ស: <b>${Number(d.list2026Cpp || 0).toLocaleString()}</b>)\n` +
      `──────────────────────\n` +
      `🕒 កាលបរិច្ឆេទ Update: <code>${d.lastUpdated ? new Date(d.lastUpdated).toLocaleString('km-KH') : 'N/A'}</code>\n` +
      `👤 អ្នកកែប្រែ: ${d.updatedBy || 'N/A'}\n\n` +
      `💡 <b>ពាក្យបញ្ជាកែប្រែរហ័សសម្រាប់ឃុំនេះ៖</b>\n` +
      `• ចុះថ្មី: <code>/new ${communeId} [សរុប] [បក្ស]</code>\n` +
      `• លុបឈ្មោះ: <code>/del ${communeId} [សរុប] [បក្ស]</code>\n` +
      `• កែជីវប្រវត្តិ: <code>/bio ${communeId} [សរុប] [បក្ស]</code>\n` +
      `• ជីវមាត្រ: <code>/biometric ${communeId} [សរុប] [បក្ស]</code>`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔄 ផ្ទុកទិន្នន័យឡើងវិញ', callback_data: `view_${communeId}` }],
        [{ text: '📋 ត្រឡប់ទៅបញ្ជីឃុំ', callback_data: 'menu_communes' }],
      ],
    };

    await sendMessage(chatId, formatted, { reply_markup: keyboard });
  } catch (err) {
    console.error(`Error viewing commune ${communeId}:`, err);
    await sendMessage(chatId, `❌ មានបញ្ហាបច្ចេកទេសក្នុងការទាញយកទិន្នន័យ!`);
  }
}

async function showDistrictTotal(chatId) {
  try {
    const colRef = collection(db, COMMUNES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return await sendMessage(chatId, '⚠️ មិនទាន់មានទិន្នន័យឃុំក្នុង Firestore ទេ។');
    }

    let sum2025Total = 0;
    let sum2025Cpp = 0;
    let sumNewTotal = 0;
    let sumNewCpp = 0;
    let sumDelTotal = 0;
    let sumDelCpp = 0;
    let sumBioTotal = 0;
    let sumBioCpp = 0;
    let sumMetricTotal = 0;
    let sumMetricCpp = 0;
    let sum2026Total = 0;
    let sum2026Cpp = 0;

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      sum2025Total += Number(d.list2025Total) || 0;
      sum2025Cpp += Number(d.list2025Cpp) || 0;
      sumNewTotal += Number(d.newRegCumulativeTotal) || 0;
      sumNewCpp += Number(d.newRegCumulativeCpp) || 0;
      sumDelTotal += Number(d.deletedCumulativeTotal) || 0;
      sumDelCpp += Number(d.deletedCumulativeCpp) || 0;
      sumBioTotal += Number(d.bioCorrectionCumulativeTotal) || 0;
      sumBioCpp += Number(d.bioCorrectionCumulativeCpp) || 0;
      sumMetricTotal += Number(d.biometricCumulativeTotal) || 0;
      sumMetricCpp += Number(d.biometricCumulativeCpp) || 0;
      sum2026Total += Number(d.list2026Total) || 0;
      sum2026Cpp += Number(d.list2026Cpp) || 0;
    });

    const text =
      `📊 <b>សរុបលទ្ធផលទូទាំងស្រុកជើងព្រៃ (គ្រប់ឃុំទាំង ១០)</b>\n` +
      `──────────────────────\n` +
      `👥 <b>បញ្ជីឆ្នាំ ២០២៥៖</b> ${sum2025Total.toLocaleString()} នាក់ (បក្ស: ${sum2025Cpp.toLocaleString()})\n\n` +
      `📥 <b>ចុះឈ្មោះបោះឆ្នោតថ្មី (សរុបបូកយោង)៖</b>\n` +
      `  • សរុប: <b>${sumNewTotal.toLocaleString()}</b> | បក្ស: <b>${sumNewCpp.toLocaleString()}</b>\n\n` +
      `🗑️ <b>លុបឈ្មោះចេញពីបញ្ជី (សរុបបូកយោង)៖</b>\n` +
      `  • សរុប: <b>${sumDelTotal.toLocaleString()}</b> | បក្ស: <b>${sumDelCpp.toLocaleString()}</b>\n\n` +
      `✏️ <b>កែទិន្នន័យជីវប្រវត្តិ (សរុបបូកយោង)៖</b>\n` +
      `  • សរុប: <b>${sumBioTotal.toLocaleString()}</b> | បក្ស: <b>${sumBioCpp.toLocaleString()}</b>\n\n` +
      `📸 <b>បច្ចុប្បន្នភាពជីវមាត្រ (សរុបបូកយោង)៖</b>\n` +
      `  • សរុប: <b>${sumMetricTotal.toLocaleString()}</b> | បក្ស: <b>${sumMetricCpp.toLocaleString()}</b>\n\n` +
      `📈 <b>ចំនួនក្នុងបញ្ជីឆ្នាំ ២០២៦ សរុប៖</b>\n` +
      `  👉 <b>${sum2026Total.toLocaleString()}</b> នាក់ (បក្ស: <b>${sum2026Cpp.toLocaleString()}</b>)\n` +
      `──────────────────────`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔄 ផ្ទុកទិន្នន័យឡើងវិញ', callback_data: 'menu_district_total' }],
        [{ text: '🔙 ត្រឡប់ក្រោយ', callback_data: 'menu_main' }],
      ],
    };

    await sendMessage(chatId, text, { reply_markup: keyboard });
  } catch (err) {
    console.error('Error calculating district summary:', err);
    await sendMessage(chatId, '❌ មិនអាចគណនាសរុបស្រុកបានទេ!');
  }
}

async function showHelp(chatId) {
  const helpText =
    `📖 <b>សេចក្តីណែនាំអំពីរបៀបប្រើប្រាស់ Bot៖</b>\n\n` +
    `លោកអ្នកអាច Update តួលេខនៃឃុំនីមួយៗបានយ៉ាងរហ័សតាម Commands ខាងក្រោម៖\n\n` +
    `1️⃣ <b>ចុះឈ្មោះថ្មី (New Registration):</b>\n` +
    `<code>/new [កូដឃុំ] [សរុប] [បក្ស]</code>\n` +
    `ឧទាហរណ៍៖ <code>/new 1 3 2</code> (ឃុំខ្នុរដំបង ចុះថ្មី 3 នាក់, បក្ស 2 នាក់)\n\n` +
    `2️⃣ <b>លុបឈ្មោះចេញពីបញ្ជី (Deleted Voters):</b>\n` +
    `<code>/del [កូដឃុំ] [សរុប] [បក្ស]</code>\n` +
    `ឧទាហរណ៍៖ <code>/del 2 1 0</code>\n\n` +
    `3️⃣ <b>កែសម្រួលជីវប្រវត្តិ (Bio Correction):</b>\n` +
    `<code>/bio [កូដឃុំ] [សរុប] [បក្ស]</code>\n` +
    `ឧទាហរណ៍៖ <code>/bio 3 4 4</code>\n\n` +
    `4️⃣ <b>បច្ចុប្បន្នភាពជីវមាត្រ (Biometrics):</b>\n` +
    `<code>/biometric [កូដឃុំ] [សរុប] [បក្ស]</code>\n` +
    `ឧទាហរណ៍៖ <code>/biometric 4 2 2</code>\n\n` +
    `5️⃣ <b>កែប្រែរួមទាំងអស់ក្នុងឃុំតែមួយ (Full Update):</b>\n` +
    `<code>/update [កូដឃុំ] [ចុះថ្មី] [ចុះថ្មីបក្ស] [លុប] [លុបបក្ស] [កែជីវ] [កែជីវបក្ស] [ជីវមាត្រ] [ជីវមាត្របក្ស]</code>\n\n` +
    `ℹ️ <i>រាល់ទិន្នន័យដែលបានបញ្ចូល នឹងបញ្ជូនទៅកាន់ Firestore ភ្លាមៗ ហើយ Dashboard នឹងបង្ហាញ Real-Time ដោយស្វ័យប្រវត្តិ។</i>`;

  const keyboard = {
    inline_keyboard: [[{ text: '🔙 ត្រឡប់ក្រោយ', callback_data: 'menu_main' }]],
  };

  await sendMessage(chatId, helpText, { reply_markup: keyboard });
}

// 4. Update Field in Firestore
async function handleUpdateField(chatId, communeId, fieldKeyTotal, fieldKeyCpp, totalVal, cppVal, labelKh, username) {
  if (communeId < 1 || communeId > 10) {
    return await sendMessage(chatId, '⚠️ លេខកូដឃុំមិនត្រឹមត្រូវទេ! សូមជ្រើសពី 1 ដល់ 10');
  }

  const communeName = COMMUNES_MAP[communeId];
  try {
    const docRef = doc(db, COMMUNES_COLLECTION, String(communeId));
    const snap = await getDoc(docRef);

    let existingData = snap.exists() ? snap.data() : { id: communeId, communeName };

    existingData[fieldKeyTotal] = Number(totalVal) || 0;
    existingData[fieldKeyCpp] = Number(cppVal) || 0;

    // Recalculate formulas
    const calculated = calculateRowFormulas(existingData);
    calculated.lastUpdated = new Date().toISOString();
    calculated.updatedBy = `Telegram @${username || 'Officer'}`;

    // Save to Firestore
    await setDoc(docRef, calculated, { merge: true });

    const successMsg =
      `✅ <b>បានកែប្រែទិន្នន័យជោគជ័យ!</b>\n` +
      `🏛️ <b>${communeName} (កូដ: ${communeId})</b>\n` +
      `──────────────────────\n` +
      `📌 <b>${labelKh}៖</b>\n` +
      `  • ថ្ងៃនេះ: <b>${totalVal}</b> នាក់ | បក្ស: <b>${cppVal}</b> នាក់\n\n` +
      `📈 <b>ចំនួនក្នុងបញ្ជីឆ្នាំ ២០២៦ បច្ចុប្បន្ន៖</b> <b>${calculated.list2026Total.toLocaleString()}</b> (បក្ស: <b>${calculated.list2026Cpp.toLocaleString()}</b>)\n` +
      `──────────────────────\n` +
      `⚡ <i>ទិន្នន័យបាន Sync ចូល Firebase Dashboard រួចរាល់!</i>`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔍 មើលទិន្នន័យឃុំនេះ', callback_data: `view_${communeId}` }],
        [{ text: '📋 ត្រឡប់ទៅបញ្ជីឃុំ', callback_data: 'menu_communes' }],
      ],
    };

    await sendMessage(chatId, successMsg, { reply_markup: keyboard });
  } catch (err) {
    console.error(`Failed to update ${communeName}:`, err);
    await sendMessage(chatId, `❌ កំហុសបច្ចេកទេសក្នុងការរក្សាទុកទិន្នន័យ ${communeName}!`);
  }
}

// 5. Long-Polling Loop
let offset = 0;
let isRunning = true;

async function pollUpdates() {
  console.log('🤖 Telegram Bot is running and connected to Firebase Firestore...');
  console.log(`Bot username: @commune_voter_bot`);

  while (isRunning) {
    try {
      const res = await tgRequest('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message', 'callback_query'],
      });

      if (res && res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          offset = update.update_id + 1;

          // Handle Callback Queries (Button Clicks)
          if (update.callback_query) {
            const cq = update.callback_query;
            const data = cq.data;
            const chatId = cq.message?.chat?.id;

            await answerCallbackQuery(cq.id);

            if (data === 'menu_main') {
              await handleStart(chatId, cq.from?.first_name);
            } else if (data === 'menu_communes') {
              await showCommunesList(chatId);
            } else if (data === 'menu_district_total') {
              await showDistrictTotal(chatId);
            } else if (data === 'menu_help') {
              await showHelp(chatId);
            } else if (data.startsWith('view_')) {
              const cId = parseInt(data.replace('view_', ''), 10);
              await viewCommuneData(chatId, cId);
            }
            continue;
          }

          // Handle Text Messages
          if (update.message && update.message.text) {
            const msg = update.message;
            const chatId = msg.chat.id;
            const text = msg.text.trim();
            const username = msg.from?.username || msg.from?.first_name || 'user';

            if (text.startsWith('/start')) {
              await handleStart(chatId, msg.from?.first_name);
            } else if (text.startsWith('/help')) {
              await showHelp(chatId);
            } else if (text.startsWith('/total')) {
              await showDistrictTotal(chatId);
            } else if (text.startsWith('/communes')) {
              await showCommunesList(chatId);
            } else if (text.startsWith('/new')) {
              const parts = text.split(/\s+/).slice(1);
              if (parts.length < 3) {
                await sendMessage(chatId, '⚠️ ទម្រង់មិនត្រឹមត្រូវ! ឧទាហរណ៍៖ <code>/new 1 5 4</code> (កូដឃុំ សរុប បក្ស)');
              } else {
                await handleUpdateField(
                  chatId,
                  parseInt(parts[0], 10),
                  'newRegCurrentTotal',
                  'newRegCurrentCpp',
                  parseInt(parts[1], 10),
                  parseInt(parts[2], 10),
                  'ចុះឈ្មោះបោះឆ្នោតថ្មី',
                  username
                );
              }
            } else if (text.startsWith('/del')) {
              const parts = text.split(/\s+/).slice(1);
              if (parts.length < 3) {
                await sendMessage(chatId, '⚠️ ទម្រង់មិនត្រឹមត្រូវ! ឧទាហរណ៍៖ <code>/del 1 2 1</code> (កូដឃុំ សរុប បក្ស)');
              } else {
                await handleUpdateField(
                  chatId,
                  parseInt(parts[0], 10),
                  'deletedCurrentTotal',
                  'deletedCurrentCpp',
                  parseInt(parts[1], 10),
                  parseInt(parts[2], 10),
                  'លុបឈ្មោះចេញពីបញ្ជី',
                  username
                );
              }
            } else if (text.startsWith('/bio')) {
              const parts = text.split(/\s+/).slice(1);
              if (parts.length < 3) {
                await sendMessage(chatId, '⚠️ ទម្រង់មិនត្រឹមត្រូវ! ឧទាហរណ៍៖ <code>/bio 1 4 4</code> (កូដឃុំ សរុប បក្ស)');
              } else {
                await handleUpdateField(
                  chatId,
                  parseInt(parts[0], 10),
                  'bioCorrectionCurrentTotal',
                  'bioCorrectionCurrentCpp',
                  parseInt(parts[1], 10),
                  parseInt(parts[2], 10),
                  'កែសម្រួលជីវប្រវត្តិ',
                  username
                );
              }
            } else if (text.startsWith('/biometric')) {
              const parts = text.split(/\s+/).slice(1);
              if (parts.length < 3) {
                await sendMessage(chatId, '⚠️ ទម្រង់មិនត្រឹមត្រូវ! ឧទាហរណ៍៖ <code>/biometric 1 2 2</code> (កូដឃុំ សរុប បក្ស)');
              } else {
                await handleUpdateField(
                  chatId,
                  parseInt(parts[0], 10),
                  'biometricCurrentTotal',
                  'biometricCurrentCpp',
                  parseInt(parts[1], 10),
                  parseInt(parts[2], 10),
                  'បច្ចុប្បន្នភាពជីវមាត្រ',
                  username
                );
              }
            } else if (text.startsWith('/update')) {
              const parts = text.split(/\s+/).slice(1);
              if (parts.length < 9) {
                await sendMessage(
                  chatId,
                  '⚠️ ទម្រង់មិនគ្រប់គ្រាន់! ឧទាហរណ៍៖\n<code>/update [កូដឃុំ] [ចុះថ្មី] [ចុះថ្មីបក្ស] [លុប] [លុបបក្ស] [កែជីវ] [កែជីវបក្ស] [ជីវមាត្រ] [ជីវមាត្របក្ស]</code>'
                );
              } else {
                const cId = parseInt(parts[0], 10);
                if (cId < 1 || cId > 10) {
                  await sendMessage(chatId, '⚠️ លេខកូដឃុំត្រូវតែពី 1 ដល់ 10');
                  continue;
                }
                const docRef = doc(db, COMMUNES_COLLECTION, String(cId));
                const snap = await getDoc(docRef);
                let current = snap.exists() ? snap.data() : { id: cId, communeName: COMMUNES_MAP[cId] };

                current.newRegCurrentTotal = parseInt(parts[1], 10) || 0;
                current.newRegCurrentCpp = parseInt(parts[2], 10) || 0;
                current.deletedCurrentTotal = parseInt(parts[3], 10) || 0;
                current.deletedCurrentCpp = parseInt(parts[4], 10) || 0;
                current.bioCorrectionCurrentTotal = parseInt(parts[5], 10) || 0;
                current.bioCorrectionCurrentCpp = parseInt(parts[6], 10) || 0;
                current.biometricCurrentTotal = parseInt(parts[7], 10) || 0;
                current.biometricCurrentCpp = parseInt(parts[8], 10) || 0;

                const calculated = calculateRowFormulas(current);
                calculated.lastUpdated = new Date().toISOString();
                calculated.updatedBy = `Telegram @${username}`;

                await setDoc(docRef, calculated, { merge: true });
                await sendMessage(
                  chatId,
                  `✅ <b>បានកែប្រែទិន្នន័យគ្រប់ជ្រុងជ្រោយសម្រាប់ ${COMMUNES_MAP[cId]}!</b>\n` +
                    `📊 បញ្ជី ២០២៦៖ <b>${calculated.list2026Total.toLocaleString()}</b> (បក្ស: <b>${calculated.list2026Cpp.toLocaleString()}</b>)`
                );
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in polling loop:', err);
      // Wait 3 seconds on error before retrying
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// Start polling
pollUpdates().catch(console.error);

process.on('SIGINT', () => {
  console.log('\nShutting down Telegram Bot...');
  isRunning = false;
  process.exit(0);
});
