import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../assets/MacBook Air - 9.png";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: `url(${Background})` }}
    >
      {/* Overlay Gelap */}
      <div className="absolute inset-0 bg-[#3b1f1a]/70"></div>

      {/* Konten dengan Animasi Fade In */}
      {/* Kita gunakan animate-pulse diganti dengan efek transisi opacity */}
      <div className="relative z-10 text-center text-white animate-[fadeIn_2s_ease-in-out]">
        <h1 className="text-4xl md:text-5xl font-abhaya font-extrabold tracking-widest">
          Mesombang Cafe
        </h1>
      </div>

      {/* Tambahkan style ini di file CSS global Anda atau gunakan style tag di bawah jika ingin instan */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}