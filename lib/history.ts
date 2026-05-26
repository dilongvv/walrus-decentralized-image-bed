import type { UploadRecord } from "@/lib/types";

const HISTORY_KEY = "walrus-image-bed:uploads";
const HISTORY_LIMIT = 20;

export function readUploadHistory(): UploadRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(HISTORY_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function saveUploadRecord(record: UploadRecord) {
  if (typeof window === "undefined") return [];

  const next = [
    record,
    ...readUploadHistory().filter((item) => item.id !== record.id && item.blobId !== record.blobId)
  ].slice(0, HISTORY_LIMIT);

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function updateUploadRecord(record: UploadRecord) {
  if (typeof window === "undefined") return [];

  const next = readUploadHistory().map((item) =>
    item.id === record.id || item.blobId === record.blobId ? record : item
  );

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}
