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
          transform: translate(-50%, -50%);
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
        @keyframes blob1 { from { left:15%; top:10%; } to { left:28%; top:22%; } }
        @keyframes blob2 { from { left:75%; top:5%; } to { left:60%; top:18%; } }
        @media (prefers-reduced-motion: reduce) {
          .home-blob { animation: none; }
        }
      `}</style>
    </div>
  );
}
