/**
 * Instructor profile settings page. Delegates to the shared ProfileSettings
 * component with instructor API bindings. Role: Instructor.
 */
import { ProfileSettings } from '../../components/ProfileSettings';
import { membershipService } from '../../services';

export function InstructorProfileSettings() {
  return (
    <ProfileSettings
      title="Profile Settings"
      loadProfile={membershipService.getInstructorProfile}
      updateProfile={membershipService.updateInstructorProfile}
      uploadProfilePhoto={membershipService.uploadInstructorProfilePhoto}
    />
  );
}
