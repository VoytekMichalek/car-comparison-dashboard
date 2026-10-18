export type Powertrain = 'BEV' | 'PHEV' | 'HEV' | 'PETROL' | 'DIESEL';
export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
  kind: 'manufacturer' | 'safety' | 'family-test' | 'review' | 'market' | 'recall';
  checked: string;
}
export interface Fact {
  value: number | null;
  unit: string;
  basis: string;
  sourceIds: string[];
  energyBasis?: 'battery' | 'wall' | 'unspecified';
}
export interface Vehicle {
  id: string;
  familyId: string;
  make: string;
  model: string;
  variant: string;
  years: number[];
  generation: string;
  powertrain: Powertrain;
  seats: number;
  drive: string;
  headline: string;
  summary: string;
  range: Fact;
  battery: Fact;
  consumption: Fact;
  depletedConsumption: Fact;
  acCharging: Fact;
  dcCharging: Fact;
  chargeTime: string;
  connector: string;
  boot: Fact;
  bootAllRows: Fact;
  length: Fact;
  width: Fact;
  towing: Fact;
  warranty: string;
  batteryWarranty: string;
  servicing: string;
  safety: { stars: number | null; year: number | null; applicability: string; sourceIds: string[] };
  familyFit: {
    status: 'tested-three' | 'tested-multirow' | 'tested-related' | 'unverified' | 'limitations';
    summary: string;
    row2: string;
    row3: string;
    testedSeats: string;
    buckleAccess: string;
    access: string;
    ventilation: string;
    sourceIds: string[];
  };
  pros: string[];
  cons: string[];
  inspection: string[];
  changes: { period: string; text: string; sourceIds: string[] }[];
  gaps: string[];
  sourceIds: string[];
  checked: string;
  fuel?: { planningRon: 91 | 95; minimumRon: 91 | 95 | null; basis: string; confidence: Confidence; sourceIds: string[]; checked: string };
}
export interface PriceSnapshot {
  id: string;
  vehicleId: string;
  low: number | null;
  high: number | null;
  condition: 'used' | 'new';
  basis: 'drive-away' | 'excludes-charges' | 'mixed' | 'unverified';
  sampleCount: number;
  geography: string;
  kilometres: string;
  observed: string;
  note: string;
  sourceIds: string[];
  kind?: 'observation' | 'estimate';
  confidence?: Confidence;
  estimateBasis?: string;
  point?: number;
  observations?: { price: number; basis: PriceSnapshot['basis']; year: number | null; kilometres: number | null; location: string; url: string; sourceId: string; checked: string; note: string }[];
}
export interface ImageAsset {
  familyId: string;
  path: string;
  alt: string;
  credit: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  generation: string;
  note: string;
}
export interface Listing {
  id: string;
  vehicleId: string;
  title: string;
  url: string;
  price: number | null;
  kilometres: number | null;
  location: string;
  status: 'saved' | 'contacted' | 'test-drive' | 'inspected' | 'passed';
  notes: string;
}
export interface CostSettings {
  annualKm: number;
  homeRate: number;
  publicRate: number;
  petrolRate: number;
  premiumPetrolRate?: number;
  dieselRate?: number;
  homeShare: number;
  electricShare: number;
  chargingLoss: number;
}
export interface PersonalData {
  version: 1;
  favourites: string[];
  listings: Listing[];
  notes: Record<string, string>;
  fitChecks: Record<string, boolean>;
  seatModels: string;
  costs: CostSettings;
  ownership?: OwnershipSettings;
  weights?: ScoreWeights;
}

export interface RepairRisk {
  title: string;
  detail: string;
  low: number | null;
  high: number | null;
  priceBasis: string;
  warranty: string;
  sourceIds: string[];
  confidence?: Confidence;
}
export type Confidence = 'high' | 'medium' | 'low';
export interface BudgetEstimate {
  low: number;
  high: number;
  point: number;
  basis: string;
  confidence: Confidence;
  sourceIds: string[];
}
export interface InsuranceEstimate extends BudgetEstimate { familyId: string; checked: string }
export interface OwnershipInfo {
  serviceByVehicle?: Record<string, { serviceAnnual: number; serviceLow: number; serviceHigh: number; serviceBasis: string; serviceConfidence: Confidence }>;
  familyId: string;
  serviceInterval: string;
  serviceAnnual: number | null;
  serviceBasis: string;
  serviceLow?: number;
  serviceHigh?: number;
  serviceConfidence?: Confidence;
  energyEstimate?: BudgetEstimate;
  fuelEstimate?: BudgetEstimate;
  fuelByVehicle?: Record<string, BudgetEstimate>;
  depletedEstimate?: BudgetEstimate;
  warrantyCautions: string[];
  risks: RepairRisk[];
  sourceIds: string[];
  checked: string;
}
export interface OwnershipSettings {
  years: number;
  insurance: number | null;
  servicing: number | null;
  tyres: number;
  tyreMode?: 'vehicle' | 'shared';
  repairReserve: number;
  repairMode?: 'vehicle' | 'shared';
  regoOverride: number | null;
  ctp: number | null;
  purchasePrice: number | null;
  dutiableValue: number | null;
  feesIncluded: 'auto' | 'yes' | 'no';
  resaleValue: number | null;
  charger: number;
  inspection: number;
  otherUpfront: number;
  financeInterestAnnual: number;
  repairScenario: number;
  vehicleOverrides: Record<string, { insurance?: number | null; servicing?: number | null; rego?: number | null; resale?: number | null; energy?: number | null; electricity?: number | null; petrol?: number | null; tyres?: number | null; repairReserve?: number | null; financeInterestAnnual?: number | null; purchase?: number | null; dutiableValue?: number | null; feesIncluded?: 'auto' | 'yes' | 'no' }>;
}
export interface OwnerReview {
  familyId: string;
  rating: number | null;
  outOf: number;
  count: number | null;
  scope: string;
  summary: string;
  positiveThemes: string[];
  negativeThemes: string[];
  sourceIds: string[];
  checked: string;
}
export interface BrandInfo {
  make: string;
  support: 'established' | 'developing' | 'limited' | 'unverified';
  summary: string;
  network: string;
  warrantyNote: string;
  sourceIds: string[];
  checked: string;
}
export type ScoreCategory = 'seating' | 'price' | 'running' | 'boot' | 'range' | 'safety' | 'owners' | 'brand';
export type ScoreWeights = Record<ScoreCategory, number>;

export interface ExpertReview {
  id: string; familyId: string; vehicleIds: string[]; tested: string; scope: string;
  publisher: string; published: string; checked: string; rating: number | null;
  outOf: number; verdict: string; positiveThemes: string[]; negativeThemes: string[]; sourceIds: string[];
}
