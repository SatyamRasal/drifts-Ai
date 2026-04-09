import bcrypt from 'bcryptjs';

const email = (process.env.ADMIN_EMAIL || 'admin@driftsai.com').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'ChangeThisToAStrongPassword';

async function main() {
  const hashed = await bcrypt.hash(password, 12);
  console.log('ADMIN_EMAIL=', email);
  console.log('ADMIN_PASSWORD_HASH=', hashed);
  console.log('Store the hash in your production environment and remove the plain password once verified.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
