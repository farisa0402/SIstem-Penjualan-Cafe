import { useState, useEffect } from "react";
import { Plus, Minus, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../database/supabase";

export default function Transaksi() {
  const navigate = useNavigate();
  const location = useLocation();

  const [namaPemesan, setNamaPemesan] = useState("");
  const [cartItems, setCartItems] = useState([]);

  const biayaLayanan = 0;

  // AMBIL DATA DARI HALAMAN MENU
  useEffect(() => {
    if (location.state?.cart) {
      setCartItems(location.state.cart);
    }
  }, [location.state]);

  // TAMBAH JUMLAH
  function tambahJumlah(id, varian) {
    setCartItems((prev) => {

      const itemDipilih = prev.find(
        (item) =>
          item.id === id &&
          item.varian === varian
      );

      if (!itemDipilih) return prev;

      // HITUNG TOTAL SEMUA VARIAN MENU INI
      const totalMenu = prev
        .filter((item) => item.id === id)
        .reduce(
          (total, item) =>
            total + item.jumlah,
          0
        );

      // CEK STOK GABUNGAN
      if (totalMenu >= itemDipilih.stok) {
        alert(
          `Stok ${itemDipilih.nama_menu} hanya tersedia ${itemDipilih.stok}`
        );
        return prev;
      }

      return prev.map((item) =>
        item.id === id &&
          item.varian === varian
          ? {
            ...item,
            jumlah: item.jumlah + 1,
          }
          : item
      );
    });
  }

  // KURANG JUMLAH
  function kurangJumlah(id, varian) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id &&
            item.varian === varian
            ? {
              ...item,
              jumlah: item.jumlah - 1,
            }
            : item
        )
        .filter((item) => item.jumlah > 0)
    );
  }

  // HAPUS ITEM
  function hapusItem(id, varian) {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.varian === varian
          )
      )
    );
  }

  // HITUNG SUBTOTAL
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.harga * item.jumlah,
    0
  );

  // HITUNG TOTAL
  const total = subtotal;

  // FORMAT RUPIAH
  function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
  }

  // SIMPAN PESANAN
  async function simpanPesanan() {
    try {

      // VALIDASI
      if (!namaPemesan) {
        alert("Nama pemesan wajib diisi");
        return;
      }

      if (cartItems.length === 0) {
        alert("Keranjang kosong");
        return;
      }

      for (const item of cartItems) {

        const totalMenu = cartItems
          .filter(
            (x) => x.id === item.id
          )
          .reduce(
            (total, x) =>
              total + x.jumlah,
            0
          );

        if (totalMenu > item.stok) {
          alert(
            `Stok ${item.nama_menu} tidak mencukupi`
          );
          return;
        }
      }

      // =====================================
      // INSERT PESANAN
      // =====================================
      const { data: pesananBaru, error: errorPesanan } =
        await supabase
          .from("Pesanan")
          .insert([
            {
              id_pengguna: 1,
              tanggal: new Date().toISOString(),
              total_harga: total,
            },
          ])
          .select()
          .single();

      if (errorPesanan) {
        console.log("ERROR PESANAN:", errorPesanan);
        alert("Gagal menyimpan pesanan");
        return;
      }

      // =====================================
      // INSERT DETAIL PESANAN
      // =====================================
      const detailPesanan = cartItems.map((item) => ({
        id_pesanan: pesananBaru.id,

        nama_menu: item.varian
          ? `${item.nama_menu} ${item.varian}`
          : item.nama_menu,

        harga: item.harga,
        jumlah: item.jumlah,
        subtotal: item.harga * item.jumlah,
      }));

      const { data: hasilDetail, error: errorDetail } =
        await supabase
          .from("Detail_Pesanan")
          .insert(detailPesanan)
          .select();

      console.log("DETAIL YANG DIKIRIM:", detailPesanan);
      console.log("HASIL DETAIL:", hasilDetail);

      if (errorDetail) {
        console.log("ERROR DETAIL:", errorDetail);
        alert(JSON.stringify(errorDetail));
        return;
      }

      // =====================================
      // KURANGI STOK SETELAH TRANSAKSI
      // =====================================
      for (const item of cartItems) {

        console.log("ITEM CART:", item);

        const { data: stokLama, error: errorGet } = await supabase
          .from("Stok")
          .select("jumlah")
          .eq("nama_menu", item.nama_menu)
          .single();

        if (errorGet) {
          console.log("ERROR AMBIL STOK:", errorGet);
          continue;
        }

        const stokBaru = (stokLama.jumlah || 0) - item.jumlah;

        const { error: errorUpdate } = await supabase
          .from("Stok")
          .update({
            jumlah: stokBaru < 0 ? 0 : stokBaru
          })
          .eq("nama_menu", item.nama_menu);

        if (errorUpdate) {
          console.log("ERROR UPDATE STOK:", errorUpdate);
        }
      }

      // =====================================
      // BUAT NOMOR PESANAN RESET SETIAP HARI
      // =====================================

      const hariIni = new Date().toLocaleDateString("sv-SE", {
        timeZone: "Asia/Makassar",
      });

      const { data: semuaRiwayat, error: errorNomor } =
        await supabase
          .from("Riwayat")
          .select("no_pesanan, tanggal");

      if (errorNomor) {
        console.log("ERROR NOMOR:", errorNomor);
        alert("Gagal membuat nomor pesanan");
        return;
      }

      // Ambil transaksi hari ini saja
      const riwayatHariIni = (semuaRiwayat || []).filter(
        (item) => {
          if (!item.tanggal) return false;

          const tanggalRiwayat =
            new Date(item.tanggal)
              .toLocaleDateString("sv-SE", {
                timeZone: "Asia/Makassar",
              });

          return tanggalRiwayat === hariIni;
        }
      );

      let nomorUrut = 1;

      if (riwayatHariIni.length > 0) {

        const nomorTerbesar = Math.max(
          ...riwayatHariIni.map((item) =>
            parseInt(
              item.no_pesanan.replace("P", "")
            )
          )
        );

        nomorUrut = nomorTerbesar + 1;
      }

      const noPesanan = `P${String(nomorUrut).padStart(4, "0")}`;

      // =====================================
      // INSERT RIWAYAT
      // =====================================
      const { error: errorRiwayat } = await supabase
        .from("Riwayat")
        .insert([
          {
            id_pesanan: pesananBaru.id,
            no_pesanan: noPesanan,
            nama_pemesan: namaPemesan,
            total_harga: total,
            tanggal: new Date().toLocaleString("sv-SE", {
              timeZone: "Asia/Makassar"
            }),
          },
        ])

      if (errorRiwayat) {
        console.log("ERROR RIWAYAT:", errorRiwayat);
        alert("Gagal menyimpan riwayat");
        return;
      }

      // =====================================
      // BERHASIL
      // =====================================
      alert("Pesanan berhasil disimpan!");

      navigate("/dashboard/");

    } catch (err) {
      console.log("ERROR FINAL:", err);
      alert("Gagal menyimpan pesanan");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4ece1] p-4 md:p-6 text-[#36211d]">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between gap-4">
        <h1 className="font-serif text-2xl md:text-3xl font-bold uppercase">
          TRANSAKSI
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 flex flex-col bg-[#fdfbf7] rounded-xl border border-[#dac2b1] shadow-sm overflow-hidden">
          <div className="bg-[#dac2b1]/40 px-4 py-3">
            <h2 className="font-semibold text-lg">
              Detail Pesanan
            </h2>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-6 flex justify-between gap-4">
              <div>

                <h3 className="text-2xl md:text-3xl font-black">
                  Keranjang
                </h3>
              </div>

              <div className="w-full md:flex-1 md:max-w-sm">
                <input
                  type="text"
                  value={namaPemesan}
                  onChange={(e) =>
                    setNamaPemesan(e.target.value)
                  }
                  placeholder="Nama Pemesan"
                  className="w-full border border-[#dac2b1] rounded-lg px-3 py-2 bg-white text-[#36211d] outline-none"
                />
              </div>
            </div>

            <div className="divide-y divide-[#dac2b1]/40">
              {cartItems.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  Keranjang belanja kosong.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.varian || "default"}`}
                    className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <img
                        src={
                          item.gambar ||
                          "https://via.placeholder.com/150?text=No+Image"
                        }
                        alt={item.nama_menu}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover border border-[#dac2b1]" 
                      />

                      <div>
                        <h4 className="font-bold">
                          {item.varian
                            ? `${item.nama_menu} ${item.varian}`
                            : item.nama_menu}
                        </h4>

                        <p className="text-sm text-gray-500">
                          {formatRupiah(item.harga)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                      <div className="flex items-center border border-[#dac2b1] rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() =>
                            kurangJumlah(
                              item.id,
                              item.varian
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="px-3 font-semibold text-sm">
                          {item.jumlah}
                        </span>

                        <button
                          onClick={() =>
                            tambahJumlah(
                              item.id,
                              item.varian
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          hapusItem(
                            item.id,
                            item.varian
                          )
                        }
                        className="text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-[#dac2b1] p-5 shadow-sm">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>

              <span className="font-semibold">
                {formatRupiah(subtotal)}
              </span>
            </div>

            <div className="border-t border-[#dac2b1] my-4"></div>

            <div className="flex justify-between text-lg md:text-xl font-bold">
              <span>Total</span>

              <span className="text-[#1e6f43]">
                {formatRupiah(total)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <button
              onClick={simpanPesanan}
              disabled={cartItems.length === 0}
              className="w-full bg-[#1e6f43] hover:bg-[#175634] text-white py-3 rounded-xl font-bold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Simpan & Konfirmasi Pesanan
            </button>

            <button
              onClick={() =>
                navigate("/dashboard/menu", {
                  state: {
                    pesanan: Object.fromEntries(
                      cartItems.map((item) => [
                        `${item.id}-${item.varian || "default"}`,
                        {
                          jumlah: item.jumlah,
                          varian: item.varian,
                          harga_terpilih: item.harga,
                        },
                      ])
                    ),
                  },
                })
              }
              className="w-full bg-[#1e6f43] hover:bg-[#175634] text-white py-3 rounded-xl font-bold transition-colors"
            >
              Tambah Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}