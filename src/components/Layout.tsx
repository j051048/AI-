import React from 'react';

interface Props {
  children: React.ReactNode;
  gradient: string;
}

export const Layout: React.FC<Props> = ({ children, gradient }) => {
  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${gradient} text-white transition-colors duration-700 overflow-hidden relative`}>
      {/* Background Particles/Noise */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
      ></div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-white/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-black/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>

      {/* Content Area */}
      <div className="relative z-10 w-full h-full flex flex-col safe-top safe-bottom">
        {children}
      </div>
    </div>
  );
};
