interface StarIconProps {
  className?: string;
  style?: React.CSSProperties;
  filled?: boolean;
}

export default function StarIcon({ className = 'w-6 h-6', style, filled = true }: StarIconProps) {
  return (
    <img
      src="/zvezdicadarkbrown.svg"
      alt="star"
      className={className}
      style={{ ...style, display: 'inline-block' }}
    />
  );
}
