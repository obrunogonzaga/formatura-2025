export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`logo-container ${className}`}>
      <svg
        width="280"
        height="70"
        viewBox="0 0 280 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Background decorativo */}
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#003B73', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0a5a9e', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="textGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#4A90E2', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6ba3e8', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="flowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FFC107', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Texto "Recanto" - com classe para dark mode */}
        <text
          x="10"
          y="48"
          fontFamily="Poppins, Arial, sans-serif"
          fontSize="42"
          fontWeight="800"
          fill="url(#textGradient)"
          letterSpacing="-1"
          className="logo-text"
        >
          Recanto
        </text>
        
        {/* Patinhos amarelos decorativos */}
        <g transform="translate(195, 20)">
          {/* Patinho 1 */}
          <g transform="rotate(-5)">
            {/* Corpo */}
            <ellipse cx="0" cy="8" rx="8" ry="10" fill="url(#flowerGradient)" />
            {/* Cabeça */}
            <circle cx="0" cy="0" r="6" fill="url(#flowerGradient)" />
            {/* Bico */}
            <ellipse cx="5" cy="0" rx="3" ry="2" fill="#FF9500" />
            {/* Olho */}
            <circle cx="-2" cy="-1" r="1.2" fill="#003B73" />
            <circle cx="-1.5" cy="-1.5" r="0.5" fill="#FFF" />
            {/* Asa */}
            <ellipse cx="-3" cy="8" rx="3" ry="4" fill="#FFC107" opacity="0.8" />
            {/* Patinha */}
            <path d="M -2 16 L -3 18 L -1 18 Z" fill="#FF9500" />
            <path d="M 2 16 L 1 18 L 3 18 Z" fill="#FF9500" />
          </g>
          
          {/* Patinho 2 - menor */}
          <g transform="translate(22, 5) rotate(8)">
            {/* Corpo */}
            <ellipse cx="0" cy="7" rx="6.5" ry="8" fill="url(#flowerGradient)" />
            {/* Cabeça */}
            <circle cx="0" cy="0" r="5" fill="url(#flowerGradient)" />
            {/* Bico */}
            <ellipse cx="4" cy="0" rx="2.5" ry="1.5" fill="#FF9500" />
            {/* Olho */}
            <circle cx="-1.5" cy="-1" r="1" fill="#003B73" />
            <circle cx="-1" cy="-1.3" r="0.4" fill="#FFF" />
            {/* Asa */}
            <ellipse cx="-2.5" cy="7" rx="2.5" ry="3" fill="#FFC107" opacity="0.8" />
            {/* Patinha */}
            <path d="M -2 14 L -3 16 L -1 16 Z" fill="#FF9500" />
            <path d="M 2 14 L 1 16 L 3 16 Z" fill="#FF9500" />
          </g>
          
          {/* Patinho 3 - menorzinho */}
          <g transform="translate(42, 0) rotate(-8)">
            {/* Corpo */}
            <ellipse cx="0" cy="6" rx="5.5" ry="7" fill="url(#flowerGradient)" />
            {/* Cabeça */}
            <circle cx="0" cy="0" r="4.5" fill="url(#flowerGradient)" />
            {/* Bico */}
            <ellipse cx="3.5" cy="0" rx="2" ry="1.3" fill="#FF9500" />
            {/* Olho */}
            <circle cx="-1.5" cy="-0.8" r="0.9" fill="#003B73" />
            <circle cx="-1" cy="-1" r="0.3" fill="#FFF" />
            {/* Asa */}
            <ellipse cx="-2" cy="6" rx="2" ry="2.5" fill="#FFC107" opacity="0.8" />
            {/* Patinha */}
            <path d="M -1.5 12 L -2.5 14 L -0.5 14 Z" fill="#FF9500" />
            <path d="M 1.5 12 L 0.5 14 L 2.5 14 Z" fill="#FF9500" />
          </g>
          
          {/* Detalhes extras - bolhinhas */}
          <circle cx="-8" cy="22" r="1.5" fill="#87CEEB" opacity="0.4" />
          <circle cx="60" cy="18" r="1.2" fill="#87CEEB" opacity="0.3" />
          <circle cx="32" cy="20" r="1" fill="#87CEEB" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}
