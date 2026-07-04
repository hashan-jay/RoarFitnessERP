/** Shared loading and empty-state UI primitives. */

export function LoadingSpinner() {
  return <div className="loading">Loading...</div>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>;
}
