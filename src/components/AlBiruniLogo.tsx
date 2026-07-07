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

  // Brand color
  const greenColor = '#009639';
  
  // Custom 5-petaled flower shape path that matches the official logo
  const outerPath = `
    M 250,15 
    C 285,15 315,55 350,75 
    C 385,95 455,100 470,150 
    C 485,200 440,250 450,305 
    C 460,360 415,415 360,435 
    C 310,455 285,445 250,445 
    C 215,445 190,455 140,435 
    C 85,415 40,360 50,305 
    C 60,250 15,200 30,150 
    C 45,100 115,95 150,75 
    C 185,55 215,15 250,15 Z
  `;

  return (
    <svg 
      viewBox="0 0 500 500" 
      className={`${className} select-none`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer 5-petaled Islamic floral frame */}
      <path 
        d={outerPath} 
        stroke={greenColor} 
        strokeWidth="12" 
        strokeLinejoin="round"
        fill="white"
      />
      
      {/* Inner floral border (double line effect) */}
      <path 
        d="M 250,32 C 280,32 305,68 335,85 C 365,102 425,107 438,148 C 451,189 413,231 421,278 C 429,325 391,371 345,388 C 302,404 280,396 250,396 C 220,396 198,404 155,388 C 109,371 71,325 79,278 C 87,231 49,189 62,148 C 75,107 135,102 165,85 C 195,68 220,32 250,32 Z" 
        stroke={greenColor} 
        strokeWidth="4" 
        strokeLinejoin="round"
        fill="none"
      />

      {/* Central Globe */}
      <circle cx="250" cy="205" r="105" stroke={greenColor} strokeWidth="6" fill="none" />
      
      {/* Meridians (Vertical grid lines) */}
      <line x1="250" y1="100" x2="250" y2="310" stroke={greenColor} strokeWidth="5" />
      <path d="M 250,100 C 195,135 195,275 250,310" stroke={greenColor} strokeWidth="5" fill="none" />
      <path d="M 250,100 C 145,145 145,265 250,310" stroke={greenColor} strokeWidth="4.5" fill="none" />
      <path d="M 250,100 C 305,135 305,275 250,310" stroke={greenColor} strokeWidth="5" fill="none" />
      <path d="M 250,100 C 355,145 355,265 250,310" stroke={greenColor} strokeWidth="4.5" fill="none" />
      
      {/* Parallels (Horizontal grid lines) */}
      <line x1="145" y1="205" x2="355" y2="205" stroke={greenColor} strokeWidth="5" />
      <path d="M 165,155 C 200,185 300,185 335,155" stroke={greenColor} strokeWidth="4" fill="none" />
      <path d="M 165,255 C 200,225 300,225 335,255" stroke={greenColor} strokeWidth="4" fill="none" />

      {/* Silhouette of Indonesia (Peta Indonesia) */}
      {/* Left side islands (Sumatra, Java, Kalimantan) */}
      <path d="M 155,195 C 150,192 160,182 165,188 C 170,194 165,200 155,195 Z" fill={greenColor} />
      <path d="M 172,210 C 170,205 180,200 185,205 C 190,210 182,218 172,210 Z" fill={greenColor} />
      <path d="M 152,225 Q 165,222 178,228" fill="none" stroke={greenColor} strokeWidth="5" strokeLinecap="round" />
      
      {/* Right side islands (Sulawesi, Papua) */}
      <path d="M 312,192 C 308,188 318,180 322,185 C 326,190 320,198 312,192 Z" fill={greenColor} />
      <path d="M 332,202 C 330,198 342,192 344,200 C 346,208 338,212 332,202 Z" fill={greenColor} />

      {/* Open Al-Quran in the center */}
      <path 
        d="M 250,225 C 232,208 195,216 195,216 L 195,188 C 195,188 232,180 250,198 Z" 
        fill="white" 
        stroke={greenColor} 
        strokeWidth="5" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 250,225 C 268,208 305,216 305,216 L 305,188 C 305,188 268,180 250,198 Z" 
        fill="white" 
        stroke={greenColor} 
        strokeWidth="5" 
        strokeLinejoin="round" 
      />
      <line x1="250" y1="198" x2="250" y2="225" stroke={greenColor} strokeWidth="5" />

      {/* Invisible arched path for curved text */}
      <path id="archedTextPath" d="M 100,200 A 150,150 0 0,1 400,200" fill="none" stroke="none" />

      {/* Arched Text: SEKOLAH TINGGI ILMU DAKWAH */}
      <text fill={greenColor} className="font-serif font-extrabold tracking-widest">
        <textPath href="#archedTextPath" startOffset="50%" textAnchor="middle" fontSize="30.5">
          SEKOLAH TINGGI ILMU DAKWAH
        </textPath>
      </text>

      {/* White Banner with Green Border */}
      <path 
        d="M 74,305 L 426,305 L 452,360 L 48,360 Z" 
        fill="white" 
        stroke={greenColor} 
        strokeWidth="7" 
        strokeLinejoin="round" 
      />
      
      {/* Banner Text: Al Biruni */}
      <text 
        x="250" 
        y="346" 
        textAnchor="middle" 
        fill={greenColor} 
        fontSize="50" 
        fontWeight="bold" 
        fontFamily="Georgia, serif" 
        fontStyle="italic"
      >
        Al Biruni
      </text>

      {/* Lower Solid Green Area for Ciwaringin Cirebon */}
      <path 
        d="M 48,360 L 452,360 C 427,412 345,445 250,445 C 155,445 73,412 48,360 Z" 
        fill={greenColor} 
      />

      {/* Subtext 1: BABAKAN CIWARINGIN */}
      <text 
        x="250" 
        y="392" 
        textAnchor="middle" 
        fill="white" 
        fontSize="21" 
        fontWeight="900" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        letterSpacing="0.5"
      >
        BABAKAN CIWARINGIN
      </text>

      {/* Subtext 2: CIREBON */}
      <text 
        x="250" 
        y="422" 
        textAnchor="middle" 
        fill="white" 
        fontSize="21" 
        fontWeight="900" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        letterSpacing="0.5"
      >
        CIREBON
      </text>
    </svg>
  );
}
