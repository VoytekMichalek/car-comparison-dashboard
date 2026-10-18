import { z } from 'zod';
import rawCargo from './data/cargo-capacity.json';

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
export const cargoRecords = cargoCapacitySchema.parse(rawCargo);
export const cargoFor = (vehicleId: string): CargoCapacityRecord | undefined => cargoRecords.find(record => record.vehicleIds.includes(vehicleId));
export function cargoTotals(record: CargoCapacityRecord) {
  return { seatsUpLitres: record.rearSeatsUpLitres + record.frontLitres, seatsFoldedLitres: record.rearSeatsFoldedLitres + record.frontLitres };
}
