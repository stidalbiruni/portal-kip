import React, { useState, useEffect } from 'react';

interface AlBiruniLogoProps {
  className?: string;
  variant?: 'green' | 'white' | 'dark';
  customUrl?: string;
  logoType?: 'default' | 'custom';
}

export default function AlBiruniLogo({ className = 'w-12 h-12', variant = 'green', customUrl, logoType }: AlBiruniLogoProps) {
  // Try to read custom logo from localStorage if not overridden by props
  const [localBranding, setLocalBranding] = useState<{ logoType?: string; customLogoUrl?: string } | null>(null);

  useEffect(() => {
    // Listen for storage events or just read on mount to keep synced
    const checkBranding = () => {
      try {
        const saved = localStorage.getItem('kip_branding_config');
        if (saved) {
          setLocalBranding(JSON.parse(saved));
        } else {
          setLocalBranding(null);
        }
      } catch (e) {}
    };

    checkBranding();
    
    // Listen for storage changes
    window.addEventListener('storage', checkBranding);
    // Custom event to handle direct local updates in the same window
    window.addEventListener('kip_branding_updated', checkBranding);
    
    return () => {
      window.removeEventListener('storage', checkBranding);
      window.removeEventListener('kip_branding_updated', checkBranding);
    };
  }, [logoType]);

  const activeLogoType = logoType !== undefined ? logoType : (localBranding?.logoType || 'default');
  const activeLogoUrl = customUrl !== undefined ? customUrl : localBranding?.customLogoUrl;

  if (activeLogoType === 'custom' && activeLogoUrl) {
    return (
      <img 
        src={activeLogoUrl} 
        alt="Logo" 
        className={`${className} object-contain max-h-full max-w-full`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Brand colors based on variant
  let logoColor = '#009639';
  let bannerBgColor = '#ffffff';
  let bannerTextColor = '#009639';
  let bottomBgColor = '#009639';
  let bottomTextColor = '#ffffff';

  if (variant === 'white') {
    logoColor = '#ffffff';
    bannerBgColor = '#009639';
    bannerTextColor = '#ffffff';
    bottomBgColor = '#ffffff';
    bottomTextColor = '#009639';
  } else if (variant === 'dark') {
    logoColor = '#0f172a'; // slate-900
    bannerBgColor = '#ffffff';
    bannerTextColor = '#0f172a';
    bottomBgColor = '#0f172a';
    bottomTextColor = '#ffffff';
  }

  // Custom 5-petaled flower shape path with sharp inward notches matching the official logo
  const outerPath = "M 250,15 C 290,15 345,55 365,100 C 385,145 445,155 475,185 C 505,215 445,275 415,305 C 385,355 415,405 375,435 C 335,465 290,425 250,395 C 210,425 165,465 125,435 C 85,405 115,355 85,305 C 55,275 -5,215 25,185 C 55,155 115,145 135,100 C 155,55 210,15 250,15 Z";

  return (
    <svg 
      viewBox="0 0 500 500" 
      className={`${className} select-none`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Clip path for the lower green area so it conforms perfectly to the inner flower contour */}
        <clipPath id="innerFlowerClip">
          <path d={outerPath} transform="translate(250, 250) scale(0.92) translate(-250, -250)" />
        </clipPath>
      </defs>

      {/* Solid white background so the logo is always a clean borderless square */}
      <rect width="500" height="500" fill="white" />

      {/* Outer 5-petaled Islamic floral frame */}
      <path 
        d={outerPath} 
        stroke={logoColor} 
        strokeWidth="12" 
        strokeLinejoin="round"
        fill="white"
      />
      
      {/* Inner floral border (double line effect, scaled) */}
      <path 
        d={outerPath} 
        stroke={logoColor} 
        strokeWidth="3.5" 
        strokeLinejoin="round"
        fill="none"
        transform="translate(250, 250) scale(0.92) translate(-250, -250)"
      />

      {/* Central Globe */}
      <circle cx="250" cy="215" r="85" stroke={logoColor} strokeWidth="5" fill="none" />
      
      {/* Meridians (Vertical grid lines) */}
      <line x1="250" y1="130" x2="250" y2="300" stroke={logoColor} strokeWidth="4.5" />
      <path d="M 250,130 C 195,150 195,280 250,300" stroke={logoColor} strokeWidth="4.5" fill="none" />
      <path d="M 250,130 C 145,160 145,270 250,300" stroke={logoColor} strokeWidth="4" fill="none" />
      <path d="M 250,130 C 305,150 305,280 250,300" stroke={logoColor} strokeWidth="4.5" fill="none" />
      <path d="M 250,130 C 355,160 355,270 250,300" stroke={logoColor} strokeWidth="4" fill="none" />
      
      {/* Parallels (Horizontal grid lines) */}
      <line x1="165" y1="215" x2="335" y2="215" stroke={logoColor} strokeWidth="4.5" />
      <path d="M 175,175 C 205,195 295,195 325,175" stroke={logoColor} strokeWidth="3.5" fill="none" />
      <path d="M 175,255 C 205,235 295,235 325,255" stroke={logoColor} strokeWidth="3.5" fill="none" />

      {/* Silhouette of Indonesia (Peta Indonesia) */}
      <path d="M 175,200 C 180,198 195,215 200,222 C 195,225 185,222 175,210 Z" fill={logoColor} opacity="0.9" />
      <path d="M 205,238 C 215,238 230,242 245,242 C 245,244 220,244 205,241 Z" fill={logoColor} opacity="0.9" />
      <path d="M 225,185 C 232,182 245,185 248,192 C 245,202 228,202 225,195 Z" fill={logoColor} opacity="0.9" />
      <path d="M 262,190 Q 270,185 274,192 Q 270,198 262,195 Z" fill={logoColor} opacity="0.9" />
      <path d="M 298,198 C 308,194 322,198 326,204 C 318,209 308,204 298,200 Z" fill={logoColor} opacity="0.9" />

      {/* Open Al-Quran in the center */}
      <g transform="translate(0, 15)">
        {/* Pages background (white) */}
        <path 
          d="M 250,210 C 235,192 205,198 205,198 L 205,172 C 205,172 235,166 250,184 C 265,166 295,172 295,172 L 295,198 C 295,198 265,192 250,210 Z" 
          fill="white" 
          stroke={logoColor} 
          strokeWidth="5.5" 
          strokeLinejoin="round" 
        />
        {/* Inner page lines representing verses */}
        <path 
          d="M 212,178 C 225,175 242,182 245,188" 
          stroke={logoColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M 212,186 C 225,183 242,190 245,196" 
          stroke={logoColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M 288,178 C 275,175 258,182 255,188" 
          stroke={logoColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M 288,186 C 275,183 258,190 255,196" 
          stroke={logoColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Spine center line */}
        <line x1="250" y1="184" x2="250" y2="210" stroke={logoColor} strokeWidth="5.5" strokeLinecap="round" />
      </g>

      {/* Invisible arched path for curved text */}
      <path id="archedTextPath" d="M 140,215 A 110,110 0 0,1 360,215" fill="none" stroke="none" />

      {/* Arched Text: SEKOLAH TINGGI ILMU DAKWAH */}
      <text fill={logoColor} fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="1.8">
        <textPath href="#archedTextPath" startOffset="50%" textAnchor="middle" fontSize="23">
          SEKOLAH TINGGI ILMU DAKWAH
        </textPath>
      </text>

      {/* White Banner with Green Border */}
      <path 
        d="M 80,315 L 420,315 L 440,345 L 420,375 L 80,375 L 60,345 Z" 
        fill={bannerBgColor} 
        stroke={logoColor} 
        strokeWidth="7" 
        strokeLinejoin="round" 
      />
      
      {/* Banner Text: Al-Biruni */}
      <text 
        x="250" 
        y="358" 
        textAnchor="middle" 
        fill={bannerTextColor} 
        fontSize="52" 
        fontWeight="bold" 
        fontFamily="Georgia, serif" 
        fontStyle="italic"
      >
        Al-Biruni
      </text>

      {/* Lower Solid Green Area with White Text (Clipped to flower boundary) */}
      <g clipPath="url(#innerFlowerClip)">
        {/* Fill block */}
        <rect x="0" y="375" width="500" height="130" fill={bottomBgColor} />
        
        {/* Subtext 1: BABAKAN CIWARINGIN */}
        <text 
          x="250" 
          y="410" 
          textAnchor="middle" 
          fill={bottomTextColor} 
          fontSize="22" 
          fontWeight="900" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          letterSpacing="0.5"
        >
          BABAKAN CIWARINGIN
        </text>

        {/* Subtext 2: CIREBON */}
        <text 
          x="250" 
          y="440" 
          textAnchor="middle" 
          fill={bottomTextColor} 
          fontSize="22" 
          fontWeight="900" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          letterSpacing="0.5"
        >
          CIREBON
        </text>
      </g>
    </svg>
  );
}
