export interface ContactFormValues {
  name: string
  email: string
  phone: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>

const nameHasNumbers = /\d/

export function validateContactForm(
  values: ContactFormValues,
): ContactFormErrors {
  const errors: ContactFormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required.'
  } else if (nameHasNumbers.test(values.name)) {
    errors.name = 'Name cannot include numbers.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone is required.'
  }

  if (!values.message.trim()) {
    errors.message = 'Message is required.'
  }

  return errors
}
