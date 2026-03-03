import {
  STUDIO_MAX_AUTOSAVE_SLOTS,
} from '@/lib/constants'
import type { AutoSaveEntry } from './types'

const STORAGE_KEY = 'studio:autosaves'
const DRAFT_KEY = '__draft__'

function getStore(): Map<string, AutoSaveEntry> {
  if (typeof window === 'undefined') return new Map()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Map()
    const entries: AutoSaveEntry[] = JSON.parse(raw)
    return new Map(entries.map((e) => [e.id, e]))
  } catch {
    return new Map()
  }
}

function persist(store: Map<string, AutoSaveEntry>): void {
  if (typeof window === 'undefined') return
  try {
    const entries = Array.from(store.values()).sort(
      (a, b) => b.timestamp - a.timestamp,
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function evictIfNeeded(store: Map<string, AutoSaveEntry>): void {
  // Don't count the draft slot toward the limit
  const nonDraftEntries = Array.from(store.entries()).filter(
    ([key]) => key !== DRAFT_KEY,
  )
  if (nonDraftEntries.length <= STUDIO_MAX_AUTOSAVE_SLOTS) return

  // Sort by timestamp ascending (oldest first)
  nonDraftEntries.sort(([, a], [, b]) => a.timestamp - b.timestamp)

  const excess = nonDraftEntries.length - STUDIO_MAX_AUTOSAVE_SLOTS
  for (let i = 0; i < excess; i++) {
    store.delete(nonDraftEntries[i][0])
  }
}

export function saveToLocalStorage(entry: AutoSaveEntry): void {
  const store = getStore()
  store.set(entry.id, { ...entry, timestamp: Date.now() })
  evictIfNeeded(store)
  persist(store)
}

export function loadFromLocalStorage(id: string): AutoSaveEntry | null {
  const store = getStore()
  return store.get(id) ?? null
}

export function getDraftEntry(): AutoSaveEntry | null {
  return loadFromLocalStorage(DRAFT_KEY)
}

export function saveDraft(entry: Omit<AutoSaveEntry, 'id'>): void {
  saveToLocalStorage({ ...entry, id: DRAFT_KEY })
}

export function clearDraft(): void {
  const store = getStore()
  store.delete(DRAFT_KEY)
  persist(store)
}

export function getAllSaves(): AutoSaveEntry[] {
  const store = getStore()
  return Array.from(store.values())
    .filter((e) => e.id !== DRAFT_KEY)
    .sort((a, b) => b.timestamp - a.timestamp)
}

export function deleteSave(id: string): void {
  const store = getStore()
  store.delete(id)
  persist(store)
}
