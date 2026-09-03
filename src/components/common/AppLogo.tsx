import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'emblem' | 'icon' | 'badge';
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'Hartbeesfontein Landbouvereniging',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  const dimension = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${dimension} ${className}`}
      title="Hartbeesfontein Landbouvereniging"
    >
      <img
        src="/icons/icon.svg"
        alt={alt}
        className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback if needed
          const target = e.currentTarget;
          if (target.src !== '/logo.svg') {
            target.src = '/logo.svg';
          }
        }}
      />
    </div>
  );
};

export default AppLogo;
