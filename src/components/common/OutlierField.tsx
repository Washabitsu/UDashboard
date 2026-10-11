// The picture on the login page: rows of records that all look alike and one that doesn't.
// It is the same idea as the logo, drawn large.
export function OutlierField() {
  const columns = 13;
  const rows = 9;
  const gap = 34;
  const dots: { x: number; y: number }[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      dots.push({ x: 12 + column * gap, y: 12 + row * gap });
    }
  }

  // Between two rows and two columns, where no regular dot is
  const outlier = { x: 12 + 8.5 * gap, y: 12 + 3.5 * gap };

  return (
    <svg
      viewBox={`0 0 ${24 + (columns - 1) * gap} ${24 + (rows - 1) * gap}`}
      className="w-full max-w-md"
      role="img"
      aria-label="A grid of identical dots with one amber dot out of line"
    >
      {dots.map((dot) => (
        <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r="2.5" fill="currentColor" opacity="0.35" />
      ))}
      <circle className="outlier-ring" cx={outlier.x} cy={outlier.y} r="7" fill="none" stroke="var(--signal)" strokeWidth="1.5" />
      <circle cx={outlier.x} cy={outlier.y} r="5.5" fill="var(--signal)" />
    </svg>
  );
}
