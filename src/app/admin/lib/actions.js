"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from './mongodb';

export async function addUser(formData) {
  // Policy: only currently active administrators may create users or grant admin.
  await requireAdmin();
  const schema = z.object({
    username: z.string().trim().min(3).max(20),
    email: z.email().max(254).transform(value => value.toLowerCase()),
    password: z.string().min(12).refine(value => Buffer.byteLength(value, 'utf8') <= 72),
    phone: z.string().max(40).optional().default(''),
    address: z.string().max(1000).optional().default(''),
    isAdmin: z.enum(['true', 'false']).transform(value => value === 'true'),
    isActive: z.enum(['true', 'false']).transform(value => value === 'true'),
  }).strict();
  // React includes its own $ACTION_* metadata in progressively enhanced forms.
  const entries = [...formData.entries()].filter(([key]) => !key.startsWith('$ACTION_'));
  if (new Set(entries.map(([key]) => key)).size !== entries.length) throw new Error('Invalid user data');
  const parsed = schema.safeParse(Object.fromEntries(entries));
  if (!parsed.success) throw new Error('Invalid user data');
  const { password, ...fields } = parsed.data;
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const db = await connectToDatabase();
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ username: 1 }, { unique: true });
    const result = await users.insertOne(
      { ...fields, password: hashedPassword, createdAt: new Date(), updatedAt: new Date() },
      { writeConcern: { w: 'majority', j: true, wtimeoutMS: 5000 } },
    );
    if (!result.acknowledged) throw new Error('Write not acknowledged');
  } catch {
    // Duplicate-key/DB errors may contain PII or hashes. Do not log or expose them.
    throw new Error('Failed to create user');
  }
  revalidatePath('/admin/users');
  redirect('/admin/users');
}