/**
 * Member profile settings page. Delegates to the shared ProfileSettings component
 * with member API bindings. Role: Member.
 */
import { ProfileSettings } from '../../components/ProfileSettings';
import { membershipService } from '../../services';

export function MemberProfileSettings() {
  return (
    <ProfileSettings
      title="Profile Settings"
      loadProfile={membershipService.getProfile}
      updateProfile={membershipService.updateProfile}
      uploadProfilePhoto={membershipService.uploadProfilePhoto}
      allowDateOfBirthEdit
    />
  );
}
