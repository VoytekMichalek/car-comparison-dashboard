import { z } from 'zod';
import phevAudits from './data/phev-research-audits.json';
import familyGapUpdates from './data/family-fit-gap-updates.json';
import type { FamilyFitAssessment } from './types';

export const researchItemKeys = ['pricing', 'powertrain', 'family', 'warranty', 'servicing', 'insurance', 'tyres', 'repairs', 'reviews', 'ownership'] as const;
export const researchItemLabels: Record<typeof researchItemKeys[number], string> = { pricing: 'Pricing', powertrain: 'Powertrain & efficiency', family: 'Child seats & practicality', warranty: 'Warranty', servicing: 'Servicing', insurance: 'Insurance', tyres: 'Tyres', repairs: 'Repairs & recalls', reviews: 'Owner & expert reviews', ownership: 'Other ownership checks' };
const ids = z.array(z.string().min(1));
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const criterion = z.object({ rating: z.enum(['good', 'workable', 'restricted', 'unknown']), detail: z.string().min(1), sourceIds: ids }).strict().superRefine((c, ctx) => {
  if (c.rating !== 'unknown' && !c.sourceIds.length) ctx.addIssue({ code: 'custom', message: 'A rated family criterion needs evidence.' });
});
const fitSchema = z.object({ vehicleId: z.string(), scope: z.enum(['exact', 'related', 'unknown']), summary: z.string().min(1), criteria: z.object({ arrangement: criterion, buckles: criterion, space: criterion, access: criterion }).strict() }).strict();
const updates = z.array(z.record(z.string(), z.unknown())).default([]);
const packSchema = z.object({
  familyId: z.string().min(1), checked: date, sources: updates,
  vehicleUpdates: updates, priceUpdates: updates, ownershipUpdates: updates, reviewUpdates: updates, expertReviews: updates,
  insuranceUpdates: updates, tyreUpdates: updates, repairReserveUpdates: updates, fuelUpdates: updates, brandUpdates: updates,
  fitAssessments: z.array(fitSchema),
  audit: z.object({ summary: z.string().min(1), items: z.array(z.object({ key: z.enum(researchItemKeys), status: z.enum(['verified', 'estimate', 'gap', 'conflict']), finding: z.string().min(1), sourceIds: ids, vehicleIds: ids.min(1) }).strict()).length(researchItemKeys.length) }).strict(),
}).strict();
export const researchPacks = Object.entries(import.meta.glob('./data/research/*.json', { eager: true, import: 'default' })).sort(([a], [b]) => a.localeCompare(b)).map(([path, value]) => {
  const result = packSchema.safeParse(value);
  if (!result.success) throw new Error(`Invalid research pack ${path}: ${result.error.message}`);
  return result.data;
});
researchPacks.push(...phevAudits.map(raw => packSchema.parse(raw)));
export const researchSources = researchPacks.flatMap(p => p.sources);
const gapAssessments = z.array(fitSchema).parse(familyGapUpdates.fitAssessments);
export const familyFitAssessments: FamilyFitAssessment[] = researchPacks.flatMap(p => p.fitAssessments).map(item => gapAssessments.find(update => update.vehicleId === item.vehicleId) ?? item);
export const fitAssessmentFor = (vehicleId: string) => familyFitAssessments.find(a => a.vehicleId === vehicleId);
export const researchFor = (familyId: string) => researchPacks.find(p => p.familyId === familyId);

function merge(base: unknown, update: unknown): unknown {
  if (update === null || typeof update !== 'object' || Array.isArray(update)) return update;
  const result = { ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}) } as Record<string, unknown>;
  for (const [key, value] of Object.entries(update)) result[key] = merge(result[key], value);
  return result;
}
type UpdateKind = 'vehicleUpdates' | 'priceUpdates' | 'ownershipUpdates' | 'reviewUpdates' | 'expertReviews' | 'insuranceUpdates' | 'tyreUpdates' | 'repairReserveUpdates' | 'fuelUpdates' | 'brandUpdates';
/** Research updates use stable identities. An update cannot silently create a new car or replace an unrelated record. */
export function applyResearchUpdates(base: unknown[], kind: UpdateKind, key: string, allowNew = false): unknown[] {
  const result = structuredClone(base) as Record<string, unknown>[];
  const patched = new Set<unknown>();
  for (const pack of researchPacks) for (const update of pack[kind]) {
    const id = update[key];
    if (typeof id !== 'string' || patched.has(id)) throw new Error(`Invalid or duplicate ${kind}: ${String(id)}`);
    patched.add(id);
    const index = result.findIndex(item => item[key] === id);
    if (index === -1) {
      if (!allowNew) throw new Error(`Unknown ${kind} target: ${id}`);
      result.push(update);
    } else {
      if (kind === 'expertReviews') throw new Error(`Duplicate expert-review ID: ${id}`);
      result[index] = merge(result[index], update) as Record<string, unknown>;
    }
  }
  return result;
}
