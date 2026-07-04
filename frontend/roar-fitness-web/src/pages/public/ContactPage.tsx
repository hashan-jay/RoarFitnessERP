/**
 * Contact page with gym details and a message submission form.
 * Role: Public (unauthenticated visitors).
 */
import { useState, type FormEvent } from 'react';
import { publicService } from '../../services';
import { PageHero } from '../../components/PageHero';
import { Reveal, Stagger, StaggerItem } from '../../components/motion';

const contactBlocks = [
  { label: 'Address', value: '123 Galle Road, Colombo 03, Sri Lanka' },
  { label: 'Phone', value: '+94 77 123 4567' },
  { label: 'Email', value: 'info@roarfitness.lk' },
];

export function ContactPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      await publicService.sendContactMessage(form);
      setStatus('success');
      setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
      setErrorMsg('Unable to send message. Please try again or email us directly.');
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about membership, training, or facilities."
      />
      <section className="section">
        <div className="container">
          <div className="grid grid--2">
            <Stagger>
              {contactBlocks.map((block, i) => (
                <StaggerItem key={block.label}>
                  <div className="card card--interactive feature-card" style={{ marginBottom: i < 2 ? 'var(--spacing-md)' : 0 }}>
                    <div className="feature-card__index">{block.label}</div>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>{block.value}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.08}>
              <div className="card card--interactive">
                {status === 'success' && (
                  <div className="alert alert--success">Message sent. We&apos;ll respond shortly.</div>
                )}
                {status === 'error' && (
                  <div className="alert alert--error">{errorMsg}</div>
                )}
                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Send a message</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="fullName">Full name</label>
                    <input id="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn--primary btn--block" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
