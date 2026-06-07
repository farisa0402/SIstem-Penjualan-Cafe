import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../assets/MacBook Air - 9.png";
import { supabase } from "../database/supabase";

function UbahSandi() {

    const navigate = useNavigate();

    const [kataSandiBaru, setKataSandiBaru] = useState("");

    const [konfirmasiKataSandi, setKonfirmasiKataSandi] = useState("");

    const [loading, setLoading] = useState(false);

    // =====================================================
    // HANDLE UBAH PASSWORD
    // =====================================================
    const handleSubmit = async (e) => {

        e.preventDefault();

        // VALIDASI
        if (kataSandiBaru !== konfirmasiKataSandi) {

            alert("Konfirmasi kata sandi tidak sama!");

            return;
        }

        if (kataSandiBaru.length < 6) {

            alert("Password minimal 6 karakter!");

            return;
        }

        setLoading(true);

        try {

            // =====================================================
            // CEK SESSION SUPABASE
            // =====================================================
            const { data: sessionData } = await supabase.auth.getSession();

            if (!sessionData?.session) {

                alert("Session habis, silakan login ulang");

                navigate("/login");

                return;
            }

            // =====================================================
            // UPDATE PASSWORD DI SUPABASE AUTH
            // =====================================================
            const { error } = await supabase.auth.updateUser({
                password: kataSandiBaru,
            });

            if (error) {

                alert("Gagal mengubah password: " + error.message);

                return;
            }

            alert("Password berhasil diubah");

            // LOGOUT SESSION
            await supabase.auth.signOut();

            // PINDAH LOGIN
            navigate("/login");

        } catch (err) {

            console.log(err);

            alert(err.message);

        } finally {

            setLoading(false);

        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: `url(${Background})`,
            }}
        >

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Card */}
            <div className="relative z-10 w-[420px] bg-white/20 backdrop-blur-sm rounded-[30px] p-10 shadow-2xl">

                {/* Judul */}
                <h1 className="text-center text-white text-4xl font-bold mb-12 font-serif">
                    Mesombang Cafe
                </h1>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-6"
                >

                    {/* Password Baru */}
                    <input
                        type="password"
                        placeholder="Kata Sandi Baru"
                        value={kataSandiBaru}
                        onChange={(e) =>
                            setKataSandiBaru(e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-md outline-none bg-white text-gray-700"
                    />

                    {/* Konfirmasi */}
                    <input
                        type="password"
                        placeholder="Konfirmasi Kata Sandi"
                        value={konfirmasiKataSandi}
                        onChange={(e) =>
                            setKonfirmasiKataSandi(e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-md outline-none bg-white text-gray-700"
                    />

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#4b221b] hover:bg-[#3a1813] text-white py-3 rounded-md font-semibold transition disabled:bg-gray-500"
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default UbahSandi;