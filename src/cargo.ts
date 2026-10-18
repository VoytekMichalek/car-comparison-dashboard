import { z } from 'zod';
import rawCargo from './data/cargo-capacity.json';
import rawBootEvidence from './data/boot-evidence.json';
import phevExpansion from './data/phev-expansion.json';

const litres = z.number().finite().int().nonnegative();
const cargoRecord = z.object({
  id: z.string().min(1),
  vehicleIds: z.array(z.string().min(1)).min(1),
  seats: z.number().int().min(2),
  rearSeatsUpLitres: litres,
  frontLitres: litres,
  rearSeatsFoldedLitres: litres,
  scope: z.string().min(1),
  method: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
  checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict().superRefine((record, ctx) => {
  if (record.rearSeatsFoldedLitres < record.rearSeatsUpLitres) ctx.addIssue({ code: 'custom', message: 'Folded rear capacity cannot be smaller than seats-up rear capacity.' });
});

export const cargoCapacitySchema = z.array(cargoRecord).superRefine((records, ctx) => {
  const ids = new Set<string>(), vehicles = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) ctx.addIssue({ code: 'custom', message: `Duplicate cargo record: ${record.id}` });
    ids.add(record.id);
    for (const id of record.vehicleIds) {
      if (vehicles.has(id)) ctx.addIssue({ code: 'custom', message: `Duplicate cargo configuration: ${id}` });
      vehicles.add(id);
    }
  }
});
export type CargoCapacityRecord = z.infer<typeof cargoRecord>;
export const cargoRecords = cargoCapacitySchema.parse([...rawCargo, ...phevExpansion.cargoRecords]);
export const cargoFor = (vehicleId: string): CargoCapacityRecord | undefined => cargoRecords.find(record => record.vehicleIds.includes(vehicleId));
export function cargoTotals(record: CargoCapacityRecord) {
  return { seatsUpLitres: record.rearSeatsUpLitres + record.frontLitres, seatsFoldedLitres: record.rearSeatsFoldedLitres + record.frontLitres };
}

// A published capacity and a comparable scoring input are different claims.
// In particular, Tesla's manual figure is retained in Vehicle.boot while the
// score may use independently measured rear compartments as a labelled proxy.
const bootEvidenceRecord = z.object({
  vehicleId: z.string().min(1),
  measurement: z.enum(['VDA', 'manufacturer', 'roof', 'manufacturer-related-VDA', 'independent-proxy']),
  evidenceFactor: z.number().finite().positive().max(1),
  estimated: z.boolean(),
  scoreLitres: litres.positive(),
  scoreBasis: z.string().min(1),
  scope: z.string().min(1),
  caveat: z.string().min(1),
  practicalSummary: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
  checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict();
export const bootEvidenceSchema = z.array(bootEvidenceRecord).superRefine((records, ctx) => {
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.vehicleId)) ctx.addIssue({ code: 'custom', message: `Duplicate boot evidence: ${record.vehicleId}` });
    seen.add(record.vehicleId);
    if (record.measurement !== 'VDA' && !record.estimated) ctx.addIssue({ code: 'custom', message: `Non-VDA boot score must be labelled as an estimate: ${record.vehicleId}` });
  }
});
export type BootEvidenceRecord = z.infer<typeof bootEvidenceRecord>;
export const bootEvidenceRecords = bootEvidenceSchema.parse([...rawBootEvidence, ...phevExpansion.vehicles.map(v => {
  const estimated = !/\bVDA\b/.test(v.boot.basis) || /estimate|proxy|conflict/i.test(v.boot.basis);
  return { vehicleId: v.id, measurement: estimated ? 'manufacturer' : 'VDA', evidenceFactor: /estimate|proxy/i.test(v.boot.basis) ? .25 : /conflict/i.test(v.boot.basis) ? .35 : estimated ? .45 : 1, estimated, scoreLitres: v.boot.value, scoreBasis: v.boot.basis, scope: `${v.variant}: rear cargo with second row available; ${v.seats > 5 ? 'third row folded' : 'all seats available'}.`, caveat: estimated ? 'Declared or related-body capacity; measurement boundaries and fitment can differ. Verify your pram and occupied-row configuration.' : 'Published VDA capacity; actual pram dimensions and seat position still matter.', practicalSummary: v.familyFit.summary, sourceIds: v.boot.sourceIds, checked: v.checked };
})]);
export const bootEvidenceFor = (vehicleId: string): BootEvidenceRecord | undefined => bootEvidenceRecords.find(record => record.vehicleId === vehicleId);
