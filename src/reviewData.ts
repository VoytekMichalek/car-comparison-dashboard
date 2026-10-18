import { z } from 'zod';

const refs = z.array(z.string().min(1));
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const source = z.object({ id: z.string().min(1), title: z.string().min(1), url: z.url(), publisher: z.string().min(1), kind: z.enum(['manufacturer', 'safety', 'family-test', 'review', 'market', 'recall']), checked: date }).strict();
const cohort = z.object({
  id: z.string().min(1), familyId: z.string().min(1), publisher: z.string().min(1), region: z.string().min(1),
  kind: z.enum(['owner', 'professional', 'reliability']), rating: z.number().finite().nonnegative().nullable(), outOf: z.number().positive(), count: z.number().int().nonnegative().nullable(),
  countKind: z.enum(['reviews', 'ratings', 'survey-responses', 'unknown']), scope: z.string().min(1), summary: z.string().min(1), positiveThemes: refs, negativeThemes: refs, limitations: z.string().min(1), sourceIds: refs.min(1),
  matches: z.array(z.object({ vehicleId: z.string().min(1), factor: z.number().min(0).max(1), note: z.string().min(1) }).strict()), overlapGroup: z.string().min(1), checked: date,
}).strict().superRefine((c, ctx) => {
  if (c.rating !== null && c.rating > c.outOf) ctx.addIssue({ code: 'custom', message: 'Review rating exceeds its original scale.' });
  if (new Set(c.matches.map(m => m.vehicleId)).size !== c.matches.length) ctx.addIssue({ code: 'custom', message: 'Review cohort repeats a configuration match.' });
});
const coverage = z.object({ familyId: z.string().min(1), summary: z.string().min(1), gaps: refs, sourceIds: refs }).strict();
const pack = z.object({ checked: date, sources: z.array(source), cohorts: z.array(cohort), coverage: z.array(coverage) }).strict();
export type ReviewCohort = z.infer<typeof cohort>;
export const reviewExpansionPacks = Object.entries(import.meta.glob('./data/review-expansion/*.json', { eager: true, import: 'default' })).sort(([a], [b]) => a.localeCompare(b)).map(([path, raw]) => {
  const parsed = pack.safeParse(raw);
  if (!parsed.success) throw new Error(`Invalid review research ${path}: ${parsed.error.message}`);
  return parsed.data;
});
export const reviewExpansionSources = reviewExpansionPacks.flatMap(p => p.sources);
export const reviewCohorts = reviewExpansionPacks.flatMap(p => p.cohorts);
export const reviewCoverage = reviewExpansionPacks.flatMap(p => p.coverage);
