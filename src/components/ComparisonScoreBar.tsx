type ComparisonScoreBarProps = {
  score: number | null;
  label: string;
  emptyLabel?: string;
};

export function ComparisonScoreBar({ score, label, emptyLabel = 'No data' }: ComparisonScoreBarProps) {
  if (score === null || !Number.isFinite(score)) {
    return <span className="score-bar score-bar--empty"><span className="score-bar__value">{emptyLabel}</span></span>;
  }

  const value = Math.min(10, Math.max(0, score));
  const colour = value >= 7 ? 'green' : value >= 4 ? 'amber' : 'red';
  const displayedValue = value.toFixed(1);

  return <span
    className={`score-bar score-bar--${colour}`}
    role="meter"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={10}
    aria-valuenow={value}
    aria-valuetext={`${displayedValue} out of 10`}
  >
    <span className="score-bar__value">{displayedValue}<small>/10</small></span>
    <span className="score-bar__track" aria-hidden="true"><span className="score-bar__fill" style={{ width: `${value * 10}%` }} /></span>
  </span>;
}
