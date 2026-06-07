import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../assets/MacBook Air - 9.png";
import { supabase } from "../database/supabase";

export default function Login() {

  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================
  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================================================
  // HANDLE INPUT
  // =========================================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // =========================================================
  // HANDLE LOGIN
  // =========================================================
  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      // =========================================================
      // LOGIN SUPABASE AUTH
      // =========================================================
      const { data, error } =
        await supabase.auth.signInWithPassword({

          email:
            formData.email,

          password:
            formData.password,

        });

      // ERROR LOGIN
      if (error) {

        setError(
          "Email atau kata sandi salah."
        );

        return;
      }

      // =========================================================
      // AMBIL DATA USER
      // =========================================================
      const user = data.user;

      // SIMPAN SESSION
      localStorage.setItem(
        "user_session",

        JSON.stringify({

          id: user.id,

          email: user.email,

        })
      );

      // BERHASIL
      navigate("/dashboard");

    } catch (err) {

      console.error(err);

      setError(
        "Gagal terhubung ke server."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center relative px-4 py-8"
      style={{
        backgroundImage:
          `url(${Background})`
      }}
    >

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl bg-white/15 backdrop-blur-md rounded-[32px] shadow-2xl px-10 py-12 md:px-14 md:py-16 border border-white/10">

        {/* Judul */}
        <h1 className="text-white text-4xl md:text-5xl font-serif text-center mb-10 tracking-wide">
          Mesombang Cafe
        </h1>

        {/* Error */}
        {error && (
          <div className="bg-red-500/80 text-white text-sm text-center p-2 rounded-xl mb-5 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* Username */}
          <div>

            <label className="block text-white text-sm font-semibold mb-2 ml-1">
              Nama Pengguna
            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className="w-full h-12 rounded-xl px-4 outline-none bg-white text-black text-base shadow-inner disabled:bg-gray-200 transition-all"
            />

          </div>

          {/* Email */}
          <div>

            <label className="block text-white text-sm font-semibold mb-2 ml-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full h-12 rounded-xl px-4 outline-none bg-white text-black text-base shadow-inner disabled:bg-gray-200 transition-all"
            />

          </div>

          {/* Password */}
          <div>

            <label className="block text-white text-sm font-semibold mb-2 ml-1">
              Kata Sandi
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full h-12 rounded-xl px-4 outline-none bg-white text-black text-base shadow-inner disabled:bg-gray-200 transition-all"
            />

          </div>

          {/* Lupa Sandi */}
          <div className="text-left pl-1">

            <button
              type="button"
              onClick={() =>
                navigate("/lupasandi")
              }
              className="text-white/90 text-sm hover:underline hover:text-white transition-all"
              disabled={loading}
            >
              Lupa sandi?
            </button>

          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#4a2b26] hover:bg-[#3d231f] transition-all duration-200 text-white text-lg font-semibold shadow-md mt-4 disabled:bg-amber-950/40"
          >
            {loading
              ? "Memproses..."
              : "Masuk"}
          </button>

        </form>
      </div>
    </div>
  );
}