import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../database/supabase";

export default function UbahMenu() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID Menu dari URL parameter

  // STATE FORM DATA (Sama seperti TambahMenu)
  const [namaMenu, setNamaMenu] = useState("");
  const [kategori, setKategori] = useState("1"); // "1" Makanan, "2" Minuman

  const [hargaMakanan, setHargaMakanan] = useState("");
  const [hargaDingin, setHargaDingin] = useState("");
  const [hargaPanas, setHargaPanas] = useState("");

  // STATE GAMBAR
  const [gambar, setGambar] = useState(null); // File gambar baru jika diunggah
  const [gambarPreview, setGambarPreview] = useState(""); // URL untuk preview gambar lama/baru
  const [loading, setLoading] = useState(false);

  // 1. FETCH DATA SEBELUMNYA BERDASARKAN ID SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchMenuData = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("Menu")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setNamaMenu(data.nama_menu || "");
          setKategori(String(data.Id_kategori || "1"));
          setGambarPreview(data.gambar || ""); // Menyimpan URL gambar lama untuk preview

          // Mengisi state harga berdasarkan kategori terdata
          if (String(data.Id_kategori) === "1") {
            setHargaMakanan(data.harga_makanan || "");
          } else {
            setHargaDingin(data.harga_dingin || "");
            setHargaPanas(data.harga_panas || "");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Gagal memuat data menu.");
        navigate("/dashboard/menu");
      }
    };

    fetchMenuData();
  }, [id, navigate]);

  // HANDLE VALIDASI DAN PERUBAHAN GAMBAR (Sama seperti TambahMenu)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2097152) {
        alert("Ukuran file terlalu besar! Maksimal adalah 2MB.");
        e.target.value = ""; // Reset input file
        return;
      }
      setGambar(file);
      setGambarPreview(URL.createObjectURL(file)); // Buat preview lokal instan
    }
  };

  // 2. PROSES UPDATE DATA KE SUPABASE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      let imageUrl = gambarPreview; // Default menggunakan URL gambar lama jika tidak diganti

      // Jika user mengunggah file gambar baru, lakukan proses upload ke bucket 'menu-gambar'
      if (gambar) {
        const fileExt = gambar.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("menu-gambar") // SUDAH DISINKRONKAN DENGAN BUCKET ANDA
          .upload(fileName, gambar, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) {
          console.error("Upload Error Details:", uploadError);
          alert(`Gagal unggah gambar baru: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("menu-gambar")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // UPDATE DATA KE DATABASE (Menyesuaikan kolom database dari ERD)
      const { error } = await supabase
        .from("Menu")
        .update({
          nama_menu: namaMenu,
          Id_kategori: Number(kategori),
          harga_makanan: kategori === "1" ? Number(hargaMakanan) : null,
          harga_dingin: kategori === "2" ? Number(hargaDingin) : null,
          harga_panas: kategori === "2" ? Number(hargaPanas) : null,
          gambar: imageUrl,
        })
        .eq("id", id);

      if (error) {
        console.error("Database Update Error:", error);
        alert(`Gagal memperbarui database: ${error.message}`);
        setLoading(false);
        return;
      }

      alert("Menu berhasil diperbarui");
      navigate("/dashboard/menu");
    } catch (err) {
      console.error("Catch Error:", err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/40
        flex
        justify-center
        items-center
        z-50
        p-4
      "
    >
      {/* MODAL CONTAINER */}
      <div
        className="
        bg-white
        w-full
        max-w-[650px]
        rounded-md
        relative
        shadow-xl
        px-4
        sm:px-6
        md:px-10
        py-6
        md:py-8
        max-h-[90vh]
        overflow-y-auto
      "
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/menu")}
          className="absolute top-4 right-4"
        >
          <X size={20} />
        </button>

        {/* TITLE */}
        <h1
          className="
          text-center
          text-2xl
          md:text-[34px]
          font-bold
          text-[#4B2E2B]
          mb-8
          md:mb-10
        "
        >
          Ubah Menu
        </h1>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">

            {/* NAMA MENU */}
            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-3 md:gap-5">
              <label className="text-[17px] font-semibold text-[#4B2E2B]">
                Nama Menu
              </label>
              <input
                type="text"
                value={namaMenu}
                onChange={(e) => setNamaMenu(e.target.value)}
                required
                className="
                  border
                  border-gray-300
                  h-[38px]
                  px-3
                  outline-none
                  text-sm
                "
              />
            </div>

            {/* KATEGORI */}
            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-3 md:gap-5">
              <label className="text-[17px] font-semibold text-[#4B2E2B] pt-2">
                Kategori
              </label>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setKategori("1")}
                  className={`
                    w-full
                    border
                    text-left
                    px-3
                    h-[38px]
                    text-sm
                    ${kategori === "1"
                      ? "bg-[#F3ECE5] border-[#4B2E2B]"
                      : "border-gray-300"
                    }
                  `}
                >
                  Makanan
                </button>

                <button
                  type="button"
                  onClick={() => setKategori("2")}
                  className={`
                    w-full
                    border
                    text-left
                    px-3
                    h-[38px]
                    text-sm
                    ${kategori === "2"
                      ? "bg-[#F3ECE5] border-[#4B2E2B]"
                      : "border-gray-300"
                    }
                  `}
                >
                  Minuman
                </button>
              </div>
            </div>

            {/* HARGA MAKANAN */}
            {kategori === "1" && (
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-3 md:gap-5">
                <label className="text-[17px] font-semibold text-[#4B2E2B]">
                  Harga Makanan
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={hargaMakanan}
                    onChange={(e) => setHargaMakanan(e.target.value)}
                    required={kategori === "1"}
                    className="
                      border
                      border-gray-300
                      h-[38px]
                      w-full
                      pl-10
                      pr-3
                      outline-none
                      text-sm
                    "
                  />
                </div>
              </div>
            )}

            {/* HARGA MINUMAN */}
            {kategori === "2" && (
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-3 md:gap-5">
                <label className="text-[17px] font-semibold text-[#4B2E2B] pt-2">
                  Harga Minuman
                </label>

                <div>
                  <p className="text-sm mb-1">Panas</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={hargaPanas}
                      onChange={(e) => setHargaPanas(e.target.value)}
                      required={kategori === "2"}
                      className="
                        border
                        border-gray-300
                        h-[38px]
                        w-full
                        pl-10
                        pr-3
                        outline-none
                        text-sm
                      "
                    />
                  </div>

                  <p className="text-sm mt-3 mb-1">Dingin</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={hargaDingin}
                      onChange={(e) => setHargaDingin(e.target.value)}
                      required={kategori === "2"}
                      className="
                        border
                        border-gray-300
                        h-[38px]
                        w-full
                        pl-10
                        pr-3
                        outline-none
                        text-sm
                      "
                    />
                  </div>
                </div>
              </div>
            )}

            {/* GAMBAR */}
            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-3 md:gap-5">
              <div className="hidden md:block"></div>
              <label
                className="
                  border
                  border-gray-300
                  bg-[#D9D9D9]
                  h-[120px]
                  flex
                  flex-col
                  justify-center
                  items-center
                  text-center
                  cursor-pointer
                  overflow-hidden
                "
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {gambarPreview ? (
                  <img
                    src={gambarPreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#4B2E2B]">
                      Klik untuk ubah gambar
                    </p>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Format JPG, PNG (Maks 2MB)
                    </p>
                  </>
                )}
              </label>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-8">
            <button
              type="button"
              disabled={loading}
              onClick={() => navigate("/dashboard/menu")}
              className="border border-gray-400 px-5 py-2 text-sm bg-white disabled:opacity-50 w-full md:w-auto"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#4B2E2B] text-white px-5 py-2 text-sm disabled:opacity-50 w-full md:w-auto"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}