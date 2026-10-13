import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  // Map common strings to Lucide icon components
  const iconMap: Record<string, any> = {
    Code: Icons.Code,
    Cpu: Icons.Cpu,
    Trophy: Icons.Trophy,
    Music: Icons.Music,
    Camera: Icons.Camera,
    Sparkles: Icons.Sparkles,
    Zap: Icons.Zap,
    Users: Icons.Users,
    Crown: Icons.Crown,
    Terminal: Icons.Terminal,
    Flame: Icons.Flame,
    Medal: Icons.Medal,
    Award: Icons.Award,
    Calendar: Icons.Calendar,
    MapPin: Icons.MapPin,
    Clock: Icons.Clock,
    CheckCircle: Icons.CheckCircle,
    Star: Icons.Star,
    Compass: Icons.Compass,
    BookOpen: Icons.BookOpen,
    Palette: Icons.Palette,
    Dumbbell: Icons.Dumbbell,
  };

  const IconComponent = iconMap[name] || (Icons as any)[name] || Icons.Sparkles;

  return <IconComponent className={className} size={size} />;
};
