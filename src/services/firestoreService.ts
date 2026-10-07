/**
 * Firebase Cloud Firestore Real-Time Service
 * Provides sub-second real-time live synchronization across devices and communes
 */
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { auth } from './firebaseAuth';
import {
  CommuneEntry,
  SheetMetadata,
  MonthlyRecord,
  INITIAL_COMMUNES_DATA,
  calculateRowFormulas,
} from '../types/sheet';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firestore using the provisioned database ID
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(auth.app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(auth.app);

const COMMUNES_COLLECTION = 'communes';
const SETTINGS_COLLECTION = 'settings';
const MONTHLY_RECORDS_COLLECTION = 'monthly_records';
const DISTRICT_DOC_ID = 'district';

/**
 * Real-time listener for all 10 communes
 * Notifies subscriber whenever any device updates a commune row
 */
export function subscribeToCommunes(
  onUpdate: (communes: CommuneEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  const communesRef = collection(db, COMMUNES_COLLECTION);
  const q = query(communesRef, orderBy('id', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // If collection is empty, seed initial data automatically
        seedInitialCommunes();
        return;
      }

      const rows: CommuneEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CommuneEntry;
        rows.push(calculateRowFormulas(data));
      });

      // Ensure 10 communes are ordered by ID
      rows.sort((a, b) => a.id - b.id);
      onUpdate(rows);
    },
    (err) => {
      console.error('Firestore snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Seeds initial commune data if Firestore collection is blank
 */
export async function seedInitialCommunes(): Promise<void> {
  try {
    for (const item of INITIAL_COMMUNES_DATA) {
      const docRef = doc(db, COMMUNES_COLLECTION, String(item.id));
      await setDoc(docRef, calculateRowFormulas(item), { merge: true });
    }
  } catch (err) {
    console.error('Failed to seed initial communes in Firestore:', err);
  }
}

/**
 * Save / Update a single commune row in Firestore
 * Instantly broadcasts to all devices viewing the dashboard
 */
export async function saveCommuneToFirestore(
  commune: CommuneEntry,
  userEmail?: string
): Promise<void> {
  const calculated = calculateRowFormulas(commune);
  const docRef = doc(db, COMMUNES_COLLECTION, String(calculated.id));

  await setDoc(
    docRef,
    {
      ...calculated,
      lastUpdated: new Date().toISOString(),
      updatedBy: userEmail || 'Commune Officer',
    },
    { merge: true }
  );
}

/**
 * Real-time listener for district report metadata & Google Sheet settings
 */
export function subscribeToDistrictSettings(
  onUpdate: (metadata: Partial<SheetMetadata>) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, DISTRICT_DOC_ID);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as Partial<SheetMetadata>);
    }
  });
}

/**
 * Persist district metadata & connected Google Sheet ID to Firestore
 */
export async function saveDistrictSettingsToFirestore(
  metadata: Partial<SheetMetadata>
): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, DISTRICT_DOC_ID);
  await setDoc(docRef, metadata, { merge: true });
}

/**
 * Real-time listener for all saved monthly reports / records
 */
export function subscribeToMonthlyRecords(
  onUpdate: (records: MonthlyRecord[]) => void,
  onError?: (error: Error) => void
): () => void {
  const recordsRef = collection(db, MONTHLY_RECORDS_COLLECTION);
  const q = query(recordsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: MonthlyRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as MonthlyRecord);
      });
      onUpdate(records);
    },
    (err) => {
      console.error('Firestore monthly records snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or update a monthly record in Firestore
 */
export async function saveMonthlyRecordToFirestore(
  record: MonthlyRecord
): Promise<void> {
  const docRef = doc(db, MONTHLY_RECORDS_COLLECTION, record.id);
  await setDoc(docRef, record, { merge: true });
}

/**
 * Delete a monthly record from Firestore
 */
export async function deleteMonthlyRecordFromFirestore(
  recordId: string
): Promise<void> {
  const docRef = doc(db, MONTHLY_RECORDS_COLLECTION, recordId);
  await deleteDoc(docRef);
}
