export type AttendanceStatus = 'present' | 'absent' | 'unmarked'

/** sessionId -> memberEmail -> status */
type AttendanceMap = Record<string, Record<string, AttendanceStatus>>

const ATTENDANCE_KEY = 'roar_class_attendance'

function readAll(): AttendanceMap {
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as AttendanceMap
  } catch {
    return {}
  }
}

function writeAll(data: AttendanceMap): void {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data))
}

export function getSessionAttendance(
  sessionId: string,
): Record<string, AttendanceStatus> {
  return readAll()[sessionId] ?? {}
}

export function getMemberAttendance(
  sessionId: string,
  memberEmail: string,
): AttendanceStatus {
  const session = getSessionAttendance(sessionId)
  return session[memberEmail.trim().toLowerCase()] ?? 'unmarked'
}

export function setMemberAttendance(
  sessionId: string,
  memberEmail: string,
  status: AttendanceStatus,
): void {
  const all = readAll()
  const key = sessionId
  const email = memberEmail.trim().toLowerCase()
  const session = { ...(all[key] ?? {}) }

  if (status === 'unmarked') {
    delete session[email]
  } else {
    session[email] = status
  }

  all[key] = session
  writeAll(all)
}
