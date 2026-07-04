/**
 * Instructor terms and conditions. Role: Instructor.
 */
import { TermsContent } from '../../components/TermsContent';

export function InstructorTerms() {
  return (
    <>
      <div className="page-title">
        <h1>Terms & Conditions</h1>
        <p>Instructor portal terms governing your employment and use of Roar Fitness systems.</p>
      </div>
      <div className="card">
        <TermsContent />
      </div>
    </>
  );
}
