interface StampCardProps {
  currentStamps: number;
  totalStamps?: number;
}

export default function StampCard({ currentStamps, totalStamps = 10 }: StampCardProps) {
  return (
    <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
      {Array.from({ length: totalStamps }).map((_, index) => (
        <div
          key={index}
          className={`aspect-square rounded-full border-4 transition-all duration-500 transform ${
            index < currentStamps
              ? 'bg-[#6F4E37] border-[#6F4E37] scale-100 shadow-lg'
              : 'bg-transparent border-[#6F4E37]/30 scale-95'
          }`}
          style={{
            transitionDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}
