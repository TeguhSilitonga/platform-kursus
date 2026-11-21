'use client';
import { btnDanger } from './ui';

// Tombol hapus dengan konfirmasi; fields = input hidden yang dikirim ke action
export default function ConfirmButton({ action, fields, message, children = 'Hapus', className = btnDanger }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button type="submit" className={className}>{children}</button>
    </form>
  );
}
