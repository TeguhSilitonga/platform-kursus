import ActionForm, { SubmitButton } from './ActionForm';
import { saveUser } from '@/lib/actions/admin';
import { input, label, card } from './ui';

export default function UserForm({ user }) {
  return (
    <ActionForm action={saveUser} className={`${card} max-w-lg space-y-4 p-6`}>
      {user && <input type="hidden" name="id" value={user.id} />}
      <div><label htmlFor="username" className={label}>Username</label><input id="username" name="username" required minLength={3} maxLength={30} defaultValue={user?.username} className={input} /></div>
      <div><label htmlFor="email" className={label}>Email</label><input id="email" name="email" type="email" required defaultValue={user?.email} className={input} /></div>
      <div><label htmlFor="password" className={label}>{user ? 'Password baru (kosongkan jika tidak diubah)' : 'Password (min. 8 karakter)'}</label><input id="password" name="password" type="password" minLength={8} required={!user} autoComplete="new-password" className={input} /></div>
      <div>
        <label htmlFor="role" className={label}>Role</label>
        <select id="role" name="role" required defaultValue={user?.role ?? 'student'} className={input}>
          <option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option>
        </select>
      </div>
      <SubmitButton>Simpan pengguna</SubmitButton>
    </ActionForm>
  );
}
