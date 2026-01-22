import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../admins/entities/admin.entity';

export async function seedAdmin(ds: DataSource) {
  const email = process.env.ADMIN_SEED_EMAIL;
  const pass = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !pass) {
    console.log('[seedAdmin] missing env -> skip');
    return;
  }

  const repo = ds.getRepository(Admin);

  const exists = await repo.findOne({ where: { email } });
  if (exists) {
    console.log('[seedAdmin] already exists -> skip');
    return;
  }

  const passwordHash = await bcrypt.hash(pass, 10);

  await repo.save(
    repo.create({
      email,
      passwordHash,
      isActive: true,
    }),
  );

  console.log('[seedAdmin] created:', email);
}