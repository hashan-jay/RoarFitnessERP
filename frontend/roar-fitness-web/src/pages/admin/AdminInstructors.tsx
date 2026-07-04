/**
 * Instructor account management. Admins register new coaches with login
 * credentials and specialization. Role: Admin.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { adminService } from '../../services';
import { LoadingSpinner, EmptyState } from '../../components/common';

interface InstructorRow {
  instructorId: number;
  identificationNumber: string;
  fullName: string;
  email: string;
}

export function AdminInstructors() {
  const [instructors, setInstructors] = useState<InstructorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
  });

  const loadData = () => {
    adminService
      .getInstructors()
      .then(setInstructors)
      .catch(() => setInstructors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const result = await adminService.createInstructor(form);
      setMessage(`Instructor created: ${result.identificationNumber}`);
      setShowForm(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', specialization: '' });
      loadData();
    } catch {
      setError('Failed to create instructor. Check API connection.');
    }
  };

  return (
    <>
      <div className="dashboard-header">
        <div className="page-title" style={{ marginBottom: 0 }}>
          <h1>Instructors</h1>
          <p>Manage gym instructors and staff.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Instructor'}
        </button>
      </div>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3>Create New Instructor</h3>
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
                <label>Specialization</label>
                <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn--primary">Create Instructor</button>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : instructors.length === 0 ? (
        <EmptyState message="No instructors found. Create your first instructor above." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Instructor ID</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((i) => (
                <tr key={i.instructorId}>
                  <td><strong>{i.identificationNumber}</strong></td>
                  <td>{i.fullName}</td>
                  <td>{i.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
