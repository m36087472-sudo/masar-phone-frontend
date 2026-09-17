// Pure static server component — zero JS, zero hydration cost.
export default function HomeBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] via-[#f5f7ff] to-white" />
      <div className="home-blob home-blob-1" />
      <div className="home-blob home-blob-2" />
      <style>{`
        .home-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          opacity: 0.5;
          /* will-change promotes to its own GPU layer — avoids main-thread repaint */
          will-change: transform;
        }
        .home-blob-1 {
          width: 500px; height: 500px;
          background: #c7d7ff;
          left: 15%; top: 10%;
          animation: blob1 22s ease-in-out infinite alternate;
        }
        .home-blob-2 {
          width: 450px; height: 450px;
          background: #dce8ff;
          left: 75%; top: 5%;
          animation: blob2 26s ease-in-out infinite alternate;
        }
        /* Use transform instead of left/top — avoids layout recalculation each frame */
        @keyframes blob1 {
          from { transform: translate(0, 0); }
          to   { transform: translate(13%, 12%); }
        }
        @keyframes blob2 {
          from { transform: translate(0, 0); }
          to   { transform: translate(-15%, 13%); }
        }
        /* Pause animations when the tab is not visible to save CPU */
        @media (prefers-reduced-motion: reduce) {
          .home-blob { animation: none; }
        }
      `}</style>
    </div>
  );
}
