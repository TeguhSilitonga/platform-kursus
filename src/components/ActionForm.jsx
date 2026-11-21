'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { btn } from './ui';

export function SubmitButton({ children, className = btn }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? 'Memproses…' : children}
    </button>
  );
}

// Form dengan server action + pesan error validasi dari server
export default function ActionForm({ action, children, className = 'space-y-4' }) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className={className}>
      {state?.error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p role="status" className="rounded-md border border-teal bg-teal-soft px-3 py-2 text-sm text-teal-dark">
          {state.message}
        </p>
      )}
      {children}
    </form>
  );
}
