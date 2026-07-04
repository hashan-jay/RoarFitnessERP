/**
 * Shared profile edit form for member and instructor portals with photo upload.
 */
import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { LoadingSpinner, calculateAgeFromDateOfBirth, formatAppDate, toDateInputValue } from './common';
import { resolveAssetUrl } from '../lib/assets';
import { ApiError } from '../services/apiClient';
import type { PortalProfile, UpdateProfileRequest } from '../types';

interface ProfileSettingsProps {
  title: string;
  loadProfile: () => Promise<PortalProfile>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  uploadProfilePhoto?: (file: File) => Promise<{ profilePhotoUrl: string }>;
  allowDateOfBirthEdit?: boolean;
}

export function ProfileSettings({
  title,
  loadProfile,
  updateProfile,
  uploadProfilePhoto,
  allowDateOfBirthEdit = false,
}: ProfileSettingsProps) {
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    phone: '',
    addressLine1: '',
    city: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    profilePhotoUrl: '',
    dateOfBirth: '',
  });

  const computedAge = useMemo(
    () => calculateAgeFromDateOfBirth(form.dateOfBirth || profile?.dateOfBirth),
    [form.dateOfBirth, profile?.dateOfBirth]
  );

  useEffect(() => {
    loadProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          phone: data.phone ?? '',
          addressLine1: data.addressLine1 ?? '',
          city: data.city ?? '',
          country: data.country ?? 'Sri Lanka',
          emergencyContactName: data.emergencyContactName ?? '',
          emergencyContactPhone: data.emergencyContactPhone ?? '',
          profilePhotoUrl: data.profilePhotoUrl ?? '',
          dateOfBirth: toDateInputValue(data.dateOfBirth),
        });
      })
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [loadProfile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload: UpdateProfileRequest = {
        phone: form.phone,
        addressLine1: form.addressLine1,
        city: form.city,
        country: form.country,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        profilePhotoUrl: form.profilePhotoUrl,
      };

      if (allowDateOfBirthEdit && form.dateOfBirth) {
        payload.dateOfBirth = form.dateOfBirth;
      }

      await updateProfile(payload);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              dateOfBirth: allowDateOfBirthEdit ? form.dateOfBirth || prev.dateOfBirth : prev.dateOfBirth,
              age: computedAge ?? prev.age,
            }
          : prev
      );
      setMessage('Profile updated successfully.');
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadProfilePhoto) return;

    setUploading(true);
    setMessage('');
    setError('');

    try {
      const result = await uploadProfilePhoto(file);
      setForm((prev) => ({ ...prev, profilePhotoUrl: result.profilePhotoUrl }));
      setProfile((prev) => (prev ? { ...prev, profilePhotoUrl: result.profilePhotoUrl } : prev));
      setMessage('Profile photo updated.');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not upload photo. Use JPEG, PNG, or WebP under 5 MB.'
      );
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const photoSrc = resolveAssetUrl(form.profilePhotoUrl || profile?.profilePhotoUrl);
  const initials = profile?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  const displayedDateOfBirth = form.dateOfBirth || profile?.dateOfBirth;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="page-title">
        <h1>{title}</h1>
        <p>
          Update your contact details{allowDateOfBirthEdit ? ', date of birth,' : ''} and profile photo. Name, email, and NIC cannot be changed here.
        </p>
      </div>

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <div className="grid grid--2">
        <div className="card">
          <h3>Account Information</h3>
          <div className="profile-photo-block">
            <div className="profile-photo-block__avatar">
              {photoSrc ? <img src={photoSrc} alt={profile?.fullName ?? 'Profile'} /> : initials}
            </div>
            {uploadProfilePhoto && (
              <label className="btn btn--outline btn--sm">
                {uploading ? 'Uploading...' : 'Upload photo'}
                <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handlePhotoChange} disabled={uploading} />
              </label>
            )}
          </div>
          <dl className="profile-readonly">
            <div>
              <dt>Full Name</dt>
              <dd>{profile?.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile?.email ?? '—'}</dd>
            </div>
            <div>
              <dt>NIC</dt>
              <dd>{profile?.nicNumber ?? 'Not provided'}</dd>
            </div>
            <div>
              <dt>ID Number</dt>
              <dd>{profile?.identificationNumber ?? '—'}</dd>
            </div>
            <div>
              <dt>Date of Birth</dt>
              <dd>
                {displayedDateOfBirth
                  ? formatAppDate(displayedDateOfBirth)
                  : 'Not provided'}
              </dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>{computedAge != null ? `${computedAge} years` : profile?.age != null ? `${profile.age} years` : '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h3>Editable Details</h3>
          <form onSubmit={handleSubmit}>
            {allowDateOfBirthEdit && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    max={toDateInputValue(new Date().toISOString())}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    value={computedAge != null ? `${computedAge} years` : '—'}
                    readOnly
                    aria-readonly="true"
                  />
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="addressLine1">Address</label>
              <input id="addressLine1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="emergencyContactName">Contact Person (Emergency)</label>
              <input
                id="emergencyContactName"
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                placeholder="Name of person to contact in an emergency"
              />
            </div>
            <div className="form-group">
              <label htmlFor="emergencyContactPhone">Contact Number (Emergency)</label>
              <input
                id="emergencyContactPhone"
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                placeholder="Phone number for emergency contact"
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
