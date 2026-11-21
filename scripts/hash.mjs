// Membuat hash bcrypt untuk data awal:  node scripts/hash.mjs passwordBaru
import bcrypt from 'bcryptjs';
console.log(bcrypt.hashSync(process.argv[2] ?? 'password123', 10));
