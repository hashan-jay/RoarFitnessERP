/**
 * Member terms and conditions. Role: Member.
 */
import { TermsContent } from '../../components/TermsContent';

export function MemberTerms() {
  return (
    <>
      <div className="page-title">
        <h1>Terms & Conditions</h1>
        <p>Member portal terms governing your use of Roar Fitness services.</p>
      </div>
      <div className="card">
        <TermsContent />
      </div>
    </>
  );
}
