import { Star, ShieldCheck } from 'lucide-react';
import { brandFor, reviewFor, expertReviews } from '../data';
import { formatDate } from '../lib';
import { categoryLabels, categoryRules, formatScore } from '../scoring';
import type { CategoryScore, ScoreResult } from '../scoring';
import type { Vehicle } from '../types';
import { SourceRefs } from './Shared';
import { reviewScope } from '../reviewScope';

export function ScoreBadge({ score, onClick }: { score: ScoreResult; onClick: () => void }) {
  return <button className="score-badge" onClick={onClick} aria-label={`${score.total === null ? 'Insufficient data for an overall score' : `Overall score ${formatScore(score.total)} out of 10`}. ${score.coverage}% evidence coverage${score.provisional ? '; provisional' : ''}. View scoring weights.`}><Star size={12} fill="currentColor" /><strong>{formatScore(score.total)}</strong>{score.total !== null && <span>/10</span>}</button>;
}
export function CategoryEvidence({ category: c }: { category: CategoryScore }) {
  return <><p>{c.reason} {!c.breakdown && <SourceRefs ids={c.sourceIds} />}</p>{c.breakdown && <div className="category-evidence-parts">{c.breakdown.map(part => <section key={part.label}><p><strong>{part.label}: {part.score === null ? 'Not established' : `${part.score}/10`}</strong><small>{Math.round(part.share * 100)}% of family-fit rubric{part.score === null ? ' · excluded' : ''}</small></p><p>{part.detail} <SourceRefs ids={part.sourceIds} /></p></section>)}</div>}</>;
}
export function ScoreBreakdown({ score }: { score: ScoreResult }) {
  return <section className="score-breakdown">
    <div className="score-summary"><div><p className="eyebrow">YOUR WEIGHTED SCORE</p><strong>{formatScore(score.total)}{score.total !== null && <span>/ 10</span>}</strong></div><div><span className={`coverage ${score.provisional ? 'low' : ''}`}>{score.coverage}% evidence coverage{score.provisional ? ' · Provisional' : ''}</span><p>{score.total === null ? 'Insufficient data to calculate an overall score.' : 'Missing data is excluded. Weaker evidence has less influence.'}</p></div></div>
    <div className="breakdown-rows">{score.categories.map(c => <details key={c.key}>
      <summary><span>{categoryLabels[c.key]}</span><span className="category-weight">Weight {c.weight}/10</span><strong className={c.score === null ? 'unscored-value' : undefined}>{!c.applicable ? 'Not applicable' : c.score === null ? 'No data' : <>{formatScore(c.score)}<small>/10</small></>}</strong></summary>
      <div><CategoryEvidence category={c} /><p className="micro muted">{!c.applicable ? 'Excluded from the total and evidence coverage.' : c.score === null ? 'No contribution to the overall score. This gap reduces evidence coverage.' : `Evidence factor ${Math.round(c.confidence * 100)}% · effective weight ${c.effectiveWeight.toFixed(2)} = importance ${c.weight} × ${c.confidence.toFixed(2)}.`}</p><p className="micro muted">{categoryRules[c.key]}</p></div>
    </details>)}</div>
    <p className="score-method-note">Overall = sum(category score × importance × evidence factor) ÷ sum(importance × evidence factor). Missing data adds no score or weight. Not-applicable categories are also excluded from coverage. Coverage compares effective weight with all applicable importance; below 60% is provisional. Evidence factors are editorial judgments, not probabilities. Compare coverage alongside the score: fewer known categories can change a ranking. Local quotes and fit confirmations can change your results.</p>
  </section>;
}
export function ReviewsPanel({ vehicle: v }: { vehicle: Vehicle }) {
  const review = reviewFor(v.familyId);
  const brand = brandFor(v.make);
  const scope = reviewScope(v);
  return <div className="reviews-panel"><section className="community-review"><h3><Star size={18} />People’s ratings</h3>{review?.rating != null ? <><div className="community-rating"><strong>{review.rating.toFixed(1)}<span>/{review.outOf}</span></strong><div><span className="review-stars" aria-hidden="true">{[1, 2, 3, 4, 5].map(n => <Star size={15} key={n} fill={n <= Math.round(review.rating!) ? 'currentColor' : 'none'} />)}</span><small>{review.count ?? 'Unverified count'} contributions · checked {formatDate(review.checked)}</small></div></div><p className="review-scope"><strong>{scope.factor === 0 ? 'Reference only — excluded from this score. ' : ''}</strong>{scope.note} {review.scope} <SourceRefs ids={review.sourceIds} /></p><p>{review.summary}</p>{(review.positiveThemes.length > 0 || review.negativeThemes.length > 0) && <div className="review-themes"><div><h4>Positive themes</h4><ul>{review.positiveThemes.map(t => <li key={t}>{t}</li>)}</ul></div><div><h4>Concerns raised</h4><ul>{review.negativeThemes.map(t => <li key={t}>{t}</li>)}</ul></div></div>}</> : <p>No suitable model-level aggregate verified. Brand/dealer ratings are not substituted. <SourceRefs ids={review?.sourceIds ?? []} /></p>}<p className="micro muted">Self-selected posts may mix trims, years and expert contributors. These are not verified failure rates. Small samples have less influence on your overall score.</p></section><ProfessionalReviews vehicle={v} />{brand && <section className="brand-review"><h3><ShieldCheck size={18} />Brand support</h3><span className="support-pill">{brand.support === 'established' ? 'Established Australian support' : brand.support === 'developing' ? 'Developing Australian network' : brand.support === 'limited' ? 'Limited verified support' : 'Support to verify'}</span><p>{brand.summary}</p><p>{brand.network} <SourceRefs ids={brand.sourceIds} /></p><p className="micro muted">{brand.warrantyNote}</p><p className="micro muted">Service access is a trust proxy. It does not establish a brand’s mechanical reliability or the condition of a used car.</p></section>}</div>;
}

function ProfessionalReviews({ vehicle }: { vehicle: Vehicle }) {
  const entries = expertReviews.filter(r => r.familyId === vehicle.familyId).sort((a, b) => Number(b.vehicleIds.includes(vehicle.id)) - Number(a.vehicleIds.includes(vehicle.id)));
  return <section className="professional-reviews"><h3>Professional reviews</h3><p className="micro muted">Published verdicts use each outlet’s method. They are separate from community ratings and your weighted score.</p>{entries.map(r => <details key={r.id}><summary><span>{r.tested}<small>{r.publisher} · {formatDate(r.published)} · {r.vehicleIds.includes(vehicle.id) ? 'Matching configuration / generation' : 'Other configuration — reference only'}</small></span><strong>{r.rating === null ? r.verdict : `${r.rating}/${r.outOf}`}</strong></summary><div><p>{r.scope} <SourceRefs ids={r.sourceIds} /></p><p><strong>Strengths: </strong>{r.positiveThemes.join(' ')}</p><p><strong>Concerns: </strong>{r.negativeThemes.join(' ')}</p></div></details>)}</section>;
}
