import ActionForm, { SubmitButton } from './ActionForm';
import { saveCourse } from '@/lib/actions/manage';
import { input, label, card } from './ui';

export default function CourseForm({ course, categories, teachers, user }) {
  return (
    <ActionForm action={saveCourse} className={`${card} max-w-2xl space-y-4 p-6`}>
      {course && <input type="hidden" name="id" value={course.id} />}
      <div><label htmlFor="name" className={label}>Nama course</label><input id="name" name="name" required maxLength={120} defaultValue={course?.name} className={input} /></div>
      <div><label htmlFor="description" className={label}>Deskripsi</label><textarea id="description" name="description" required rows={4} defaultValue={course?.description} className={input} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category_id" className={label}>Kategori</label>
          <select id="category_id" name="category_id" required defaultValue={course?.category_id ?? ''} className={input}>
            <option value="" disabled>Pilih kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="teacher_id" className={label}>Nama teacher</label>
          {user.role === 'admin' ? (
            <select id="teacher_id" name="teacher_id" required defaultValue={course?.teacher_id ?? ''} className={input}>
              <option value="" disabled>Pilih teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.username}</option>)}
            </select>
          ) : <input id="teacher_id" value={user.username} readOnly className={`${input} bg-mist`} />}
        </div>
        <div><label htmlFor="start_date" className={label}>Tanggal mulai (opsional)</label><input id="start_date" name="start_date" type="date" defaultValue={course?.start_date ?? ''} className={input} /></div>
        <div><label htmlFor="end_date" className={label}>Tanggal selesai (opsional)</label><input id="end_date" name="end_date" type="date" defaultValue={course?.end_date ?? ''} className={input} /></div>
      </div>
      <p className="text-xs text-slate-500">Kosongkan kedua tanggal untuk course dengan akses selamanya.</p>
      <SubmitButton>Simpan course</SubmitButton>
    </ActionForm>
  );
}
