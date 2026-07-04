/**
 * Modal form for instructors to submit a special-session request for admin
 * approval. Role: Instructor.
 */
import { useState, type FormEvent } from 'react';
import type { CreateSpecialSessionRequest } from '../types';
import { ApiError } from '../services';

interface SessionRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSpecialSessionRequest) => Promise<void>;
}

/** Format Date for datetime-local input (local timezone, no UTC shift). */
function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SessionRequestModal({ open, onClose, onSubmit }: SessionRequestModalProps) {
  const defaultStart = new Date(Date.now() + 86400000);
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 3600000);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDateTime: toLocalInputValue(defaultStart),
    endDateTime: toLocalInputValue(defaultEnd),
    feePerPersonLKR: '2500',
    maxParticipants: '20',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        startDateTime: new Date(form.startDateTime).toISOString(),
        endDateTime: new Date(form.endDateTime).toISOString(),
        feePerPersonLKR: Number(form.feePerPersonLKR),
        maxParticipants: Number(form.maxParticipants),
      });
      onClose();
      setForm({
        title: '',
        description: '',
        startDateTime: toLocalInputValue(defaultStart),
        endDateTime: toLocalInputValue(defaultEnd),
        feePerPersonLKR: '2500',
        maxParticipants: '20',
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit session request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Request a session</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sessionTitle">Title</label>
            <input id="sessionTitle" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="sessionDescription">Description</label>
            <textarea id="sessionDescription" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sessionStart">Start date & time</label>
              <input id="sessionStart" type="datetime-local" required value={form.startDateTime} onChange={(e) => setForm({ ...form, startDateTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="sessionEnd">End date & time</label>
              <input id="sessionEnd" type="datetime-local" required value={form.endDateTime} onChange={(e) => setForm({ ...form, endDateTime: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sessionFee">Fee per person (LKR)</label>
              <input id="sessionFee" type="number" min="0" step="100" required value={form.feePerPersonLKR} onChange={(e) => setForm({ ...form, feePerPersonLKR: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="sessionLimit">Member limit</label>
              <input id="sessionLimit" type="number" min="1" required value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
            </div>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
