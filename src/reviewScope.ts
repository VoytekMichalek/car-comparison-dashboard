import type { Vehicle } from './types';

export function reviewScope(v: Vehicle): { factor: number; note: string } {
  if (v.familyId === 'byd-atto-3' && /EVO/i.test(v.variant + v.generation)) return { factor: 0, note: 'Original Atto 3 reviews are reference only; excluded from this EVO score.' };
  if (v.familyId === 'hyundai-ioniq-5' && /84 kWh/i.test(v.variant)) return { factor: 0, note: 'Early-generation reviews do not establish the refreshed 84 kWh model’s owner rating; excluded from its score.' };
  if (v.familyId === 'toyota-rav4-hybrid' && /sixth|XA60/i.test(v.generation)) return { factor: 0, note: 'Previous-generation reviews are reference only; excluded from the new-generation score.' };
  if (v.familyId === 'toyota-rav4-hybrid') return { factor: 1, note: 'FWD hybrid aggregate matches this drivetrain, but mixes trims and years.' };
  if (v.familyId === 'mitsubishi-outlander-phev') return { factor: /22\.7/.test(v.variant) ? .25 : .5, note: 'The four-post aggregate includes an older-generation 2021 GSR; it is not a clean sample of this battery and generation.' };
  if (v.familyId === 'kia-ev6') return { factor: .5, note: 'Only one of the two contributions describes ownership; the other is a borrowed-car expert review.' };
  if (v.familyId === 'tesla-model-y') return { factor: /Juniper/i.test(v.generation + v.variant) ? .5 : .75, note: 'Aggregate mixes generations and includes test-drive or expert contributions; it is not a verified owner-only sample.' };
  if (v.familyId === 'hyundai-ioniq-5') return { factor: .65, note: 'The eight-post early-car aggregate includes two borrowed-car expert reviews and mixes variants.' };
  if (v.familyId === 'byd-sealion-6') return { factor: /Extended/i.test(v.variant) ? .3 : .6, note: 'Mixed variants and ownership stages, including lease or dealer-only accounts; no isolated Extended Range sample.' };
  if (v.familyId === 'kia-ev5') return { factor: .1, note: 'One GT-Line delivery-focused post has minimal relevance to an Air ownership assessment.' };
  if (v.familyId === 'kia-sorento') return { factor: .25, note: 'Mixed petrol/diesel/hybrid aggregate has limited relevance to hybrid-specific ownership.' };
  if (v.familyId === 'nissan-x-trail-epower' && v.drive.toUpperCase().includes('FWD')) return { factor: .25, note: 'Earlier Ti AWD owner reviews are only a limited reference for the newer FWD powertrain.' };
  return { factor: 1, note: 'Use the stated model/variant scope and sample limits below.' };
}
