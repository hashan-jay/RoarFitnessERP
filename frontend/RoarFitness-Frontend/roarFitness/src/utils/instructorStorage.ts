/**
 * UNUSED — legacy localStorage instructor accounts from pre-API prototype.
 * Instructor auth now uses JWT + backend Instructors table. Safe to delete.
 */

/*
export interface StoredInstructor {
  email: string
  password: string
  firstName: string
  lastName: string
  specialty?: string
}

const INSTRUCTORS_KEY = 'roar_instructors'
const DEFAULT_INSTRUCTORS: StoredInstructor[] = [ ... ]

function readAll(): StoredInstructor[] { ... }
function writeAll(instructors: StoredInstructor[]): void { ... }
export function getInstructors(): StoredInstructor[] { ... }
export function findInstructorByEmail(email: string): StoredInstructor | null { ... }
export function findInstructor(email: string, password: string): StoredInstructor | null { ... }
export function createInstructor(instructor: StoredInstructor): StoredInstructor { ... }
export function updateInstructor(...): StoredInstructor { ... }
export function deleteInstructor(email: string): void { ... }
 */

export {}
