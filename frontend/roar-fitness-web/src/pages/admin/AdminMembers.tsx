/**
 * Member roster and on-site registration. Admins create accounts tied to a
 * membership package for in-gym payment. Role: Admin.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { adminService, publicService } from '../../services';
import { LoadingSpinner, EmptyState } from '../../components/common';
import type { MembershipPackage } from '../../types';

interface MemberRow {
  memberId: number;
  identificationNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  nicNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isActive: boolean;
}

const fallbackPackages: MembershipPackage[] = [
  { packageId: 1, packageName: 'Starter Monthly', durationDays: 30, priceLKR: 8500 },
  { packageId: 2, packageName: 'Power Quarterly', durationDays: 90, priceLKR: 22000 },
  { packageId: 3, packageName: 'Roar Annual Elite', durationDays: 365, priceLKR: 75000 },
];

export function AdminMembers() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nicNumber: '',
    password: '',
    packageId: 1,
  });

  const loadData = () => {
    Promise.all([
      adminService.getMembers().catch(() => [] as MemberRow[]),
      publicService.getPackages().catch(() => fallbackPackages),
    ]).then(([m, p]) => {
      setMembers(m);
      setPackages(p);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const result = await adminService.createMember(form);
      setMessage(`Member created: ${result.identificationNumber}`);
      setShowForm(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', nicNumber: '', password: '', packageId: 1 });
      loadData();
    } catch {
      setError('Failed to create member. Check API connection.');
    }
  };

  return (
    <>
      <div className="dashboard-header">
        <div className="page-title" style={{ marginBottom: 0 }}>
          <h1>Members</h1>
          <p>Manage gym members and memberships.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Member'}
        </button>
      </div>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3>Create New Member</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>NIC</label>
                <input value={form.nicNumber} onChange={(e) => setForm({ ...form, nicNumber: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Package</label>
              <select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: Number(e.target.value) })}>
                {packages.map((p) => (
                  <option key={p.packageId} value={p.packageId}>{p.packageName}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn--primary">Create Member</button>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : members.length === 0 ? (
        <EmptyState message="No members found. Create your first member above." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Emergency Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.memberId}>
                  <td><strong>{m.identificationNumber}</strong></td>
                  <td>{m.fullName}</td>
                  <td>{m.email}</td>
                  <td>
                    {m.emergencyContactName ? (
                      <>
                        {m.emergencyContactName}
                        {m.emergencyContactPhone && (
                          <><br /><small>{m.emergencyContactPhone}</small></>
                        )}
                      </>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`badge ${m.isActive ? 'badge--success' : 'badge--error'}`}>
                      {m.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
