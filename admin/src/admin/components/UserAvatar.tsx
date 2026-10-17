import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 'md', className = '' }) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getGradient = (n: string) => {
    const charCode = n.charCodeAt(0) + (n.charCodeAt(1) || 0);
    const variants = [
      'from-indigo-500 to-purple-600 text-white',
      'from-blue-500 to-indigo-600 text-white',
      'from-violet-500 to-purple-700 text-white',
      'from-teal-500 to-emerald-600 text-white',
      'from-sky-500 to-blue-600 text-white',
    ];
    return variants[charCode % variants.length];
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br font-medium shrink-0 select-none shadow-xs ${sizeClasses[size]} ${getGradient(name)} ${className}`}
      aria-label={name}
    >
      <span>{getInitials(name)}</span>
    </div>
  );
};
