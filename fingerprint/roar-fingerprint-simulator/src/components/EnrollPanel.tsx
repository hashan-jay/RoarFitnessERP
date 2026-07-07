import { useEffect, useMemo, useState } from 'react';
import { ApiError, formatApiError } from '../api/client';
import { generateFingerprintTemplateId } from '../lib/fingerprintId';
import { attendanceApi } from '../services/attendance';
import { membershipApi } from '../services/membership';
import type { PersonOption } from '../types';
import { FingerprintPad } from './FingerprintPad';

interface EnrollPanelProps {
  loggedIn: boolean;
  sessionReady: boolean;
  apiOnline: boolean;
}

export function EnrollPanel({ loggedIn, sessionReady, apiOnline }: EnrollPanelProps) {
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionReady || !loggedIn || !apiOnline) return;
    setLoading(true);
    setError('');
    membershipApi
      .listPeopleForEnrollment()
      .then(setPeople)
      .catch((err) => setError(formatApiError(err, 'Could not load members and instructors.')))
      .finally(() => setLoading(false));
  }, [loggedIn, sessionReady, apiOnline]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return people;
    return people.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.identificationNumber.toLowerCase().includes(q) ||
        (p.nicNumber?.toLowerCase().includes(q) ?? false) ||
        (p.phone?.includes(q) ?? false)
    );
  }, [people, query]);

  const selected = people.find((p) => `${p.kind}:${p.id}` === selectedKey) ?? null;

  const handleGenerate = () => {
    if (!selected) {
      setError('Select a person first.');
      return;
    }
    setError('');
    setMessage('');
    setGeneratedPin(generateFingerprintTemplateId(selected.kind, selected.id));
  };

  const handleCapture = () => {
    if (!generatedPin) {
      handleGenerate();
      return;
    }
    setCapturing(true);
    setTimeout(() => setCapturing(false), 1200);
  };

  const handleSave = async () => {
    if (!selected || !generatedPin) {
      setError('Generate a fingerprint PIN and select a person first.');
      return;
    }
    if (!loggedIn) {
      setError('Sign in as admin to enroll fingerprints.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (selected.kind === 'member') {
        await attendanceApi.activateMember(selected.id, generatedPin);
      } else {
        await attendanceApi.activateInstructor(selected.id, generatedPin);
      }
      setMessage(
        `Fingerprint saved for ${selected.fullName}. PIN: ${generatedPin} — use this at the gate scanner.`
      );
      setPeople((prev) =>
        prev.map((p) =>
          p.kind === selected.kind && p.id === selected.id
            ? { ...p, isFingerprintActivated: true }
            : p
        )
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save fingerprint.');
    } finally {
      setSaving(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="panel">
        <p className="muted">Checking admin session…</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="panel">
        <div className="alert alert--info">Sign in as admin in the sidebar to enroll new fingerprints.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Enroll Fingerprint</h2>
        <p>
          Front-desk simulation: assign a unique fingerprint PIN to a new or existing gym member or instructor.
        </p>
      </div>

      {loading && <p className="muted">Loading roster…</p>}
      {error && <p className="alert alert--error">{error}</p>}
      {message && <p className="alert alert--success">{message}</p>}

      <div className="panel__grid">
        <div className="card">
          <h3>1. Find person</h3>
          <label>
            Search by name, member ID, NIC, or phone
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Kasun or RFMEM…"
            />
          </label>

          <label>
            Select member or instructor
            <select
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                setGeneratedPin('');
                setMessage('');
              }}
            >
              <option value="">— Choose —</option>
              {filtered.map((p) => (
                <option key={`${p.kind}:${p.id}`} value={`${p.kind}:${p.id}`}>
                  {p.fullName} · {p.identificationNumber}
                  {p.kind === 'member' ? ' (Member)' : ' (Instructor)'}
                  {p.isFingerprintActivated ? ' · already enrolled' : ''}
                </option>
              ))}
            </select>
          </label>

          {selected && (
            <dl className="detail-list">
              <div><dt>Name</dt><dd>{selected.fullName}</dd></div>
              <div><dt>ID</dt><dd>{selected.identificationNumber}</dd></div>
              <div><dt>NIC</dt><dd>{selected.nicNumber ?? '—'}</dd></div>
              <div><dt>Phone</dt><dd>{selected.phone ?? '—'}</dd></div>
              <div>
                <dt>Membership</dt>
                <dd>
                  {selected.kind === 'instructor'
                    ? 'Staff'
                    : selected.hasActiveMembership
                      ? 'Active'
                      : 'Expired / inactive'}
                </dd>
              </div>
              <div>
                <dt>Fingerprint</dt>
                <dd>{selected.isFingerprintActivated ? 'Already enrolled' : 'Not enrolled'}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="card card--center">
          <h3>2. Capture &amp; save</h3>
          <FingerprintPad
            scanning={capturing}
            onScan={handleCapture}
            disabled={!selected}
            label={generatedPin ? 'Simulate finger capture' : 'Generate PIN first'}
          />

          <div className="enroll-actions">
            <button type="button" className="btn btn--outline" onClick={handleGenerate} disabled={!selected}>
              Generate unique PIN
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
              disabled={!selected || !generatedPin || saving}
            >
              {saving ? 'Saving…' : 'Save fingerprint to ERP'}
            </button>
          </div>

          {generatedPin && (
            <div className="pin-display pin-display--large">
              <span>Fingerprint template ID (PIN)</span>
              <code>{generatedPin}</code>
              <p className="muted">This PIN is unique to {selected?.fullName}. Store it for gate entry testing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
