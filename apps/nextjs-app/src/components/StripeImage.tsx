type Tone = 'cool' | 'amber' | 'plum' | 'sage';
const tones: Record<Tone, [string, string]> = {
  cool: ['#1a2030', '#222a3d'],
  amber: ['#2a2218', '#352b1f'],
  plum: ['#221d2e', '#2c2638'],
  sage: ['#1c2620', '#243029'],
};
export default function StripeImage({
  width = '100%', height = 200, label = '', tone = 'cool', radius = 6,
}: { width?: number | string; height?: number; label?: string; tone?: Tone; radius?: number }) {
  const [a, b] = tones[tone];
  return (
    <div style={{
      width, height, borderRadius: radius, position: 'relative', overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${a} 0 8px, ${b} 8px 16px)`,
    }}>
      {label && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--text-faint)', letterSpacing: 0.5, textTransform: 'lowercase',
        }}>{label}</div>
      )}
    </div>
  );
}
