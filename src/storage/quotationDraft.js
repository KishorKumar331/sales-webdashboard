// storage/quotationDrafts.js

const key = (tripId) => `quotationDraft:${tripId}`;

/** Save draft data locally (Web: localStorage) */
export async function saveQuotationDraft(tripId, data) {
  try {
    if (!tripId) return;

    const storageKey = key(tripId);
    const payload = JSON.stringify({
      v: 1,
      updatedAt: Date.now(),
      data,
    });

    localStorage.setItem(storageKey, payload);
  } catch (e) {
    console.warn("Failed to save draft", e);
  }
}

/** Load saved draft (if any) */
export async function loadQuotationDraft(tripId) {
  try {
    if (!tripId) return null;

    const storageKey = key(tripId);
    const raw = localStorage.getItem(storageKey);

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.data ?? null;
  } catch (e) {
    console.warn("Failed to load draft", e);
    return null;
  }
}

/** Clear a trip's draft */
export async function clearQuotationDraft(tripId) {
  try {
    if (!tripId) return;

    const storageKey = key(tripId);
    console.log(`🗑️ Clearing draft with key: ${storageKey}`);

    localStorage.removeItem(storageKey);
  } catch (e) {
    console.warn("Failed to clear draft", e);
  }
}

/** Debug function to list all stored drafts */
export async function listAllDrafts() {
  try {
    const keys = Object.keys(localStorage);
    const draftKeys = keys.filter((k) =>
      k.startsWith("quotationDraft:")
    );
    return draftKeys;
  } catch (e) {
    console.warn("Failed to list drafts", e);
    return [];
  }
}
