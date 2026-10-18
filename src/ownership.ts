import { calculateEnergy, defaultOwnership, representativePrice, isFuelOnly, isPlugIn } from './lib';
import { budgetBenchmarks, getPrice, insuranceFor, ownershipFor, qldCosts, tyreFor, repairReserveFor } from './data';
import type { CostSettings, OwnershipSettings, PersonalData, Powertrain, Vehicle } from './types';
import insuranceDefaults from './data/insurance-defaults.json';

export function settingsFor(personal: PersonalData): OwnershipSettings {
  const saved = personal.ownership;
  return { ...defaultOwnership, ...saved, repairMode: saved?.repairMode ?? (saved && saved.repairReserve !== defaultOwnership.repairReserve ? 'shared' : 'vehicle'), vehicleOverrides: saved?.vehicleOverrides ?? {} };
}
export function registrationGroup(v: Vehicle) {
  if (v.powertrain === 'BEV' || v.familyId === 'nissan-x-trail-epower') return qldCosts.bev;
  if (['mitsubishi-outlander-phev', 'byd-sealion-6', 'toyota-rav4-hybrid', 'toyota-kluger-hybrid', 'kia-sorento', 'subaru-forester', 'subaru-outback', 'kia-sportage', 'hyundai-tucson', 'kia-carnival', 'mitsubishi-outlander-petrol', 'nissan-x-trail-petrol'].includes(v.familyId)) return qldCosts.fourCylinder;
  return null;
}
export function registrationCost(v: Vehicle, settings: OwnershipSettings) {
  const group = registrationGroup(v);
  const override = settings.vehicleOverrides[v.id]?.rego ?? settings.regoOverride;
  const ctp = settings.ctp ?? (group ? (group.ctpLow + group.ctpHigh) / 2 : 0);
  return { total: override ?? (group ? group.registration + group.trafficFee + ctp : null), group, ctp, overridden: override !== null && override !== undefined, assumedCtp: settings.ctp === null };
}
export function qldDuty(value: number, powertrain: Powertrain = 'BEV'): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  const rates = powertrain === 'PETROL' || powertrain === 'DIESEL' ? qldCosts.duty.conventionalFourCylinder : qldCosts.duty;
  return Math.ceil(value / 100) * (value > qldCosts.duty.threshold ? rates.higherRatePer100 : rates.lowerRatePer100);
}
export function energyBudget(v: Vehicle, settings: CostSettings) {
  const familyInfo = ownershipFor(v.familyId);
  const info = familyInfo ? { ...familyInfo, ...familyInfo.serviceByVehicle?.[v.id] } : undefined;
  const strict = calculateEnergy(v, settings);
  const neededElectric = v.powertrain === 'BEV' || v.powertrain === 'PHEV' && settings.electricShare > 0;
  const neededPetrol = v.powertrain === 'PHEV' && settings.electricShare < 100;
  const electricProxy = neededElectric && (v.consumption.value === null || !v.consumption.energyBasis || v.consumption.energyBasis === 'unspecified') ? info?.energyEstimate : undefined;
  const petrolProxy = neededPetrol && v.depletedConsumption.value === null ? info?.depletedEstimate : undefined;
  const proxy = Boolean(electricProxy || petrolProxy);
  const substitute = (end: 'low' | 'point' | 'high'): Vehicle => ({ ...v,
    consumption: electricProxy ? { value: electricProxy[end], unit: 'kWh/100km', basis: electricProxy.basis, sourceIds: electricProxy.sourceIds, energyBasis: 'battery' } : v.consumption,
    depletedConsumption: petrolProxy ? { value: petrolProxy[end], unit: 'L/100km', basis: petrolProxy.basis, sourceIds: petrolProxy.sourceIds } : v.depletedConsumption,
  });
  const result = proxy ? calculateEnergy(substitute('point'), settings) : strict;
  const low = proxy ? calculateEnergy(substitute('low'), settings).total : result.total;
  const high = proxy ? calculateEnergy(substitute('high'), settings).total : result.total;
  const consumptionReason = proxy ? `Planning proxy. ${[electricProxy?.basis, petrolProxy?.basis].filter(Boolean).join(' ')}` : result.reason;
  const fuelRate = v.fuel?.planningRon === 95 ? settings.premiumPetrolRate ?? settings.petrolRate : settings.petrolRate;
  const fuelReason = v.fuel && (isFuelOnly(v.powertrain) || neededPetrol) ? ` ${v.fuel.planningRon} RON planning rate: A$${fuelRate.toFixed(2)}/L. ${v.fuel.basis}` : '';
  const reason = consumptionReason + fuelReason + (v.powertrain === 'DIESEL' ? ` Diesel planning rate: A$${(settings.dieselRate ?? settings.petrolRate).toFixed(2)}/L.` : '');
  return { ...result, low, high, proxy, reason, confidence: proxy || v.fuel?.confidence === 'low' ? .35 : .75, sourceIds: [...(electricProxy?.sourceIds ?? v.consumption.sourceIds), ...(petrolProxy?.sourceIds ?? (v.powertrain === 'PHEV' ? v.depletedConsumption.sourceIds : [])), ...(v.fuel?.sourceIds ?? [])] };
}
export function ownershipEstimate(v: Vehicle, personal: PersonalData) {
  const s = settingsFor(personal);
  const override = s.vehicleOverrides[v.id] ?? {};
  const familyInfo = ownershipFor(v.familyId);
  const info = familyInfo ? { ...familyInfo, ...familyInfo.serviceByVehicle?.[v.id] } : undefined;
  const insuranceReference = insuranceFor(v.familyId);
  const tyreReference = tyreFor(v.id);
  const energyResult = energyBudget(v, personal.costs);
  const legacyEnergy = override.energy != null && override.electricity == null && override.petrol == null;
  const electricFraction = energyResult.total ? energyResult.electric / energyResult.total : v.powertrain === 'BEV' ? 1 : isFuelOnly(v.powertrain) ? 0 : personal.costs.electricShare / 100;
  const electricity = isFuelOnly(v.powertrain) ? 0 : override.electricity ?? (legacyEnergy ? override.energy! * electricFraction : energyResult.total === null ? null : energyResult.electric);
  const petrol = v.powertrain === 'BEV' ? 0 : override.petrol ?? (legacyEnergy ? override.energy! * (1 - electricFraction) : energyResult.total === null ? null : energyResult.petrol);
  const energy = electricity === null || petrol === null ? null : electricity + petrol;
  const sharedTyres = s.tyreMode === 'shared' ? s.tyres : null;
  const tyreInput = override.tyres ?? sharedTyres;
  const annualKm = personal.costs.annualKm;
  const tyres = tyreInput ?? (tyreReference ? Math.round(tyreReference.setCost * annualKm / tyreReference.lifeKm / 10) * 10 : budgetBenchmarks.tyresAnnual.point * annualKm / 15000);
  const reserveReference = repairReserveFor(v.id);
  const reserveInput = override.repairReserve ?? (s.repairMode === 'shared' ? s.repairReserve : null);
  const reserve = reserveInput ?? reserveReference?.point ?? s.repairReserve;
  const finance = override.financeInterestAnnual ?? s.financeInterestAnnual;
  const insuranceDefault = insuranceDefaults.find(item => item.vehicleId === v.id);
  const insuranceBudget = override.insurance ?? s.insurance;
  const insuranceInput = insuranceBudget ?? null;
  const insurance = insuranceInput ?? insuranceDefault?.annual ?? insuranceReference?.point ?? null;
  const serviceInput = override.servicing ?? s.servicing;
  const servicing = serviceInput ?? info?.serviceAnnual ?? null;
  const rego = registrationCost(v, s);
  const confidenceValue = (c?: string) => c === 'high' ? .85 : c === 'medium' ? .6 : .35;
  const evidence = {
    reserve: { estimated: reserveInput == null, low: reserveInput ?? reserveReference?.low ?? reserve, high: reserveInput ?? reserveReference?.high ?? reserve, basis: reserveInput != null ? 'Your repair savings allowance; not predicted expenditure.' : reserveReference?.basis ?? 'Unverified fallback repair savings allowance.', confidence: reserveInput != null ? 1 : .35, sourceIds: reserveReference?.sourceIds ?? [] },
    energy: { estimated: !legacyEnergy && (isPlugIn(v.powertrain) && override.electricity == null || v.powertrain !== 'BEV' && override.petrol == null), low: legacyEnergy || override.electricity != null || override.petrol != null ? energy : energyResult.low, high: legacyEnergy || override.electricity != null || override.petrol != null ? energy : energyResult.high, basis: legacyEnergy ? 'Your saved total energy budget; electricity/fuel split uses the calculated energy mix.' : override.electricity != null || override.petrol != null ? 'Your electricity/fuel overrides, with the model estimate for any blank field.' : energyResult.reason, confidence: legacyEnergy || (isFuelOnly(v.powertrain) || override.electricity != null) && (v.powertrain === 'BEV' || override.petrol != null) ? 1 : energyResult.confidence, sourceIds: energyResult.sourceIds },
    electricity: { estimated: isPlugIn(v.powertrain) && override.electricity == null && !legacyEnergy, basis: legacyEnergy ? 'Your total energy budget, allocated using the calculated electric/fuel mix.' : override.electricity != null ? 'Your annual electricity budget' : energyResult.reason, sourceIds: energyResult.sourceIds },
    petrol: { estimated: v.powertrain !== 'BEV' && override.petrol == null && !legacyEnergy, basis: legacyEnergy ? 'Your total energy budget, allocated using the calculated electric/fuel mix.' : override.petrol != null ? 'Your annual fuel budget' : energyResult.reason, sourceIds: energyResult.sourceIds },
    insurance: { estimated: insuranceInput == null, low: insuranceInput ?? insuranceDefault?.low ?? insuranceReference?.low ?? null, high: insuranceInput ?? insuranceDefault?.high ?? insuranceReference?.high ?? null, basis: insuranceBudget != null ? 'Your insurance quote / budget' : insuranceDefault?.basis ?? insuranceReference?.basis ?? 'No insurance estimate', confidence: insuranceInput != null ? 1 : confidenceValue(insuranceDefault?.confidence ?? insuranceReference?.confidence), sourceIds: insuranceInput != null ? [] : insuranceReference?.sourceIds ?? [] },
    servicing: { estimated: serviceInput == null, low: serviceInput ?? info?.serviceLow ?? servicing, high: serviceInput ?? info?.serviceHigh ?? servicing, basis: serviceInput != null ? 'Your service quote / budget' : info?.serviceBasis ?? 'No service estimate', confidence: serviceInput != null ? 1 : confidenceValue(info?.serviceConfidence), sourceIds: info?.sourceIds ?? [] },
    rego: { estimated: !rego.overridden && rego.assumedCtp, low: rego.overridden || !rego.assumedCtp ? rego.total : rego.group ? rego.group.registration + rego.group.trafficFee + rego.group.ctpLow : null, high: rego.overridden || !rego.assumedCtp ? rego.total : rego.group ? rego.group.registration + rego.group.trafficFee + rego.group.ctpHigh : null, basis: 'Official QLD rates; CTP midpoint unless quoted.', confidence: .95, sourceIds: rego.group?.sourceIds ?? [] },
    tyres: { estimated: tyreInput == null, low: tyreInput ?? (tyreReference ? Math.round(tyreReference.setLow * annualKm / tyreReference.lifeHighKm / 10) * 10 : tyres), high: tyreInput ?? (tyreReference ? Math.round(tyreReference.setHigh * annualKm / tyreReference.lifeLowKm / 10) * 10 : tyres), basis: tyreInput != null ? 'Your tyre replacement allowance' : tyreReference?.basis ?? budgetBenchmarks.tyresAnnual.basis, confidence: tyreInput != null ? 1 : .35, sourceIds: tyreReference?.sourceIds ?? budgetBenchmarks.tyresAnnual.sourceIds },
  };
  const components = { energy, insurance, rego: rego.total, servicing, tyres, reserve, finance };
  const missing = Object.entries(components).filter(([, value]) => value === null).map(([key]) => ({ energy: 'energy', insurance: 'insurance', rego: 'registration', servicing: 'servicing' }[key] ?? key));
  const annual = Object.values(components).reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const runningTotal = missing.length ? null : annual * s.years;
  const annualBeforeRepairFund = missing.length ? null : annual - reserve;
  const runningBeforeRepairFund = annualBeforeRepairFund === null ? null : annualBeforeRepairFund * s.years;
  const budgetEvidence = [evidence.energy, evidence.insurance, evidence.servicing, evidence.rego, evidence.tyres, evidence.reserve];
  const annualLow = annual + (evidence.energy.low ?? 0) - (energy ?? 0) + (evidence.insurance.low ?? 0) - (insurance ?? 0) + (evidence.servicing.low ?? 0) - (servicing ?? 0) + (evidence.rego.low ?? 0) - (rego.total ?? 0) + evidence.tyres.low - tyres + evidence.reserve.low - reserve;
  const annualHigh = annual + (evidence.energy.high ?? 0) - (energy ?? 0) + (evidence.insurance.high ?? 0) - (insurance ?? 0) + (evidence.servicing.high ?? 0) - (servicing ?? 0) + (evidence.rego.high ?? 0) - (rego.total ?? 0) + evidence.tyres.high - tyres + evidence.reserve.high - reserve;
  const runningConfidence = Math.min(...budgetEvidence.map(e => e.confidence));
  const price = getPrice(v.id);
  const purchaseInput = override.purchase ?? s.purchasePrice;
  const purchasePrice = purchaseInput ?? representativePrice(price);
  const feeSetting = override.feesIncluded ?? s.feesIncluded;
  const feesIncluded = feeSetting === 'yes' || feeSetting === 'auto' && price?.basis === 'drive-away';
  const dutyValue = override.dutiableValue ?? s.dutiableValue ?? purchasePrice;
  const duty = feesIncluded ? 0 : dutyValue === null ? null : qldDuty(dutyValue, v.powertrain);
  const transfer = feesIncluded ? 0 : qldCosts.transfer.amount;
  const ppsr = price?.condition === 'new' ? 0 : qldCosts.ppsr.amount;
  const upfront = (duty ?? 0) + transfer + ppsr + (isFuelOnly(v.powertrain) ? 0 : s.charger) + s.inspection + s.otherUpfront;
  const dep = budgetBenchmarks.depreciation[v.powertrain];
  const resaleInput = override.resale ?? s.resaleValue;
  const resaleEstimated = resaleInput == null;
  const resale = resaleInput ?? (purchasePrice === null ? null : Math.round(purchasePrice * (1 - dep.annualRate) ** s.years / 100) * 100);
  const resaleLow = resaleEstimated && purchasePrice !== null ? Math.round(purchasePrice * (1 - dep.highRate) ** s.years / 100) * 100 : resale;
  const resaleHigh = resaleEstimated && purchasePrice !== null ? Math.round(purchasePrice * (1 - dep.lowRate) ** s.years / 100) * 100 : resale;
  const depreciation = purchasePrice !== null && resale !== null ? (purchasePrice - resale) / s.years : null;
  const excessRepair = Math.max(0, s.repairScenario - reserve * s.years);
  const total = !missing.length && purchasePrice !== null && resale !== null && duty !== null ? annual * s.years + purchasePrice - resale + upfront + excessRepair : null;
  return { components, energyCosts: { electricity, petrol }, evidence, annual, runningTotal, annualBeforeRepairFund, runningBeforeRepairFund, annualLow, annualHigh, runningConfidence, missing, complete: !missing.length, energyReason: evidence.energy.basis, rego, info, purchasePrice, resale, resaleEstimated, resaleLow, resaleHigh, depreciation, feesIncluded, duty, transfer, ppsr, upfront, total, excessRepair };
}
