import { describe, expect, it } from 'vitest';
import { vehicles, sourceMap, validateReferences } from './data';
import { familyFitAssessments, researchItemKeys, researchPacks } from './research';
import { calculateFamilyFit } from './familyFit';
import { scoreVehicle } from './scoring';
import { emptyPersonal } from './lib';
import { existsSync } from 'node:fs';

describe('per-model research audit integration', () => {
  it('covers every listed model and configuration with a complete audit and companion report', () => {
    expect(researchPacks.map(p => p.familyId).sort()).toEqual([...new Set(vehicles.map(v => v.familyId))].sort());
    expect(familyFitAssessments.map(a => a.vehicleId).sort()).toEqual(vehicles.map(v => v.id).sort());
    for (const pack of researchPacks) expect(existsSync(`docs/research/${pack.familyId}.md`), pack.familyId).toBe(true);
  });
  it('validates scope, IDs, source references and underlying updated facts', () => {
    expect(validateReferences()).toEqual([]);
    for (const pack of researchPacks) {
      const family = vehicles.filter(v => v.familyId === pack.familyId);
      expect(pack.audit.items.map(i => i.key).sort()).toEqual([...researchItemKeys].sort());
      expect(pack.fitAssessments.map(a => a.vehicleId).sort()).toEqual(family.map(v => v.id).sort());
      for (const item of pack.audit.items) {
        expect(item.finding.trim().length).toBeGreaterThan(20);
        expect(item.vehicleIds.length).toBeGreaterThan(0);
        if (item.status === 'verified') expect(item.sourceIds.length).toBeGreaterThan(0);
      }
    }
  });
  it('keeps all fit ratings sourced, bounded and honest about missing arrangements', () => {
    for (const assessment of familyFitAssessments) {
      for (const c of Object.values(assessment.criteria)) {
        if (c.rating !== 'unknown') expect(c.sourceIds.length).toBeGreaterThan(0);
        for (const id of c.sourceIds) expect(sourceMap.has(id)).toBe(true);
      }
      const fit = calculateFamilyFit(assessment);
      if (fit.score !== null) {
        expect(fit.score).toBeGreaterThanOrEqual(2);
        expect(fit.score).toBeLessThanOrEqual(9);
      }
      if (assessment.scope === 'unknown' || assessment.criteria.arrangement.rating === 'unknown') {
        expect(fit.score).toBeNull();
        expect(vehicles.find(v => v.id === assessment.vehicleId)!.familyFit.status).not.toMatch(/^tested/);
      }
      expect(fit.confidence).toBeGreaterThanOrEqual(0);
      expect(fit.confidence).toBeLessThanOrEqual(.8);
    }
  });
  it('distinguishes Model Y cabin practicality from constrained RAV4 evidence without changing user weights', () => {
    const category = (id: string) => scoreVehicle(vehicles.find(v => v.id === id)!, emptyPersonal()).categories.find(c => c.key === 'seating')!;
    const tesla = category('model-y-rwd-2022');
    const rav4 = category('rav4-gxl-hev-2021-25');
    expect(tesla.score).toBeGreaterThan(rav4.score!);
    expect(tesla.breakdown?.find(c => c.label.includes('clearance'))?.score).toBeGreaterThan(rav4.breakdown?.find(c => c.label.includes('clearance'))?.score!);
    expect(tesla.breakdown?.find(c => c.label.includes('buckle'))?.score).toBeNull();
    expect(rav4.breakdown?.find(c => c.label.includes('buckle'))?.score).toBeNull();
    expect(tesla.weight).toBe(rav4.weight);
  });
  it('does not reject the Atto mixed arrangement merely because three forward-facing seats were constrained', () => {
    const fit = familyFitAssessments.find(a => a.vehicleId === 'atto3-standard-2022')!;
    expect(fit.criteria.arrangement.rating).not.toBe('restricted');
    expect(calculateFamilyFit(fit).score).toBeGreaterThan(2);
    expect(fit.criteria.arrangement.detail).toMatch(/rear.facing|capsule/i);
  });
  it('withholds scores for unestablished or unresolved mixed arrangements', () => {
    for (const id of ['ev6-air-2022', 'ev5-air-standard-2024', 'ev5-air-long-2024', 'outlander-phev-aspire-20', 'outlander-phev-aspire-227']) {
      const fit = familyFitAssessments.find(a => a.vehicleId === id)!;
      expect(fit.criteria.arrangement.rating).toBe('unknown');
      expect(calculateFamilyFit(fit).score).toBeNull();
      const category = scoreVehicle(vehicles.find(v => v.id === id)!, emptyPersonal()).categories.find(c => c.key === 'seating')!;
      expect(category.effectiveWeight).toBe(0);
      if (!id.includes('227')) expect(fit.criteria.space.rating).not.toBe('unknown');
    }
    expect(calculateFamilyFit(familyFitAssessments.find(a => a.vehicleId === 'ioniq5-awd-2021')!).score).toBeGreaterThan(8);
  });
});
