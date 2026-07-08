/**
 * UNUSED — legacy client-side finance ledger before admin reports used the backend API.
 * Revenue now comes from ReportService / Payments table. Safe to delete.
 */

/*
export type RevenueSource = 'membership' | 'pos' | 'session'

export interface FinanceTransaction { ... }
export interface FinanceSummary { ... }

const FINANCE_KEY = 'roar_finance_transactions'

function readAll(): FinanceTransaction[] { ... }
function writeAll(transactions: FinanceTransaction[]): void { ... }
export function getTransactions(): FinanceTransaction[] { ... }
export function addTransaction(...): FinanceTransaction { ... }
export function deleteTransaction(id: string): void { ... }
export function getFinanceSummary(transactions = getTransactions()): FinanceSummary { ... }
 */

export {}
