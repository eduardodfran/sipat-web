export function RoadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.15]">
      <svg
        className="h-full w-full"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Road surfaces — thick white lines for streets */}
        <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
          {/* Main horizontal roads */}
          <line x1="0" y1="180" x2="500" y2="180" strokeWidth="18" />
          <line x1="500" y1="180" x2="620" y2="120" strokeWidth="18" />
          <line x1="620" y1="120" x2="1200" y2="120" strokeWidth="18" />

          <line x1="0" y1="380" x2="350" y2="380" strokeWidth="18" />
          <line x1="350" y1="380" x2="520" y2="320" strokeWidth="18" />
          <line x1="520" y1="320" x2="1200" y2="320" strokeWidth="18" />

          <line x1="0" y1="580" x2="450" y2="580" strokeWidth="18" />
          <line x1="450" y1="580" x2="600" y2="500" strokeWidth="18" />
          <line x1="600" y1="500" x2="1200" y2="500" strokeWidth="18" />

          <line x1="200" y1="800" x2="200" y2="680" strokeWidth="18" />
          <line x1="200" y1="680" x2="280" y2="580" strokeWidth="18" />
          <line x1="280" y1="580" x2="280" y2="380" strokeWidth="18" />
          <line x1="280" y1="380" x2="200" y2="180" strokeWidth="18" />
          <line x1="200" y1="180" x2="200" y2="0" strokeWidth="18" />

          <line x1="550" y1="800" x2="550" y2="580" strokeWidth="18" />
          <line x1="550" y1="580" x2="620" y2="500" strokeWidth="18" />
          <line x1="620" y1="500" x2="620" y2="320" strokeWidth="18" />
          <line x1="620" y1="320" x2="550" y2="180" strokeWidth="18" />
          <line x1="550" y1="180" x2="620" y2="120" strokeWidth="18" />
          <line x1="620" y1="120" x2="620" y2="0" strokeWidth="18" />

          <line x1="900" y1="800" x2="900" y2="500" strokeWidth="18" />
          <line x1="900" y1="500" x2="900" y2="320" strokeWidth="18" />
          <line x1="900" y1="320" x2="900" y2="120" strokeWidth="18" />
          <line x1="900" y1="120" x2="900" y2="0" strokeWidth="18" />

          {/* Diagonal roads */}
          <line x1="0" y1="700" x2="450" y2="580" strokeWidth="14" />
          <line x1="620" y1="120" x2="900" y2="320" strokeWidth="14" />
          <line x1="350" y1="380" x2="280" y2="580" strokeWidth="14" />

          {/* Smaller side streets */}
          <line x1="380" y1="0" x2="380" y2="180" strokeWidth="10" />
          <line x1="380" y1="180" x2="420" y2="380" strokeWidth="10" />
          <line x1="750" y1="0" x2="750" y2="120" strokeWidth="10" />
          <line x1="750" y1="320" x2="750" y2="500" strokeWidth="10" />
          <line x1="1050" y1="0" x2="1050" y2="120" strokeWidth="10" />
          <line x1="1050" y1="320" x2="1050" y2="500" strokeWidth="10" />
          <line x1="100" y1="0" x2="100" y2="180" strokeWidth="10" />
          <line x1="100" y1="380" x2="100" y2="580" strokeWidth="10" />
          <line x1="450" y1="580" x2="450" y2="800" strokeWidth="10" />
        </g>

        {/* Road edge lines — thinner lines along road edges */}
        <g stroke="#ffffff" strokeWidth="0.5" opacity="0.5">
          <line x1="0" y1="171" x2="500" y2="171" />
          <line x1="0" y1="189" x2="500" y2="189" />
          <line x1="0" y1="371" x2="350" y2="371" />
          <line x1="0" y1="389" x2="350" y2="389" />
          <line x1="0" y1="571" x2="450" y2="571" />
          <line x1="0" y1="589" x2="450" y2="589" />
        </g>

        {/* Street name labels */}
        <g fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" opacity="0.6">
          <text x="120" y="170" transform="rotate(-2, 120, 170)">Kiton Street</text>
          <text x="180" y="290" transform="rotate(-2, 180, 290)">Datual Street</text>
          <text x="80" y="470" transform="rotate(-2, 80, 470)">Balanakan Street</text>
          <text x="100" y="560" transform="rotate(-2, 100, 560)">Jazan K.S.A</text>
          <text x="320" y="470" transform="rotate(-50, 320, 470)">Alaska Street</text>
          <text x="380" y="650" transform="rotate(-55, 380, 650)">Armenia Street</text>
          <text x="140" y="750" transform="rotate(-70, 140, 750)">Brazil Street</text>
          <text x="350" y="790" transform="rotate(-80, 350, 790)">Magsundanao Avenue</text>
          <text x="700" y="110">Talhey Street</text>
          <text x="1000" y="310">Sampaguita Street</text>
          <text x="680" y="490">Rizal Avenue</text>
          <text x="950" y="110">Bonifacio Street</text>
        </g>

        {/* Hazard dots — colored markers */}
        <circle cx="720" cy="105" r="6" fill="#f59e0b" />
        <circle cx="850" cy="305" r="6" fill="#22c55e" />
        <circle cx="890" cy="305" r="6" fill="#22c55e" />
        <circle cx="930" cy="305" r="6" fill="#22c55e" />
        <circle cx="680" cy="485" r="5" fill="#ef4444" />
      </svg>
    </div>
  )
}
