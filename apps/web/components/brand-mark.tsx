export type BrandVariant = 'color' | 'black' | 'white';

export function BrandMark({
  variant = 'color',
  height = 72,
}: {
  variant?: BrandVariant;
  height?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/logo-${variant}.png`}
      alt="FlahaINSPECT"
      height={height}
      style={{ height, width: 'auto', background: 'transparent', display: 'block' }}
    />
  );
}
