/** Auto-focus the visible scores, with half-point ticks and an explicit full-scale alternative. */
export function scoreAxis(values: number[], fullScale = false) {
  const finite = values.filter(n => Number.isFinite(n) && n >= 1 && n <= 10);
  if (fullScale || !finite.length) return { min: 1, max: 10, ticks: [1, 2, 4, 6, 8, 10] };
  let min = Math.max(1, Math.floor((Math.min(...finite) - .35) * 2) / 2);
  let max = Math.min(10, Math.ceil((Math.max(...finite) + .35) * 2) / 2);
  if (max - min < 2) {
    const centre = (min + max) / 2;
    min = Math.max(1, Math.floor((centre - 1) * 2) / 2);
    max = Math.min(10, min + 2);
    min = Math.max(1, max - 2);
  }
  const step = max - min > 4 ? 1 : .5;
  const ticks = Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step);
  if (ticks.at(-1) !== max) ticks.push(max);
  return { min, max, ticks };
}

export function yearLabelStep(width: number, horizon: number) {
  return width >= 1000 || horizon <= 5 ? 1 : 2;
}

/** Keep selected-point annotations inside the plot even at its corners. */
export function pointLabelPosition(x: number, y: number, width: number, left: number, right: number, top: number, bottom: number) {
  const boxWidth = Math.min(205, Math.max(90, width - left - right - 8));
  const boxHeight = 56;
  const preferredX = x > width / 2 ? x - boxWidth - 16 : x + 16;
  const preferredY = y - boxHeight - 16 < top ? y + 18 : y - boxHeight - 16;
  return { x: Math.max(left + 4, Math.min(preferredX, width - right - boxWidth - 4)), y: Math.max(top + 4, Math.min(preferredY, bottom - boxHeight - 4)), width: boxWidth, height: boxHeight };
}
