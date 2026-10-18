import type { Vehicle } from './types';

export function reviewScope(v: Vehicle): { factor: number; note: string } {
  if (v.familyId === 'mitsubishi-outlander-petrol') return { factor: .6, note: 'Tiny LS FWD category mixes years and includes a loan-car contribution; reduced relevance to original-model ownership.' };
  if (v.familyId === 'hyundai-tucson') return { factor: .25, note: 'NX4 aggregate mixes engines, facelift hybrids and borrowed-car professional contributions; limited relevance to the original base 2.0 petrol.' };
  if (v.familyId === 'kia-carnival') return { factor: .5, note: 'KA4 owner aggregate mixes petrol, diesel and facelift variants; limited relevance to the original S diesel.' };
  if (v.familyId === 'subaru-outback') return { factor: .5, note: 'Sixth-generation owner aggregate mixes Sport, Touring and turbo XT reports; limited relevance to the non-turbo 2.5 base.' };
  if (v.familyId === 'subaru-forester' && /sixth|\bS6\b/i.test(v.generation)) return { factor: 0, note: 'The S5 owner aggregate is reference only; it does not establish the sixth-generation Forester’s owner rating.' };
  if (v.familyId === 'subaru-forester') return { factor: .5, note: 'Previous-generation aggregate mixes years, trims and engines; limited relevance to the specific 2.5i-L.' };
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
