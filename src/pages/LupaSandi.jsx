import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../assets/MacBook Air - 9.png";
import { supabase } from "../database/supabase";

export default function LupaSandi() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [message, setMessage] =
    useState({
      text: "",
      isError: false,
    });

  const [loading, setLoading] =
    useState(false);

  // =========================================================
  // HANDLE RESET PASSWORD
  // =========================================================
  const handleResetRequest =
    async (e) => {

      e.preventDefault();

      if (!email.trim()) {

        setMessage({
          text:
            "Email harus diisi!",
          isError: true,
        });

        return;
      }

      setLoading(true);

      try {

        // =========================================================
        // KIRIM EMAIL RESET PASSWORD
        // =========================================================
        const { error } =
          await supabase.auth.resetPasswordForEmail(
            email,
            {
              redirectTo:
                "http://localhost:5173/ubahsandi",
            }
          );

        if (error)
          throw error;

        setMessage({
          text:
            "Link reset password berhasil dikirim ke email!",
          isError: false,
        });

        setEmail("");

      } catch (err) {

        console.log(err);

        setMessage({
          text:
            err.message,
          isError: true,
        });

      } finally {

        setLoading(false);

      }
    };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center relative px-4 py-8"
      style={{
        backgroundImage:
          `url(${Background})`,
      }}
    >

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl bg-white/15 backdrop-blur-md rounded-[32px] shadow-2xl px-10 py-12 md:px-14 md:py-16 border border-white/10">

        {/* Judul */}
        <h1 className="text-white text-4xl md:text-5xl font-serif text-center mb-6 tracking-wide">
          Mesombang Cafe
        </h1>

        {/* Sub Judul */}
        <h2 className="text-white text-lg font-semibold text-center mb-6">
          Lupa Kata Sandi?
        </h2>

        {/* Message */}
        {message.text && (
          <div
            className={`text-white text-sm text-center p-3 rounded-xl mb-5 ${message.isError
              ? "bg-red-500"
              : "bg-green-500"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={
            handleResetRequest
          }
          className="space-y-6"
        >

          {/* Email */}
          <div>

            <label className="block text-white text-sm font-semibold mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              disabled={loading}
              className="w-full h-12 rounded-xl px-4 outline-none bg-white text-black"
            />

          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#4a2b26] hover:bg-[#3b211d] text-white font-semibold transition"
          >
            {loading
              ? "Memproses..."
              : "Kirim Link Reset"}
          </button>

          {/* Back */}
          <div className="text-center">

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="text-white text-sm hover:underline"
            >
              Kembali ke Login
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}