import { TRAINERS, type Trainer } from '../components/Trainers/constants'
import { PUBLIC_TRAINER_LIMIT } from '../constants/publicContent'
import { publicService } from '../services'

const SESSION_KEY = 'roar_public_trainers_v2'
const TRAINER_SYNC_KEY = 'roar_trainers_sync'
const CACHE_TTL_MS = 10 * 60 * 1000
const REALTIME_POLL_MS = 15_000

type TrainerCachePayload = {
  fetchedAt: number
  trainers: Trainer[]
}

type LoadOptions = {
  force?: boolean
}

let cachedTrainers: Trainer[] | null = readSessionCache()
let loadPromise: Promise<Trainer[]> | null = null
let pollTimer: number | null = null
const listeners = new Set<() => void>()

const trainerSyncChannel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('roar-trainers') : null

function readSessionCache(): Trainer[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as TrainerCachePayload
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS || !Array.isArray(parsed.trainers)) {
      return null
    }

    return parsed.trainers.length > 0 ? parsed.trainers.slice(0, PUBLIC_TRAINER_LIMIT) : null
  } catch {
    return null
  }
}

function writeSessionCache(trainers: Trainer[]) {
  try {
    const payload: TrainerCachePayload = {
      fetchedAt: Date.now(),
      trainers: trainers.slice(0, PUBLIC_TRAINER_LIMIT),
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload))
  } catch {
    // Ignore quota or private-mode errors.
  }
}

function normalizeTrainers(trainers: Trainer[]): Trainer[] {
  return trainers.slice(0, PUBLIC_TRAINER_LIMIT)
}

function trainersChanged(previous: Trainer[], next: Trainer[]): boolean {
  if (previous.length !== next.length) return true

  return previous.some((trainer, index) => {
    const other = next[index]
    if (!other) return true

    return (
      trainer.id !== other.id ||
      trainer.image !== other.image ||
      trainer.name !== other.name ||
      trainer.role !== other.role ||
      trainer.yearsExperience !== other.yearsExperience ||
      trainer.certifications.join('|') !== other.certifications.join('|') ||
      trainer.specialties.join('|') !== other.specialties.join('|')
    )
  })
}

function preloadTrainerImages(trainers: Trainer[], limit = 4) {
  trainers.slice(0, limit).forEach((trainer) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = trainer.image
  })
}

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function clearTrainerCacheStorage() {
  cachedTrainers = null
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem('roar_public_trainers_v1')
  } catch {
    // Ignore storage errors.
  }
}

function applyTrainers(trainers: Trainer[]) {
  const normalized = normalizeTrainers(trainers)
  cachedTrainers = normalized
  writeSessionCache(normalized)
  preloadTrainerImages(normalized)
  notifyListeners()
  return normalized
}

async function fetchTrainersFromApi(): Promise<Trainer[]> {
  const trainers = await publicService.getInstructors()
  return trainers.length > 0 ? normalizeTrainers(trainers) : normalizeTrainers(TRAINERS)
}

function broadcastTrainerRefresh() {
  try {
    localStorage.setItem(TRAINER_SYNC_KEY, String(Date.now()))
  } catch {
    // Ignore storage errors.
  }

  trainerSyncChannel?.postMessage({ type: 'refresh', at: Date.now() })
}

export function getTrainers(): Trainer[] {
  return cachedTrainers ?? TRAINERS
}

export function subscribeTrainers(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function loadTrainersFromApi(options: LoadOptions = {}): Promise<Trainer[]> {
  const { force = false } = options

  if (loadPromise) return loadPromise

  if (cachedTrainers && !force) {
    preloadTrainerImages(cachedTrainers)
    void refreshTrainersInBackground(true)
    return cachedTrainers
  }

  loadPromise = fetchTrainersFromApi()
    .then((trainers) => applyTrainers(trainers))
    .catch(() => applyTrainers(TRAINERS))
    .finally(() => {
      loadPromise = null
    })

  return loadPromise
}

async function refreshTrainersInBackground(force = false) {
  if (loadPromise) return loadPromise

  loadPromise = fetchTrainersFromApi()
    .then((trainers) => {
      const previous = cachedTrainers ?? []
      if (force || trainersChanged(previous, trainers)) applyTrainers(trainers)
      return trainers
    })
    .catch(() => cachedTrainers ?? TRAINERS)
    .finally(() => {
      loadPromise = null
    })

  return loadPromise
}

export function invalidateTrainerCache(): void {
  clearTrainerCacheStorage()
  notifyListeners()
  broadcastTrainerRefresh()
  void loadTrainersFromApi({ force: true })
}

function handleRealtimeRefresh() {
  clearTrainerCacheStorage()
  notifyListeners()
  void loadTrainersFromApi({ force: true })
}

export function initTrainerRealtimeSync(): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === TRAINER_SYNC_KEY) handleRealtimeRefresh()
  }

  const onChannelMessage = () => handleRealtimeRefresh()

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void refreshTrainersInBackground(true)
  }

  const onFocus = () => {
    void refreshTrainersInBackground(true)
  }

  window.addEventListener('storage', onStorage)
  trainerSyncChannel?.addEventListener('message', onChannelMessage)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('focus', onFocus)

  pollTimer = window.setInterval(() => {
    void refreshTrainersInBackground(true)
  }, REALTIME_POLL_MS)

  return () => {
    window.removeEventListener('storage', onStorage)
    trainerSyncChannel?.removeEventListener('message', onChannelMessage)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('focus', onFocus)
    if (pollTimer !== null) {
      window.clearInterval(pollTimer)
      pollTimer = null
    }
  }
}
