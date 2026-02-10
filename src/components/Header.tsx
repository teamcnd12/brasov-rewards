import { sr } from '../locales/sr';

interface HeaderProps {
  viewMode?: string;
  onViewModeChange?: (mode: string) => void;
}

export default function Header({ viewMode, onViewModeChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-0 flex justify-center">
        <img
          src="/logodarkbrown copy.svg"
          alt="Logo"
          className="w-16 h-16"
        />
      </div>
    </header>
  );
}
