import { fitAssessmentFor, researchFor, researchItemLabels } from '../research';
import { familyFitTarget, fitCriterionLabels, fitCriterionWeights, fitRatingLabels, fitRatingScores } from '../familyFit';
import { formatDate } from '../lib';
import { reviewEvidenceFor } from '../reviewEvidence';
import type { FamilyFitCriterionKey, Vehicle } from '../types';
import { SourceRefs } from './Shared';

const statusLabels = { verified: 'Checked', estimate: 'Estimate', gap: 'Evidence gap', conflict: 'Conflicting evidence' };
export function FamilyFitEvidence({ vehicle }: { vehicle: Vehicle }) {
  const fit = fitAssessmentFor(vehicle.id);
  if (!fit) return null;
  return <section className="family-fit-evidence" aria-label="Detailed family-fit evidence"><h3>What the fit test establishes</h3><p><strong>Target: {familyFitTarget}.</strong></p><p>{fit.summary}</p><p className="micro muted">{fit.scope === 'exact' ? 'Matched configuration' : fit.scope === 'related' ? 'Related configuration — reduced influence' : 'No matched arrangement test'} · Published evidence; your own seats remain unconfirmed.</p><div className="fit-criteria-grid">{(Object.entries(fit.criteria) as [FamilyFitCriterionKey, typeof fit.criteria.arrangement][]).map(([key, c]) => <article key={key} className={`fit-criterion ${c.rating}`}><div><h4>{fitCriterionLabels[key]}</h4><span>{fitRatingScores[c.rating] === null ? 'Not established' : `${fitRatingScores[c.rating]}/10`}</span></div><p className="micro">{c.rating !== 'unknown' && <><strong>{fitRatingLabels[c.rating]}</strong> · </>}{Math.round(fitCriterionWeights[key] * 100)}% of fit score</p><p>{c.detail} <SourceRefs ids={c.sourceIds} /></p></article>)}</div></section>;
}

export function ResearchAudit({ vehicle }: { vehicle: Vehicle }) {
  const audit = researchFor(vehicle.familyId);
  if (!audit) return null;
  const ownerEvidence = reviewEvidenceFor(vehicle);
  const items = audit.audit.items.filter(item => item.vehicleIds.includes(vehicle.id)).map(item => item.key === 'reviews' && ownerEvidence.coverage ? { ...item, status: ownerEvidence.score === null ? 'gap' as const : 'verified' as const, finding: `${ownerEvidence.coverage.summary} ${ownerEvidence.count} eligible review/rating contributions across ${ownerEvidence.contributing.length} publisher cohorts; these are not unique people. The ratings section shows original scales, configuration matches and reference-only exclusions.`, sourceIds: ownerEvidence.coverage.sourceIds } : item);
  return <details className="panel research-audit"><summary>Item-by-item research check · {formatDate(audit.checked)}</summary><p>{audit.audit.summary}</p><p className="micro muted">Checked means the cited finding was reviewed. Estimates and unresolved details retain their labels; it does not mean every cost is known.</p><div className="research-audit-items">{items.map(item => <section key={item.key}><div><h4>{researchItemLabels[item.key]}</h4><span className={`audit-status ${item.status}`}>{statusLabels[item.status]}</span></div><p>{item.finding} <SourceRefs ids={item.sourceIds} /></p></section>)}</div></details>;
}
