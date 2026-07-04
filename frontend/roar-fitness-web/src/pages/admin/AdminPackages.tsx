/**
 * CRUD for membership packages shown on the public site and join flow.
 * Role: Admin.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { adminService } from '../../services';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { formatCurrency } from '../../lib/formatters';
import type { MembershipPackage, PackageType, CreatePackageRequest, UpdatePackageRequest } from '../../types';

const emptyForm: CreatePackageRequest = {
  packageTypeId: 0,
  packageName: '',
  description: '',
  amenities: '',
  durationDays: 30,
  priceLKR: 0,
  isFeatured: false,
};

function parseAmenities(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AdminPackages() {
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [types, setTypes] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPackage | null>(null);
  const [form, setForm] = useState<CreatePackageRequest>(emptyForm);
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pkgList, typeList] = await Promise.all([
        adminService.getPackagesAdmin(),
        adminService.getPackageTypes(),
      ]);
      setPackages(pkgList);
      setTypes(typeList);
      if (!form.packageTypeId && typeList.length > 0) {
        setForm((prev) => ({ ...prev, packageTypeId: typeList[0].packageTypeId }));
      }
    } catch {
      setError('Could not load membership packages. Ensure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setIsActive(true);
    setForm({
      ...emptyForm,
      packageTypeId: types[0]?.packageTypeId ?? 0,
    });
    setModalOpen(true);
    setError('');
  };

  const openEdit = (pkg: MembershipPackage) => {
    setEditing(pkg);
    setIsActive(pkg.isActive !== false);
    setForm({
      packageTypeId: pkg.packageTypeId ?? types[0]?.packageTypeId ?? 0,
      packageName: pkg.packageName,
      description: pkg.description ?? '',
      amenities: pkg.amenities ?? '',
      durationDays: pkg.durationDays,
      priceLKR: pkg.priceLKR,
      isFeatured: pkg.isFeatured ?? false,
    });
    setModalOpen(true);
    setError('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        const update: UpdatePackageRequest = { ...form, isActive };
        await adminService.updatePackage(editing.packageId, update);
        setMessage('Package updated. Changes appear on the public site and member join flow.');
      } else {
        await adminService.createPackage(form);
        setMessage('Package created and published to the website.');
      }
      setModalOpen(false);
      loadData();
    } catch {
      setError('Could not save package. Check all required fields.');
    }
  };

  const handleDeactivate = async (pkg: MembershipPackage) => {
    if (!window.confirm(`Deactivate "${pkg.packageName}"? It will be hidden from the public site.`)) return;
    try {
      await adminService.deletePackage(pkg.packageId);
      setMessage('Package deactivated.');
      loadData();
    } catch {
      setError('Could not deactivate package.');
    }
  };

  return (
    <>
      <div className="page-title page-title--row">
        <div>
          <h1>Membership Packages</h1>
          <p>Configure rates, descriptions, and amenities shown on the public website and member registration.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          Add Package
        </button>
      </div>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : packages.length === 0 ? (
        <EmptyState message="No membership packages configured yet." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Amenities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.packageId} className={pkg.isActive === false ? 'row--muted' : undefined}>
                  <td>
                    <strong>{pkg.packageName}</strong>
                    {pkg.isFeatured && <span className="badge badge--brand" style={{ marginLeft: 8 }}>Featured</span>}
                    {pkg.description && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{pkg.description}</div>}
                  </td>
                  <td>{pkg.typeName}</td>
                  <td>{pkg.durationDays} days</td>
                  <td>{formatCurrency(pkg.priceLKR)}</td>
                  <td>{parseAmenities(pkg.amenities ?? '').length} items</td>
                  <td>
                    {pkg.isActive === false ? (
                      <span className="badge badge--neutral">Inactive</span>
                    ) : (
                      <span className="badge badge--success">Active</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => openEdit(pkg)}>Edit</button>
                      {pkg.isActive !== false && (
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => handleDeactivate(pkg)}>Deactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Package' : 'Add Package'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Package Type</label>
                  <select
                    required
                    value={form.packageTypeId}
                    onChange={(e) => setForm({ ...form, packageTypeId: Number(e.target.value) })}
                  >
                    {types.map((type) => (
                      <option key={type.packageTypeId} value={type.packageTypeId}>{type.typeName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Package Name</label>
                  <input required value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Short summary shown on package cards"
                />
              </div>
              <div className="form-group">
                <label>Amenities (one per line)</label>
                <textarea
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  rows={5}
                  placeholder={'Full gym access\nLocker facilities\nFingerprint entry'}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (days)</label>
                  <input type="number" min="1" required value={form.durationDays || ''} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Price (LKR)</label>
                  <input type="number" min="0" step="0.01" required value={form.priceLKR || ''} onChange={(e) => setForm({ ...form, priceLKR: Number(e.target.value) })} />
                </div>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Mark as featured on the public packages page
              </label>
              {editing && (
                <label className="checkbox-label">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Package is active and visible on the website
                </label>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">{editing ? 'Save Changes' : 'Create Package'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
