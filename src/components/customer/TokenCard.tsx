import { Star } from 'lucide-react';

interface TokenCardProps {
  tokenBalance: number;
}

export default function TokenCard({ tokenBalance }: TokenCardProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="transform transition-all duration-500"
          style={{
            transitionDelay: `${index * 100}ms`,
          }}
        >
          <Star className="w-8 h-8 fill-[#FFD700] text-[#FFD700] drop-shadow-lg" />
        </div>
      ))}
    </div>
  );
}
