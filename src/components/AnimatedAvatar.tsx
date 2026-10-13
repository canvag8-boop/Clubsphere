import React from 'react';
import type { Gender } from '../types';

interface AnimatedAvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  gender?: Gender;
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const BORDER_GRADIENT_MAP = {
  male: 'from-blue-500 via-cyan-400 to-indigo-600',
  female: 'from-pink-500 via-rose-400 to-purple-600',
  other: 'from-emerald-500 via-teal-400 to-amber-500',
};

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  src,
  alt,
  size = 'md',
  gender,
  className = '',
}) => {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const gradient = gender ? BORDER_GRADIENT_MAP[gender] : 'from-indigo-500 to-purple-600';

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=0F172A&color=fff`;

  return (
    <div className={`relative inline-block shrink-0 ${sizeClass} ${className} group`}>
      {/* Animated gradient ring aura */}
      <div
        className={`absolute -inset-0.5 rounded-full bg-gradient-to-tr ${gradient} opacity-75 group-hover:opacity-100 transition-opacity animate-pulse blur-[1px]`}
      />

      {/* Main avatar image */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white shadow-sm">
        <img
          src={src || defaultAvatar}
          alt={alt}
          className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultAvatar;
          }}
        />
      </div>

      {/* Subtle floating gender badge indicator for lg/xl */}
      {(size === 'lg' || size === 'xl') && gender && (
        <span
          className={`absolute -bottom-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-black shadow-md border-2 border-white ${
            gender === 'male'
              ? 'bg-blue-600 text-white w-5 h-5'
              : gender === 'female'
              ? 'bg-pink-600 text-white w-5 h-5'
              : 'bg-emerald-600 text-white w-5 h-5'
          }`}
          title={`Gender: ${gender}`}
        >
          {gender === 'male' ? '♂' : gender === 'female' ? '♀' : '✦'}
        </span>
      )}
    </div>
  );
};
