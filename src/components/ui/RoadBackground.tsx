export function RoadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Road lane curves — abstract suggestion of road lanes */}
        <path
          d="M-100 700 C200 650, 400 500, 720 450 S1200 400, 1540 350"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.04"
        />
        <path
          d="M-100 720 C200 670, 400 520, 720 470 S1200 420, 1540 370"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.03"
          strokeDasharray="8 12"
        />
        <path
          d="M-100 740 C200 690, 400 540, 720 490 S1200 440, 1540 390"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.04"
        />

        {/* Second set — upper area, gentler curve */}
        <path
          d="M-50 250 C300 220, 600 180, 900 200 S1300 240, 1500 210"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.03"
        />
        <path
          d="M-50 270 C300 240, 600 200, 900 220 S1300 260, 1500 230"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.02"
          strokeDasharray="6 10"
        />

        {/* Scattered dots — like road reflectors */}
        <circle cx="200" cy="680" r="1.5" fill="currentColor" opacity="0.04" />
        <circle cx="400" cy="550" r="1.5" fill="currentColor" opacity="0.03" />
        <circle cx="650" cy="470" r="1.5" fill="currentColor" opacity="0.04" />
        <circle cx="900" cy="430" r="1.5" fill="currentColor" opacity="0.03" />
        <circle cx="1150" cy="390" r="1.5" fill="currentColor" opacity="0.04" />

        <circle cx="300" cy="240" r="1" fill="currentColor" opacity="0.03" />
        <circle cx="600" cy="195" r="1" fill="currentColor" opacity="0.02" />
        <circle cx="950" cy="215" r="1" fill="currentColor" opacity="0.03" />
        <circle cx="1250" cy="235" r="1" fill="currentColor" opacity="0.02" />
      </svg>
    </div>
  )
}
