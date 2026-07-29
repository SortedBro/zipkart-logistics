export default function ZipkartLogo({ className = 'h-10', showTagline = true, variant = 'light' }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg className="h-full w-auto aspect-[520/180]" viewBox="0 0 520 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stylized Yellow Z */}
        <g transform="translate(10, 10)">
          <path d="M 50 35 L 180 35 L 85 120 L 175 120 L 175 142 L 40 142 L 135 57 L 50 57 Z" fill="#F4B400" />
        </g>
        
        {/* Blue ipkart Text */}
        <text
          x="172"
          y="116"
          fontFamily="'Satoshi', 'Inter', 'Segoe UI', system-ui, sans-serif"
          fontWeight="800"
          fontSize="86"
          fill={variant === 'dark' ? '#FFFFFF' : '#0A5CA4'}
          letterSpacing="-1.5"
        >
          ipkart
        </text>

        {/* Tagline */}
        {showTagline && (
          <text
            x="175"
            y="148"
            fontFamily="'Satoshi', 'Inter', 'Segoe UI', system-ui, sans-serif"
            fontWeight="700"
            fontSize="20"
            fill={variant === 'dark' ? '#E2E8F0' : '#0A5CA4'}
            letterSpacing="-0.2"
          >
            Connecting India,Delivering Trust
          </text>
        )}
      </svg>
    </div>
  );
}
