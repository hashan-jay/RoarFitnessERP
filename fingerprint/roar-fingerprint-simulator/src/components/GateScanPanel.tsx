import { useCallback, useEffect, useState } from 'react';
import { getToken } from '../api/client';
import { attendanceApi } from '../services/attendance';
import type { EnrolledFingerprint, ScanResult } from '../types';
import { FingerprintPad } from './FingerprintPad';

interface GateScanPanelProps {
  apiOnline: boolean;
  sessionReady: boolean;
  loggedIn: boolean;
}

export function GateScanPanel({ apiOnline, sessionReady, loggedIn }: GateScanPanelProps) {
  const [enrolled, setEnrolled] = useState<EnrolledFingerprint[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [manualId, setManualId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const loadEnrolled = useCallback(async () => {
    if (!sessionReady || !loggedIn || !getToken()) {
      setEnrolled([]);
      return;
    }
    try {
      const data = await attendanceApi.getEnrolled();
      setEnrolled(data);
      if (data.length > 0 && !selectedId && !manualId) {
        setSelectedId(data[0].fingerprintTemplateId);
      }
    } catch {
      setEnrolled([]);
    }
  }, [loggedIn, sessionReady, selectedId, manualId]);

  useEffect(() => {
    if (apiOnline && sessionReady) loadEnrolled();
  }, [apiOnline, sessionReady, loadEnrolled]);

  const activeTemplateId = manualId.trim() || selectedId;

  const handleScan = async () => {
    if (!activeTemplateId) {
      setError('Select or enter a fingerprint PIN first.');
      return;
    }
    if (!apiOnline) {
      setError('API is offline. Start the backend on port 5188.');
      return;
    }

    setScanning(true);
    setError('');
    setLastResult(null);

    try {
      const result = await attendanceApi.scan(activeTemplateId);
      setLastResult(result);
      await loadEnrolled();
    } catch {
      setError('Scan request failed. Ensure the API is running.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Gym Entry Gate</h2>
        <p>Simulates the physical scanner at reception. No login required — calls POST /attendance/scan.</p>
      </div>

      <div className="panel__grid">
        <div className="card">
          <h3>Select fingerprint PIN</h3>
          <p className="muted">Choose an enrolled person or paste a fingerprint template ID manually.</p>
          {sessionReady && !loggedIn && (
            <p className="alert alert--info">Sign in as admin to load the enrolled dropdown, or enter a PIN manually below.</p>
          )}

          <label>
            Enrolled fingerprints
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setManualId('');
              }}
              disabled={enrolled.length === 0}
            >
              {enrolled.length === 0 ? (
                <option value="">No enrolled fingerprints yet</option>
              ) : (
                enrolled.map((item) => (
                  <option key={item.fingerprintTemplateId} value={item.fingerprintTemplateId}>
                    {item.personName} ({item.identificationNumber})
                    {item.personType === 'Member' && !item.hasActiveMembership ? ' — expired membership' : ''}
                  </option>
                ))
              )}
            </select>
          </label>

          <label>
            Or enter PIN / template ID
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="RF-FP-MEM-12-A1B2C3D4"
              spellCheck={false}
            />
          </label>

          {activeTemplateId && (
            <div className="pin-display">
              <span>Active PIN</span>
              <code>{activeTemplateId}</code>
            </div>
          )}

          {error && <p className="alert alert--error">{error}</p>}

          <button type="button" className="btn btn--outline btn--sm" onClick={() => loadEnrolled()}>
            Refresh enrolled list
          </button>
        </div>

        <div className="card card--center">
          <FingerprintPad
            scanning={scanning}
            success={lastResult?.accessGranted === true}
            denied={lastResult?.accessGranted === false}
            onScan={handleScan}
            disabled={!apiOnline || !activeTemplateId}
            label={activeTemplateId ? 'Tap to scan entry' : 'Select a PIN first'}
          />

          {lastResult && (
            <div className={`scan-result ${lastResult.accessGranted ? 'scan-result--ok' : 'scan-result--deny'}`}>
              <strong>{lastResult.accessGranted ? 'Access granted' : 'Access denied'}</strong>
              <p>{lastResult.message}</p>
              {lastResult.personName && (
                <p className="muted">
                  {lastResult.personName} · {lastResult.personType}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
