"use server";

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase, ensureIndex } from './mongodb';
import { ObjectId } from 'mongodb';
import { i18n } from '@/lib/i18n.config';

export type ActionResult = { ok: boolean; message: string };

export async function previewContent(formData: FormData) {
  await requireAdmin();
  const result = z.object({text:z.string().max(200000),locale:z.enum(i18n.locales)}).strict().safeParse(Object.fromEntries(formData));
  if (!result.success) return { ok:false,html:'',message:'The preview is too long. Preview up to 200,000 characters at a time.' };
  const { renderContentHtml } = await import('@/lib/contentHtml.server');
  return { ok:true,html:renderContentHtml(result.data.text,{lang:result.data.locale}),message:'' };
}

export async function saveUser(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await requireAdmin();
  const fields = [...formData.entries()].filter(([key]) => !key.startsWith('$ACTION_'));
  const schema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    username: z.string().trim().min(3).max(20),
    email: z.email().max(254).transform(value => value.toLowerCase()),
    password: z.string().min(12).refine(value => Buffer.byteLength(value) <= 72).optional(),
    phone: z.string().max(40).default(''), address:z.string().max(1000).default(''),
    isAdmin:z.enum(['true','false']).transform(value => value === 'true'),
    isActive:z.enum(['true','false']).transform(value => value === 'true'),
  }).strict();
  const parsed = schema.safeParse(Object.fromEntries(fields));
  if (!parsed.success || new Set(fields.map(([key]) => key)).size !== fields.length) return { ok:false, message:'Check all fields. Passwords need at least 12 characters and at most 72 UTF-8 bytes.' };
  const { id, password, ...values } = parsed.data;
  if (!id && !password) return { ok:false, message:'An initial password is required.' };
  if (id && password) return { ok:false, message:'Use the operator password reset command.' };
  if (id === actor.id && (!values.isAdmin || !values.isActive)) return { ok:false, message:'You cannot deactivate or demote your own account.' };
  try {
    const db = await connectToDatabase();
    const users = db.collection('users');
    await ensureIndex(users, { email:1 }, { unique:true });
    await ensureIndex(users, { username:1 }, { unique:true });
    const writeConcern = { w:'majority' as const, j:true, wtimeoutMS:5000 };
    if (id) {
      const result = await users.updateOne({ _id:new ObjectId(id) }, { $set:{ ...values, updatedAt:new Date() } }, { writeConcern });
      if (!result.acknowledged || !result.matchedCount) throw new Error('Unavailable');
    } else {
      const hash = await bcrypt.hash(password!,12);
      const result = await users.insertOne({ ...values,password:hash,createdAt:new Date(),updatedAt:new Date() }, { writeConcern });
      if (!result.acknowledged) throw new Error('Unavailable');
    }
  } catch { return { ok:false, message:'Unable to save. Check for duplicate email or username, or try again later.' }; }
  revalidatePath('/admin/users');
  revalidatePath('/admin');
  if (id) revalidatePath(`/admin/users/${id}`);
  return { ok:true, message:id?'User updated.':'User created. Return to users to review the account.' };
}

export async function saveContent(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const fields = [...formData.entries()].filter(([key]) => !key.startsWith('$ACTION_'));
  const schema = z.object({
    kind:z.enum(['places','tours','articles']), url:z.string().min(1).max(200).regex(/^[\p{L}\p{N}_-]+$/u),
    locale:z.enum(i18n.locales),
    name:z.string().min(1).max(1000).optional(),title:z.string().min(1).max(1000).optional(),subtitle:z.string().max(3000).optional(),
    region:z.string().max(1000).optional(),keywords:z.string().max(5000).optional(),description:z.string().max(200000).optional(),
    paragraphs:z.string().max(500000).optional(),
  }).strict();
  const parsed = schema.safeParse(Object.fromEntries(fields));
  if (!parsed.success || new Set(fields.map(([key]) => key)).size !== fields.length) return { ok:false,message:'Check the content fields and their lengths.' };
  const { kind,url,locale,paragraphs,...values } = parsed.data;
  const allowed = kind === 'places' ? ['name','title','region','keywords','description'] : kind === 'tours' ? ['title','keywords','description'] : ['title','subtitle','keywords'];
  if (Object.keys(values).some(key => !allowed.includes(key))) return { ok:false,message:'Unsupported content field.' };
  try {
    const db = await connectToDatabase(); const collection = db.collection(kind);
    const record = await collection.findOne({ url });
    if (!record) return { ok:false,message:'This content no longer exists.' };
    const updates: Record<string, unknown> = { updatedAt:new Date() };
    function assign(target: string, existing: unknown, value: string) {
      if ((existing === undefined && kind !== 'tours') || (existing && typeof existing === 'object' && !Array.isArray(existing))) updates[`${target}.${locale}`] = value;
      else {
        if (locale !== 'en') throw new Error('This field is not localized');
        updates[target] = value;
      }
    }
    for (const [key,value] of Object.entries(values)) assign(key,record[key],value);
    if (kind === 'articles') {
      const list = JSON.parse(paragraphs || '[]');
      const result = z.array(z.object({ title:z.string().max(1000),text:z.string().max(200000) }).strict()).max(200).safeParse(list);
      if (!result.success || result.data.length !== (record.paragraphs || []).length) return { ok:false,message:'Paragraph structure changed. Reload the editor.' };
      result.data.forEach((paragraph,index) => {
        for (const key of ['title','text'] as const) assign(`paragraphs.${index}.${key}`,record.paragraphs[index][key],paragraph[key]);
      });
    } else if (paragraphs !== undefined) return { ok:false,message:'Unsupported content field.' };
    const result = await collection.updateOne({ _id:record._id }, { $set:updates }, { writeConcern:{ w:'majority',j:true,wtimeoutMS:5000 } });
    if (!result.acknowledged || !result.matchedCount) throw new Error('Unavailable');
  } catch { return { ok:false,message:'Unable to save. Reload and try again. Nonlocalized fields can only be edited in English.' }; }
  revalidatePath(`/admin/${kind}/${url}`);
  revalidatePath(`/admin/${kind}`);
  for (const language of i18n.locales) {
    revalidatePath(`/${language}/${kind}/${url}`);
    revalidatePath(`/${language}/${kind}`);
  }
  return { ok:true,message:'Content saved. Changes may take a moment to appear on the website.' };
}
