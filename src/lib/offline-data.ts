function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("salman-offline", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("data");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readOffline<T>(key: string, fallback: T): Promise<T> {
  if (typeof indexedDB === "undefined") return fallback;
  let db: IDBDatabase | undefined;
  try {
    db = await database();
    return await new Promise<T>((resolve, reject) => {
      const request = db?.transaction("data").objectStore("data").get(key);
      if (!request) return resolve(fallback);
      request.onsuccess = () => resolve(request.result ?? fallback);
      request.onerror = () => reject(request.error);
    });
  } catch { return fallback; }
  finally { db?.close(); }
}

export async function writeOffline(key: string, value: unknown): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  let db: IDBDatabase | undefined;
  try {
    db = await database();
    await new Promise<void>((resolve, reject) => {
      const transaction = db?.transaction("data", "readwrite");
      if (!transaction) return resolve();
      transaction.objectStore("data").put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch { /* Storage unavailable: keep the current interface usable. */ }
  finally { db?.close(); }
}