import React from 'react';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

interface TransparentLogoProps {
  size?: number;
  color?: string;
  variant?: 'default' | 'minimal';
}

export const TransparentLogo: React.FC<TransparentLogoProps> = ({ 
  size = 120, 
  color = '#FFFFFF',
  variant = 'default'
}) => {
  if (variant === 'minimal') {
    // Simplified version with just the key elements
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <G>
          {/* Simplified Chess Knight */}
          <Path
            d="M30 25 C30 25, 35 20, 45 25 C50 27, 55 30, 55 40 C55 45, 50 50, 45 55 L50 60 C55 65, 50 75, 45 75 L35 75 C30 75, 25 70, 25 65 L25 35 C25 30, 30 25, 30 25 Z"
            fill={color}
          />
          
          {/* Simplified Dollar Symbol */}
          <Path
            d="M75 35 L95 35 C98 35, 100 37, 100 40 L100 60 C100 63, 98 65, 95 65 L75 65 C72 65, 70 63, 70 60 L70 40 C70 37, 72 35, 75 35 Z"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
          />
          
          <Path
            d="M85 42 C82 42, 80 44, 80 47 C80 50, 82 52, 85 52 C88 52, 90 54, 90 57 C90 60, 88 62, 85 62 M85 38 L85 66"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>
      </Svg>
    );
  }

  // Default detailed version
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <ClipPath id="logoClip">
          <Rect x="0" y="0" width="120" height="120" rx="20" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#logoClip)">
        {/* Chess Knight - more accurate representation */}
        <Path
          d="M25 85 C25 87, 27 90, 30 90 L50 90 C53 90, 55 87, 55 85 L55 80 C55 78, 53 76, 50 76 L48 76 L48 72 C48 69, 49 67, 52 67 L54 67 C56 67, 58 65, 58 62 L58 58 C58 56, 56 54, 54 54 L52 54 C50 54, 48 52, 48 50 L48 46 C48 44, 49 42, 52 42 L54 42 C57 42, 60 39, 60 35 L60 30 C60 27, 57 24, 54 24 L47 24 C44 24, 42 26, 42 29 L42 31 C42 33, 40 35, 37 35 L35 35 C32 35, 30 37, 30 40 L30 48 C30 51, 32 53, 35 53 L36 53 C38 53, 40 55, 40 58 L40 63 C40 66, 38 68, 35 68 L33 68 C30 68, 28 70, 28 73 L28 80 C28 82, 26 84, 25 85 Z"
          fill={color}
        />
        
        {/* Knight's mane detail */}
        <Path
          d="M45 30 C47 28, 50 29, 52 32 C53 34, 52 36, 50 37 C48 38, 46 36, 45 34 Z"
          fill={color}
          opacity="0.8"
        />
        
        {/* Dollar Bill */}
        <Path
          d="M68 35 L97 35 C99 35, 101 37, 101 39 L101 61 C101 63, 99 65, 97 65 L68 65 C66 65, 64 63, 64 61 L64 39 C64 37, 66 35, 68 35 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        
        {/* Dollar Sign */}
        <Path
          d="M82.5 42 C79.5 42, 77 44.5, 77 47.5 C77 50.5, 79.5 53, 82.5 53 C85.5 53, 88 55.5, 88 58.5 C88 61.5, 85.5 64, 82.5 64 M82.5 38 L82.5 68"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Additional dollar sign line */}
        <Path
          d="M82.5 42 C85.5 42, 88 44.5, 88 47.5 M82.5 64 C79.5 64, 77 61.5, 77 58.5"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Decorative elements on dollar bill */}
        <Path
          d="M68 40 L73 40 L73 43 L68 43 Z M92 40 L97 40 L97 43 L92 43 Z M68 57 L73 57 L73 60 L68 60 Z M92 57 L97 57 L97 60 L92 60 Z"
          fill={color}
        />
        
        {/* Additional bill details */}
        <Path
          d="M70 47 L75 47 M90 47 L95 47 M70 53 L75 53 M90 53 L95 53"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};