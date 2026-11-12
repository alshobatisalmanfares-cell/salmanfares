const pause = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

// Retry the complete operation, including reading the body, not only HTTP status codes.
export async function downloadNative(url, { label, headers, decode, fetchImpl = fetch, wait = pause, attempts = 4 }) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    let retryDelay = Math.min(2000 * 2 ** attempt, 30000);
    try {
      const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(30000) });
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        if (!retryable) throw Object.assign(new Error(`HTTP ${response.status}`), { permanent: true });
        const retryAfter = response.headers.get("retry-after");
        const seconds = Number(retryAfter);
        const requestedDelay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter ?? "") - Date.now();
        if (requestedDelay > 0) retryDelay = Math.min(Math.max(retryDelay, requestedDelay), 30000);
        await response.body?.cancel();
        throw new Error(`HTTP ${response.status}`);
      }
      return await decode(response);
    } catch (error) {
      lastError = error;
      if (error?.permanent || attempt === attempts - 1) break;
      console.warn(`[native] ${label}: retry ${attempt + 1}/${attempts - 1}`);
      await wait(retryDelay);
    }
  }
  // Labels identify the catalog/item without leaking signed URLs or request headers.
  throw new Error(`${label} failed: ${lastError instanceof Error ? lastError.message : "download error"}`, { cause: lastError });
}