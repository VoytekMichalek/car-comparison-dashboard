import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ComparisonScoreBar } from './components/ComparisonScoreBar';

const render = (score: number | null, emptyLabel?: string) => renderToStaticMarkup(createElement(ComparisonScoreBar, { score, label: 'Child-seat fit', emptyLabel }));

describe('comparison score bars', () => {
  it.each([
    [0, 'red'], [3.9, 'red'], [4, 'amber'], [6.9, 'amber'], [7, 'green'], [10, 'green'],
  ])('shows score %s on the shared 0–10 scale with its threshold colour', (score, colour) => {
    const markup = render(score);
    expect(markup).toContain(`score-bar--${colour}`);
    expect(markup).toContain('role="meter"');
    expect(markup).toContain('aria-label="Child-seat fit"');
    expect(markup).toContain('aria-valuemin="0"');
    expect(markup).toContain('aria-valuemax="10"');
    expect(markup).toContain(`aria-valuenow="${score}"`);
    expect(markup).toContain(`${score.toFixed(1)}<small>/10</small>`);
    expect(markup).toContain(`width:${score * 10}%`);
  });

  it.each([[-3, 0], [12, 10]])('clamps finite score %s to %s for display, colour and accessible value', (score, expected) => {
    const markup = render(score);
    expect(markup).toContain(`aria-valuenow="${expected}"`);
    expect(markup).toContain(`aria-valuetext="${expected.toFixed(1)} out of 10"`);
    expect(markup).toContain(`width:${expected * 10}%`);
    expect(markup).toContain(`score-bar--${expected === 0 ? 'red' : 'green'}`);
  });

  it.each([null, NaN, Infinity, -Infinity])('does not turn unavailable score %s into a zero or a meter', score => {
    const markup = render(score, 'Not comparable');
    expect(markup).toContain('score-bar--empty');
    expect(markup).toContain('Not comparable');
    expect(markup).not.toContain('role="meter"');
    expect(markup).not.toContain('score-bar__fill');
    expect(markup).not.toContain('aria-valuenow');
    expect(markup).not.toContain('/10');
  });

  it('uses the default missing-data label and remains valid inside a button', () => {
    expect(render(null)).toContain('Check evidence');
    const markup = renderToStaticMarkup(createElement('button', { type: 'button' }, createElement(ComparisonScoreBar, { score: 8.25, label: 'Boot space' })));
    expect(markup.match(/<button/g)).toHaveLength(1);
    expect(markup).toContain('8.3<small>/10</small>');
    expect(markup).toContain('score-bar__track" aria-hidden="true"');
  });
});
