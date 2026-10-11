// Nine dots in a grid, one of them out of line and in another colour:
// what an Isolation Forest does, find the record that doesn't belong.
export function BrandMark({ size = 28 }: { size?: number }) {
  const dots = [
    [4, 4], [14, 4], [24, 4],
    [4, 14], [14, 14], [24, 14],
    [4, 24], [14, 24],
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="currentColor" opacity="0.55" />
      ))}
      <circle cx="27" cy="27" r="3.6" fill="var(--signal)" />
    </svg>
  );
}
