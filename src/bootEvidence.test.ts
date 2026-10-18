import { describe, expect, it } from 'vitest';
import { bootEvidenceFor, bootEvidenceRecords, bootEvidenceSchema, cargoFor } from './cargo';

describe('boot-capacity evidence and scoring proxies', () => {
  it('keeps Tesla published cargo separate from independently measured scoring storage', () => {
    for (const id of ['model-y-rwd-2022', 'model-y-long-range-2023', 'model-y-rwd-juniper-2025']) {
      const evidence = bootEvidenceFor(id)!;
      expect(evidence.scoreLitres).toBe(420 + 105);
      expect(evidence.measurement).toBe('independent-proxy');
      expect(evidence.estimated).toBe(true);
      expect(evidence.evidenceFactor).toBeLessThan(1);
      expect(evidence.scoreBasis).toContain('Front storage is excluded');
      expect(cargoFor(id)!.rearSeatsUpLitres).toBeGreaterThan(evidence.scoreLitres);
    }
  });

  it('reduces the influence of roof-height and related-market cargo claims', () => {
    const roof = bootEvidenceFor('xtrail-ti-epower-awd')!;
    expect(roof.measurement).toBe('roof');
    expect(roof.estimated).toBe(true);
    expect(roof.evidenceFactor).toBeLessThan(.5);
    expect(bootEvidenceFor('zeekr7x-rwd-2025')!.caveat).toContain('related-market corroboration');
    expect(bootEvidenceFor('outlander-phev-aspire-20')!.caveat).toContain('485 L');
  });

  it('validates unique configurations, non-zero scoring capacity and honest estimate labels', () => {
    const original = bootEvidenceRecords[0];
    expect(bootEvidenceSchema.safeParse([original, original]).success).toBe(false);
    expect(bootEvidenceSchema.safeParse([{ ...original, scoreLitres: 0 }]).success).toBe(false);
    expect(bootEvidenceSchema.safeParse([{ ...original, evidenceFactor: 1.1 }]).success).toBe(false);
    expect(bootEvidenceSchema.safeParse([{ ...original, estimated: false }]).success).toBe(false);
    expect(bootEvidenceSchema.safeParse([{ ...original, sourceIds: [] }]).success).toBe(false);
    expect(bootEvidenceFor('unresearched-configuration')).toBeUndefined();
  });
});
