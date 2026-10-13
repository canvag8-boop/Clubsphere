/**
 * Dynamic Animated SVG Avatar Generator
 * Generates custom vector SVG avatars with built-in CSS animations
 * based on gender (male, female, other) and seed.
 */

export type Gender = 'male' | 'female' | 'other';

export function generateAnimatedAvatar(gender: Gender = 'other', seed: string = 'student'): string {
  // Hash seed for minor deterministic variations
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  if (gender === 'male') {
    return generateMaleSvg(positiveHash);
  } else if (gender === 'female') {
    return generateFemaleSvg(positiveHash);
  } else {
    return generateNeutralSvg(positiveHash);
  }
}

function generateMaleSvg(hash: number): string {
  const bgGradients = [
    { from: '#1E3A8A', to: '#3B82F6' }, // Royal Blue
    { from: '#0F766E', to: '#14B8A6' }, // Teal
    { from: '#4338CA', to: '#6366F1' }, // Indigo
  ];
  const bg = bgGradients[hash % bgGradients.length];
  const hairColor = ['#1E293B', '#334155', '#475569', '#172554'][hash % 4];
  const hoodieColor = ['#3B82F6', '#0284C7', '#4F46E5', '#2563EB'][hash % 4];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bgM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg.from}" />
      <stop offset="100%" stop-color="${bg.to}" />
    </linearGradient>
    <linearGradient id="glowM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#818CF8" />
    </linearGradient>
    <filter id="shadowM" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>
  <style>
    @keyframes bobM {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(0.8deg); }
    }
    @keyframes blinkM {
      0%, 90%, 96%, 100% { transform: scaleY(1); }
      93% { transform: scaleY(0.1); }
    }
    @keyframes ringPulseM {
      0%, 100% { stroke-dashoffset: 0; opacity: 0.7; }
      50% { stroke-dashoffset: 24; opacity: 1; }
    }
    @keyframes sparkFloatM {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
      50% { transform: translate(2px, -3px) scale(1.3); opacity: 1; }
    }
    .head-m { transform-origin: 60px 75px; animation: bobM 3.8s ease-in-out infinite; }
    .eyes-m { transform-origin: 60px 58px; animation: blinkM 4.5s infinite; }
    .ring-m { animation: ringPulseM 6s linear infinite; }
    .spark-m { animation: sparkFloatM 3s ease-in-out infinite; }
  </style>

  <!-- Outer background circle -->
  <circle cx="60" cy="60" r="58" fill="url(#bgM)" />
  <!-- Animated cyber aura ring -->
  <circle cx="60" cy="60" r="56" fill="none" stroke="url(#glowM)" stroke-width="2.5" stroke-dasharray="14 6" class="ring-m" />

  <!-- Animated Sparkle -->
  <polygon points="98,22 100,28 106,30 100,32 98,38 96,32 90,30 96,28" fill="#BAE6FD" class="spark-m" />

  <!-- Avatar body & head group with floating animation -->
  <g class="head-m" filter="url(#shadowM)">
    <!-- Hoodie / Shoulders -->
    <path d="M26 112 C28 92 42 82 60 82 C78 82 92 92 94 112 Z" fill="${hoodieColor}" />
    <!-- Hoodie inner collar -->
    <path d="M46 82 C50 96 70 96 74 82 Z" fill="#1E293B" />
    <path d="M52 82 C55 90 65 90 68 82 Z" fill="#F87171" opacity="0.8" />

    <!-- Neck -->
    <rect x="52" y="68" width="16" height="18" rx="4" fill="#FBBF24" />

    <!-- Head base -->
    <rect x="38" y="34" width="44" height="42" rx="16" fill="#FDE68A" />

    <!-- Ears -->
    <circle cx="37" cy="55" r="5" fill="#FDE68A" />
    <circle cx="83" cy="55" r="5" fill="#FDE68A" />

    <!-- Modern stylish male hair -->
    <path d="M35 44 C34 26 48 20 62 20 C76 20 86 26 86 42 C82 36 76 34 68 34 C58 34 50 36 44 42 C40 44 36 44 35 44 Z" fill="${hairColor}" />
    <!-- Bangs quiff -->
    <path d="M40 32 C46 22 62 22 74 26 C68 28 58 28 50 34 Z" fill="${hairColor}" opacity="0.95" />

    <!-- Eyebrows -->
    <path d="M44 49 Q51 46 56 49" stroke="${hairColor}" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M64 49 Q69 46 76 49" stroke="${hairColor}" stroke-width="2.5" stroke-linecap="round" fill="none" />

    <!-- Animated Blinking Eyes -->
    <g class="eyes-m">
      <ellipse cx="50" cy="56" rx="3.5" ry="4" fill="#0F172A" />
      <ellipse cx="70" cy="56" rx="3.5" ry="4" fill="#0F172A" />
      <circle cx="51.5" cy="54.5" r="1.2" fill="#FFFFFF" />
      <circle cx="71.5" cy="54.5" r="1.2" fill="#FFFFFF" />
    </g>

    <!-- Nose -->
    <path d="M59 58 L58 64 L62 64" stroke="#D97706" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.8" />

    <!-- Confident Smile -->
    <path d="M52 68 Q60 74 68 68" stroke="#B45309" stroke-width="2.2" stroke-linecap="round" fill="none" />

    <!-- Cheek blush subtle -->
    <circle cx="43" cy="62" r="3" fill="#F87171" opacity="0.3" />
    <circle cx="77" cy="62" r="3" fill="#F87171" opacity="0.3" />

    <!-- Cool ear headphone / piercing -->
    <circle cx="36" cy="56" r="2" fill="#38BDF8" />
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function generateFemaleSvg(hash: number): string {
  const bgGradients = [
    { from: '#831843', to: '#EC4899' }, // Magenta / Rose
    { from: '#581C87', to: '#A855F7' }, // Purple
    { from: '#881337', to: '#FB7185' }, // Crimson Rose
  ];
  const bg = bgGradients[hash % bgGradients.length];
  const hairColor = ['#3B0764', '#1E1B4B', '#4C1D95', '#18181B'][hash % 4];
  const jacketColor = ['#EC4899', '#8B5CF6', '#F43F5E', '#D946EF'][hash % 4];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bgF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg.from}" />
      <stop offset="100%" stop-color="${bg.to}" />
    </linearGradient>
    <linearGradient id="glowF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F472B6" />
      <stop offset="100%" stop-color="#C084FC" />
    </linearGradient>
    <filter id="shadowF" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>
  <style>
    @keyframes bobF {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-3.2px) rotate(-0.8deg); }
    }
    @keyframes blinkF {
      0%, 88%, 94%, 100% { transform: scaleY(1); }
      91% { transform: scaleY(0.08); }
    }
    @keyframes ringPulseF {
      0%, 100% { stroke-dashoffset: 0; opacity: 0.75; }
      50% { stroke-dashoffset: -24; opacity: 1; }
    }
    @keyframes sparkleTwinkleF {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
      50% { transform: scale(1.4) rotate(45deg); opacity: 1; }
    }
    .head-f { transform-origin: 60px 75px; animation: bobF 3.5s ease-in-out infinite; }
    .eyes-f { transform-origin: 60px 57px; animation: blinkF 4.2s infinite; }
    .ring-f { animation: ringPulseF 6s linear infinite; }
    .sparkle-f { transform-origin: 22px 24px; animation: sparkleTwinkleF 2.8s ease-in-out infinite; }
  </style>

  <!-- Outer background circle -->
  <circle cx="60" cy="60" r="58" fill="url(#bgF)" />
  <!-- Glowing aura ring -->
  <circle cx="60" cy="60" r="56" fill="none" stroke="url(#glowF)" stroke-width="2.5" stroke-dasharray="12 6" class="ring-f" />

  <!-- Animated Star Sparkle -->
  <g class="sparkle-f">
    <path d="M22 16 L24 22 L30 24 L24 26 L22 32 L20 26 L14 24 L20 22 Z" fill="#FDF2F8" />
  </g>

  <!-- Avatar body & head group -->
  <g class="head-f" filter="url(#shadowF)">
    <!-- Back Hair Flow -->
    <path d="M30 42 C24 60 22 92 34 104 C40 100 40 88 40 80 Z" fill="${hairColor}" />
    <path d="M90 42 C96 60 98 92 86 104 C80 100 80 88 80 80 Z" fill="${hairColor}" />

    <!-- Shoulders / Jacket -->
    <path d="M28 112 C30 92 44 82 60 82 C76 82 90 92 92 112 Z" fill="${jacketColor}" />
    <!-- V-neck shirt -->
    <path d="M48 82 L60 98 L72 82 Z" fill="#FFFFFF" />

    <!-- Neck -->
    <rect x="53" y="68" width="14" height="17" rx="3" fill="#FED7AA" />

    <!-- Head base -->
    <rect x="39" y="34" width="42" height="41" rx="16" fill="#FFEDD5" />

    <!-- Ears -->
    <circle cx="38" cy="55" r="4.5" fill="#FFEDD5" />
    <circle cx="82" cy="55" r="4.5" fill="#FFEDD5" />
    <!-- Pearl Earrings -->
    <circle cx="38" cy="59" r="2" fill="#F472B6" />
    <circle cx="82" cy="59" r="2" fill="#F472B6" />

    <!-- Flowing styled female hair bangs -->
    <path d="M34 42 C34 24 48 18 60 18 C74 18 86 24 86 42 C84 34 76 30 64 30 C50 30 40 34 34 42 Z" fill="${hairColor}" />
    <!-- Side hair strand -->
    <path d="M35 38 C38 48 38 62 42 66 C40 56 40 44 38 38 Z" fill="${hairColor}" />
    <path d="M85 38 C82 48 82 62 78 66 C80 56 80 44 82 38 Z" fill="${hairColor}" />

    <!-- Cute Curved Eyebrows -->
    <path d="M44 48 Q50 45 55 48" stroke="${hairColor}" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M65 48 Q70 45 76 48" stroke="${hairColor}" stroke-width="2" stroke-linecap="round" fill="none" />

    <!-- Animated Blinking Big Eyes with Lashes -->
    <g class="eyes-f">
      <!-- Upper Lashes -->
      <path d="M44 52 Q50 48 56 52" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M64 52 Q70 48 76 52" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <ellipse cx="50" cy="56" rx="4" ry="4.5" fill="#4C1D95" />
      <ellipse cx="70" cy="56" rx="4" ry="4.5" fill="#4C1D95" />
      <circle cx="51.5" cy="54" r="1.5" fill="#FFFFFF" />
      <circle cx="71.5" cy="54" r="1.5" fill="#FFFFFF" />
      <circle cx="49" cy="58" r="0.8" fill="#FFFFFF" />
      <circle cx="69" cy="58" r="0.8" fill="#FFFFFF" />
    </g>

    <!-- Small nose -->
    <circle cx="60" cy="62" r="1.2" fill="#FB923C" />

    <!-- Cute Lip Gloss Smile -->
    <path d="M54 68 Q60 73 66 68" stroke="#E11D48" stroke-width="2.2" stroke-linecap="round" fill="none" />
    <ellipse cx="60" cy="69" rx="2" ry="0.8" fill="#FDA4AF" />

    <!-- Rosy blush cheeks -->
    <ellipse cx="44" cy="63" rx="4" ry="2.2" fill="#FB7185" opacity="0.4" />
    <ellipse cx="76" cy="63" rx="4" ry="2.2" fill="#FB7185" opacity="0.4" />
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function generateNeutralSvg(hash: number): string {
  const bgGradients = [
    { from: '#064E3B', to: '#10B981' }, // Emerald
    { from: '#78350F', to: '#F59E0B' }, // Amber
    { from: '#134E4A', to: '#06B6D4' }, // Cyan
  ];
  const bg = bgGradients[hash % bgGradients.length];
  const jacketColor = ['#10B981', '#06B6D4', '#F59E0B', '#6366F1'][hash % 4];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bgN" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg.from}" />
      <stop offset="100%" stop-color="${bg.to}" />
    </linearGradient>
    <linearGradient id="glowN" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
    <filter id="shadowN" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>
  <style>
    @keyframes bobN {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-3.5px); }
    }
    @keyframes blinkN {
      0%, 88%, 94%, 100% { transform: scaleY(1); }
      91% { transform: scaleY(0.1); }
    }
    @keyframes ringPulseN {
      0%, 100% { stroke-dashoffset: 0; opacity: 0.7; }
      50% { stroke-dashoffset: 20; opacity: 1; }
    }
    .head-n { transform-origin: 60px 75px; animation: bobN 3.6s ease-in-out infinite; }
    .eyes-n { transform-origin: 60px 57px; animation: blinkN 4.2s infinite; }
    .ring-n { animation: ringPulseN 5s linear infinite; }
  </style>

  <!-- Outer background circle -->
  <circle cx="60" cy="60" r="58" fill="url(#bgN)" />
  <circle cx="60" cy="60" r="56" fill="none" stroke="url(#glowN)" stroke-width="2.5" stroke-dasharray="15 5" class="ring-n" />

  <!-- Avatar body & head group -->
  <g class="head-n" filter="url(#shadowN)">
    <!-- Shoulders -->
    <path d="M26 112 C28 92 42 82 60 82 C78 82 92 92 94 112 Z" fill="${jacketColor}" />
    <path d="M48 82 C52 94 68 94 72 82 Z" fill="#0F172A" />

    <!-- Neck -->
    <rect x="52" y="68" width="16" height="18" rx="4" fill="#FDE047" />

    <!-- Head -->
    <rect x="38" y="34" width="44" height="42" rx="16" fill="#FEF08A" />

    <!-- Beanie Hat -->
    <path d="M36 42 C36 24 50 18 60 18 C70 18 84 24 84 42 Z" fill="#0F172A" />
    <rect x="34" y="38" width="52" height="10" rx="4" fill="#334155" />

    <!-- Cool Glasses Frame -->
    <rect x="42" y="50" width="15" height="12" rx="3" fill="#0284C7" fill-opacity="0.2" stroke="#0F172A" stroke-width="2" />
    <rect x="63" y="50" width="15" height="12" rx="3" fill="#0284C7" fill-opacity="0.2" stroke="#0F172A" stroke-width="2" />
    <line x1="57" y1="56" x2="63" y2="56" stroke="#0F172A" stroke-width="2" />

    <!-- Animated Blinking Eyes inside glasses -->
    <g class="eyes-n">
      <circle cx="49.5" cy="56" r="3" fill="#0F172A" />
      <circle cx="70.5" cy="56" r="3" fill="#0F172A" />
      <circle cx="51" cy="55" r="1" fill="#FFFFFF" />
      <circle cx="72" cy="55" r="1" fill="#FFFFFF" />
    </g>

    <!-- Smile -->
    <path d="M52 68 Q60 74 68 68" stroke="#A16207" stroke-width="2.2" stroke-linecap="round" fill="none" />
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const generateAnimatedAvatarDataUri = generateAnimatedAvatar;
