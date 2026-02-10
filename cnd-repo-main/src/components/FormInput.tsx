import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isValid?: boolean;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  isValid,
  placeholder,
  maxLength,
  required,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold" style={{ color: '#2e2a27' }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full min-h-[44px] px-4 py-3 border rounded-lg transition-all duration-300 focus:outline-none bg-white placeholder:text-gray-400 ${
            error
              ? 'border-red-300 focus:border-red-500'
              : isValid
                ? 'border-green-500 focus:border-green-600'
                : 'border-gray-200 focus:border-gray-400'
          }`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}

          {!error && isValid && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
