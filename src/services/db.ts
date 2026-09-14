export const STORAGE_KEY = "todos_editables_almacenados_v1";
export const DB_NAME = "construction_control_db";
export const DB_VERSION = 1;

export const DB_STORES = [
  "proyecto",
  "cronograma",
  "costos",
  "produccion",
  "lps",
  "riesgos",
  "calidad",
  "seguridad",
  "documentos",
  "decisiones",
  "memoria",
  "historial",
  "metrados",
  "cuadrillas",
  "restricciones",
  "actividades",
  "valorizaciones",
] as const;

export type DBStoreName = (typeof DB_STORES)[number];

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      DB_STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecord(storeName: DBStoreName, record: Record<string, any>): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).put(record);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn(`Error writing to store ${storeName}:`, err);
  }
}

export async function getAllRecords(storeName: DBStoreName): Promise<any[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => {
        db.close();
        resolve(req.result || []);
      };
      req.onerror = () => {
        db.close();
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}
