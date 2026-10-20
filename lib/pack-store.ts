import type { SupabaseClient } from '@supabase/supabase-js';
import { generateAdPack } from './ai';
import { InputError, SECTIONS, inputFromProductRow, isSectionKey, productRow, sectionItems } from './pack';
import type { AdPack, ProductInput } from './types';

// Server-side reads and writes for saved packs. Every call goes through a client
// acting as the signed-in user, so row level security decides what they can touch.

export class NotFoundError extends Error {
  readonly status = 404;
}

/** Saves the brief, the pack and one row per section. A failure part-way removes what was written. */
export async function savePack(db: SupabaseClient, userId: string, input: ProductInput, pack: AdPack): Promise<string> {
  const { data: product, error: productError } = await db.from('products').insert(productRow(userId, input)).select('id').single();
  if (productError) throw new Error(`Saving the product failed: ${productError.message}`);

  const { data: adPack, error: packError } = await db.from('ad_packs')
    .insert({ product_id: product.id, user_id: userId, title: `${input.productName} ad pack`, product_summary: pack.productSummary })
    .select('id').single();
  if (packError) {
    await db.from('products').delete().eq('id', product.id);
    throw new Error(`Saving the pack failed: ${packError.message}`);
  }

  const rows: { ad_pack_id: string; section_key: string; content: unknown }[] =
    SECTIONS.map((s) => ({ ad_pack_id: adPack.id, section_key: s.key, content: sectionItems(pack, s.key) }));
  if (pack.claimCheck) rows.push({ ad_pack_id: adPack.id, section_key: 'claimCheck', content: pack.claimCheck });
  const { error: sectionsError } = await db.from('generated_sections').insert(rows);
  if (sectionsError) {
    await db.from('ad_packs').delete().eq('id', adPack.id); // sections cascade
    await db.from('products').delete().eq('id', product.id);
    throw new Error(`Saving the pack sections failed: ${sectionsError.message}`);
  }
  return adPack.id;
}

/** Regenerates one section from the pack's stored brief and saves the new content. */
export async function regenerateSection(db: SupabaseClient, sectionId: string, beforeGenerate: () => Promise<void>): Promise<string[]> {
  const { data: section } = await db.from('generated_sections').select('id, section_key, ad_pack_id').eq('id', sectionId).maybeSingle();
  if (!section) throw new NotFoundError('Section not found');
  if (!isSectionKey(section.section_key)) throw new InputError('This section cannot be regenerated');

  const { data: pack } = await db.from('ad_packs').select('product_id').eq('id', section.ad_pack_id).maybeSingle();
  const { data: product } = pack ? await db.from('products').select('*').eq('id', pack.product_id).maybeSingle() : { data: null };
  if (!product) throw new NotFoundError('The brief for this pack is missing');
  const input = inputFromProductRow(product); // re-validated: the row is user-writable

  await beforeGenerate();
  const items = sectionItems(await generateAdPack(input), section.section_key);
  const { error } = await db.from('generated_sections').update({ content: items }).eq('id', sectionId);
  if (error) throw new Error(`Saving the regenerated section failed: ${error.message}`);
  return items;
}
