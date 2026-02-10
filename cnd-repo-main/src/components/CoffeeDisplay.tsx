import StarIcon from './StarIcon';

interface CoffeeDisplayProps {
  count: number;
  filled?: number;
  size?: 'sm' | 'md' | 'lg';
  displayNumber?: boolean;
}

export default function CoffeeDisplay({ count, filled = 0, size = 'md', displayNumber = true }: CoffeeDisplayProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const containerSize = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`flex flex-wrap ${containerSize[size]}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${sizeClasses[size]} transition-all duration-300`} style={i >= filled ? { opacity: 0.3 } : {}}>
            <StarIcon className="w-full h-full" />
          </div>
        ))}
      </div>
      {displayNumber && (
        <span className="font-bold text-2xl min-w-[4rem]" style={{ color: '#2e2a27' }}>
          {filled}/{count}
        </span>
      )}
    </div>
  );
}
