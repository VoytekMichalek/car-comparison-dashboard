import { describe, expect, it } from 'vitest';
import { pointLabelPosition, scoreAxis, yearLabelStep } from './chartLayout';

describe('readable chart scales and labels', () => {
  it('keeps every valid score visible with useful space, including identical scores and extreme values', () => {
    for (const values of [[7.2, 8.1, 8.6], [8, 8], [1], [10], [1, 10], [6.7, 9.8], [1.9, 5.3]]) {
      const axis = scoreAxis(values);
      expect(axis.min).toBeLessThanOrEqual(Math.min(...values));
      expect(axis.max).toBeGreaterThanOrEqual(Math.max(...values));
      expect(axis.max - axis.min).toBeGreaterThanOrEqual(2);
      expect(axis.min).toBeGreaterThanOrEqual(1); expect(axis.max).toBeLessThanOrEqual(10);
      expect(axis.ticks.every((tick, i) => tick >= axis.min && tick <= axis.max && (!i || tick > axis.ticks[i - 1]))).toBe(true);
      expect(axis.ticks[0]).toBe(axis.min); expect(axis.ticks.at(-1)).toBe(axis.max);
    }
    expect(scoreAxis([NaN, Infinity])).toEqual(scoreAxis([], true));
    expect(scoreAxis([7, 8], true)).toEqual({ min: 1, max: 10, ticks: [1, 2, 4, 6, 8, 10] });
  });
  it('keeps point labels inside a narrow or wide plot at every corner', () => {
    for (const width of [230, 700, 1100]) for (const x of [48, width - 16]) for (const y of [50, 330]) {
      const box = pointLabelPosition(x, y, width, 48, 16, 50, 330);
      expect(box.x).toBeGreaterThanOrEqual(48); expect(box.x + box.width).toBeLessThanOrEqual(width - 16);
      expect(box.y).toBeGreaterThanOrEqual(50); expect(box.y + box.height).toBeLessThanOrEqual(330);
    }
  });
  it('reduces crowded ten-year labels while retaining annual labels on roomy or short charts', () => {
    expect(yearLabelStep(700, 10)).toBe(2); expect(yearLabelStep(1100, 10)).toBe(1); expect(yearLabelStep(700, 5)).toBe(1);
  });
});
