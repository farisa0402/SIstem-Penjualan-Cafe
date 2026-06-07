import { useEffect, useState } from "react";
import { supabase } from "../database/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  PlusCircle,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  ShoppingCart,
} from "lucide-react";

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuData, setMenuData] = useState([]);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");


  const [showKategori, setShowKategori] = useState(false);

  // DROPDOWN TITIK TIGA
  const [openMenuId, setOpenMenuId] = useState(null);

  // STATE KERANJANG
  const [pesanan, setPesanan] = useState({});

  // ==========================================
  // STATE BARU: UNTUK MODAL SELEKSI MINUMAN
  // ==========================================
  const [showVarianModal, setShowVarianModal] = useState(false);
  const [selectedItemMinuman, setSelectedItemMinuman] = useState(null);
  const [varianTerpilih, setVarianTerpilih] = useState("Panas"); // Default opsi awal

  useEffect(() => {
    getMenu();

    // AMBIL PESANAN JIKA KEMBALI DARI TRANSAKSI
    if (location.state?.pesanan) {
      setPesanan(location.state.pesanan);
    }
  }, []);

  async function getMenu() {

    // AMBIL DATA MENU
    const { data: menuData, error: menuError } =
      await supabase
        .from("Menu")
        .select("*")
        .order("id", { ascending: false });

    if (menuError) {
      console.log("MENU ERROR:", menuError);
      return;
    }

    // AMBIL DATA STOK
    const { data: stokData, error: stokError } =
      await supabase
        .from("Stok")
        .select("*");

    if (stokError) {
      console.log("STOK ERROR:", stokError);
      return;
    }

    // GABUNGKAN MENU + STOK
    const gabungData = menuData.map((menu) => {

      // CARI STOK BERDASARKAN NAMA MENU
      const stokItem = stokData.find(
        (stok) =>
          stok.nama_menu === menu.nama_menu
      );

      return {
        ...menu,

        // JIKA TIDAK ADA STOK
        stok: stokItem
          ? Number(stokItem.jumlah)
          : 0,
      };

    });

    setMenuData(gabungData);

  }

  // HAPUS MENU
  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus menu ini?"
    );

    if (!confirmDelete) return;

    try {

      // =========================================
      // HAPUS DETAIL PESANAN TERLEBIH DAHULU
      // =========================================
      const { error: detailError } = await supabase
        .from("Detail_Pesanan")
        .delete()
        .eq("id_menu", id);

      if (detailError) {
        console.log("DETAIL ERROR:", detailError);
      }

      // =========================================
      // AMBIL NAMA MENU
      // =========================================
      const { data: menuItem, error: menuItemError } =
        await supabase
          .from("Menu")
          .select("nama_menu")
          .eq("id", id)
          .single();

      if (menuItemError) {
        console.log("MENU ITEM ERROR:", menuItemError);
        return;
      }

      // =========================================
      // HAPUS STOK BERDASARKAN NAMA MENU
      // =========================================
      const { error: stokDeleteError } =
        await supabase
          .from("Stok")
          .delete()
          .eq("nama_menu", menuItem.nama_menu);

      if (stokDeleteError) {
        console.log("STOK DELETE ERROR:", stokDeleteError);
      }

      // =========================================
      // HAPUS MENU
      // =========================================
      const { error } = await supabase
        .from("Menu")
        .delete()
        .eq("id", id);

      if (error) {
        console.log("DELETE ERROR:", error);
        alert("Gagal menghapus menu");
        return;
      }

      alert("Menu berhasil dihapus");

      setOpenMenuId(null);

      getMenu();

    } catch (err) {
      console.log(err);
      alert("Terjadi kesalahan");
    }
  }

  // LOGIKA UTAMA: HANDLING TAMBAH PESANAN & SELEKSI MINUMAN
  const handleTambahPesanan = (item) => {

    const jumlahSaatIni = Object.entries(pesanan)
      .filter(([key]) =>
        key.startsWith(`${item.id}-`)
      )
      .reduce(
        (total, [, value]) =>
          total + value.jumlah,
        0
      );

    // CEK STOK
    if (jumlahSaatIni >= item.stok) {
      alert(`Stok ${item.nama_menu} hanya tersedia ${item.stok}`);
      return;
    }

    const apakahMinuman =
      !item.harga_makanan &&
      (item.harga_dingin || item.harga_panas);

    // JIKA MINUMAN
    if (apakahMinuman) {
      setSelectedItemMinuman(item);
      setVarianTerpilih("Panas");
      setShowVarianModal(true);
      return;
    }

    // JIKA MAKANAN
    setPesanan((prev) => ({
      ...prev,
      [item.id]: {
        jumlah: (prev[item.id]?.jumlah || 0) + 1,
        varian: null,
        harga_terpilih:
          item.harga_makanan ||
          item.harga ||
          0,
      },
    }));
  };

  // HANDLER SUBMIT MODAL MINUMAN
  const handleSimpanVarianMinuman = () => {
    if (!selectedItemMinuman) return;

    // Tentukan harga real berdasarkan tombol suhu yang diklik user
    const hargaFix = varianTerpilih === "Panas"
      ? (selectedItemMinuman.harga_panas || selectedItemMinuman.harga)
      : (selectedItemMinuman.harga_dingin || selectedItemMinuman.harga);

    setPesanan((prev) => {

      const key =
        `${selectedItemMinuman.id}-${varianTerpilih}`;

      const jumlahLama =
        prev[key]?.jumlah || 0;

      return {
        ...prev,
        [key]: {
          jumlah: jumlahLama + 1,
          varian: varianTerpilih,
          harga_terpilih: hargaFix,
        },
      };

    });

    setShowVarianModal(false);
    setSelectedItemMinuman(null);
  };

  // KURANG PESANAN
  const handleKurangPesanan = (key) => {

    setPesanan((prev) => {

      const itemAda = prev[key];

      if (!itemAda) return prev;

      const jumlahBaru =
        itemAda.jumlah - 1;

      if (jumlahBaru <= 0) {

        const {
          [key]: _,
          ...sisaPesanan
        } = prev;

        return sisaPesanan;
      }

      return {
        ...prev,
        [key]: {
          ...itemAda,
          jumlah: jumlahBaru,
        },
      };
    });
  };

  // TOTAL ITEM KERANJANG
  const totalItemKeranjang = Object.values(pesanan).reduce(
    (total, item) => total + item.jumlah,
    0
  );

  // FILTER MENU
  const filteredMenu = menuData.filter((item) => {
    const cocokSearch = item.nama_menu
      ?.toLowerCase()
      .includes(search.toLowerCase());

    if (kategori === "Semua") {
      return cocokSearch;
    }

    if (
      kategori === "Makanan" &&
      item.harga_makanan
    ) {
      return cocokSearch;
    }

    if (
      kategori === "Minuman" &&
      (item.harga_dingin || item.harga_panas)
    ) {
      return cocokSearch;
    }

    return false;
  });

  return (
    <div
      style={{
        padding: "20px 30px",
        background: "#EFE6DB",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* SEARCH */}
      <div
        style={{
          marginBottom: "20px",
          maxWidth: "550px",
          position: "relative",
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#A09890",
          }}
        />

        <input
          type="text"
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 15px 10px 42px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            fontSize: "14px",
            background: "white",
            color: "#333",
          }}
        />
      </div>

      {/* FILTER */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        {/* TAMBAH MENU */}
        <button
          onClick={() =>
            navigate("/dashboard/tambah-menu")
          }
          style={{
            background: "#4A2E2B",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <PlusCircle size={16} />
          Tambah menu
        </button>

        {/* DROPDOWN */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() =>
              setShowKategori(!showKategori)
            }
            style={{
              background: "#4A2E2B",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "120px",
              justifyContent: "space-between",
            }}
          >
            {kategori === "Semua"
              ? "Kategori"
              : kategori}

            <ChevronDown size={16} />
          </button>

          {showKategori && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                left: 0,
                background: "white",
                width: "100%",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 10,
              }}
            >
              {[
                "Semua",
                "Makanan",
                "Minuman",
              ].map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setKategori(item);
                    setShowKategori(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom:
                      "1px solid #F0EAE1",
                    fontWeight: "500",
                    fontSize: "13px",
                    color: "#333",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GRID MENU */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {filteredMenu.map((item) => {
          const jumlahItem = Object.entries(pesanan)
            .filter(([key]) =>
              key.startsWith(`${item.id}-`)
            )
            .reduce(
              (total, [, value]) =>
                total + value.jumlah,
              0
            );

          const isStokHabis = item.stok <= 0;

          return (
            <div
              key={item.id}
              className="
                relative
                bg-[#F8F3EE]
                rounded-2xl
                p-2 md:p-3
                border
                border-[#E6DED4]
                shadow
                flex
                flex-col
                justify-between
                min-h-[220px]
                md:min-h-[300px]
              "
            >
              {/* TITIK TIGA */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  zIndex: 5,
                }}
              >
                <button
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === item.id
                        ? null
                        : item.id
                    )
                  }
                  style={{
                    border: "none",
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <MoreVertical
                    size={15}
                    color="#333"
                  />
                </button>

                {openMenuId === item.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "32px",
                      right: 0,
                      background: "white",
                      borderRadius: "8px",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                      minWidth: "110px",
                    }}
                  >
                    <div
                      onClick={() => {
                        setOpenMenuId(null);
                        navigate(
                          `/dashboard/ubah-menu/${item.id}`
                        );
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        borderBottom:
                          "1px solid #eee",
                        color: "#333",
                      }}
                    >
                      <Pencil size={12} />
                      Ubah
                    </div>

                    <div
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: "red",
                      }}
                    >
                      <Trash2 size={12} />
                      Hapus
                    </div>
                  </div>
                )}
              </div>

              {/* FOTO */}
              <img
                src={
                  item.gambar
                    ? item.gambar
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                className="
                  w-full
                  h-[100px]
                  md:h-[170px]
                  object-cover
                  rounded-xl
                  mb-2
                  md:mb-3
                "
              />

              {/* NAMA */}
              <h3 className="text-xs md:text-base font-bold text-[#4A2E2B]">
                {item.nama_menu}
              </h3>

              {/* HARGA */}
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#555",
                  marginBottom: "14px",
                }}
              >
                {item.harga_makanan && (
                  <p style={{ margin: 0 }}>
                    Rp{" "}
                    {Number(
                      item.harga_makanan
                    ).toLocaleString("id-ID")}
                  </p>
                )}

                {!item.harga_makanan && (
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                    }}
                  >
                    {item.harga_panas && (
                      <p style={{ margin: 0 }}>
                        P: Rp{" "}
                        {Number(
                          item.harga_panas
                        ).toLocaleString("id-ID")}
                      </p>
                    )}

                    {item.harga_dingin && (
                      <p style={{ margin: 0 }}>
                        D: Rp{" "}
                        {Number(
                          item.harga_dingin
                        ).toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* BUTTON */}
              {isStokHabis ? (
                <div
                  style={{
                    width: "100%",
                    background: "#CFCFCF",
                    color: "white",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "15px",
                    fontWeight: "700",
                    textAlign: "center",
                    marginTop: "auto",
                  }}
                >
                  Stok Habis
                </div>
              ) : jumlahItem > 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#12A150",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginTop: "auto",
                  }}
                >
                  <button
                    onClick={() => {

                      const keyTerakhir =
                        Object.keys(pesanan)
                          .find((key) =>
                            key.startsWith(`${item.id}-`)
                          );

                      if (keyTerakhir) {
                        handleKurangPesanan(keyTerakhir);
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "22px",
                      width: "45px",
                      height: "40px",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>

                  <span
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: "16px",
                    }}
                  >
                    {jumlahItem}
                  </span>

                  <button
                    onClick={() => handleTambahPesanan(item)}
                    disabled={jumlahItem >= item.stok}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "22px",
                      width: "45px",
                      height: "40px",
                      cursor:
                        jumlahItem >= item.stok
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        jumlahItem >= item.stok
                          ? 0.5
                          : 1,
                    }}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() =>
                    handleTambahPesanan(item)
                  }
                  style={{
                    width: "100%",
                    background: "#12A150",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "18px",
                    fontWeight: "700",
                    cursor: "pointer",
                    marginTop: "auto",
                  }}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FLOATING CART (KIRIM DATA KE TRANSAKSI) */}
      {totalItemKeranjang > 0 && (
        <button
          onClick={() => {
            const dataKeranjang = [];

            Object.entries(pesanan).forEach(([key, value]) => {

              const idMenu = parseInt(key.split("-")[0]);

              const item = menuData.find(
                (menu) => menu.id === idMenu
              );

              if (!item) return;

              dataKeranjang.push({
                id: idMenu,
                nama_menu: item.nama_menu,
                gambar: item.gambar,
                id_kategori: item.id_kategori,
                harga: value.harga_terpilih,
                jumlah: value.jumlah,
                varian: value.varian,
                harga_panas: item.harga_panas,
                harga_dingin: item.harga_dingin,

                // TAMBAHAN
                stok: item.stok,
              });

            });

            navigate(
              "/dashboard/transaksi",
              {
                state: {
                  cart: dataKeranjang,
                  pesanan: pesanan,
                },
              }
            );
          }}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            background: "#4A2E2B",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow:
              "0 4px 16px rgba(0,0,0,0.25)",
            zIndex: 100,
          }}
        >
          <ShoppingCart size={26} />

          <div
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              background: "#12A150",
              color: "white",
              borderRadius: "50%",
              minWidth: "22px",
              height: "22px",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #EFE6DB",
              boxSizing: "border-box",
            }}
          >
            {totalItemKeranjang}
          </div>
        </button>
      )}

      {/* ========================================================
          POP-UP MODAL BENTUK OPSIONAL SUHU MINUMAN (DESAIN ANDA)
         ======================================================== */}
      {showVarianModal && selectedItemMinuman && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              width: "90%",
              maxWidth: "500px",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              color: "#333",
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #EEE",
                paddingBottom: "12px",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>
                Opsi Minuman: {selectedItemMinuman.nama_menu}
              </h3>
              <button
                onClick={() => setShowVarianModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>

            {/* Container Dua Tombol Sesuai Gambar Desain */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "15px",
              }}
            >
              {/* OPSI PANAS */}
              <div
                onClick={() => setVarianTerpilih("Panas")}
                style={{
                  background: "#f15858ff",
                  color: "white",
                  borderRadius: "12px",
                  padding: "20px 10px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: varianTerpilih === "Panas" ? "4px solid #f15858ff" : "4px solid transparent",
                  boxShadow: varianTerpilih === "Panas" ? "0 4px 12px rgba(242, 47, 47, 0.5)" : "none",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>☕</div>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>Panas (Hot)</div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.3)",
                    borderRadius: "6px",
                    padding: "3px 0",
                    fontSize: "12px",
                    marginTop: "10px",
                    fontWeight: "600",
                  }}
                >
                  {varianTerpilih === "Panas" ? "Terpilih" : "Pilih"}
                </div>
              </div>

              {/* OPSI DINGIN */}
              <div
                onClick={() => setVarianTerpilih("Dingin")}
                style={{
                  background: "#6cb9e9ff",
                  color: "white",
                  borderRadius: "12px",
                  padding: "20px 10px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: varianTerpilih === "Dingin" ? "4px solid #6cb9e9ff" : "4px solid transparent",
                  boxShadow: varianTerpilih === "Dingin" ? "0 4px 12px rgba(28, 150, 236, 0.5)" : "none",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>❄️</div>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>Dingin (Cold)</div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.3)",
                    borderRadius: "6px",
                    padding: "3px 0",
                    fontSize: "12px",
                    marginTop: "10px",
                    fontWeight: "600",
                  }}
                >
                  {varianTerpilih === "Dingin" ? "Terpilih" : "Pilih"}
                </div>
              </div>
            </div>

            {/* Sub-label informasi */}
            <p style={{ textAlign: "center", fontSize: "12px", color: "#666", margin: "10px 0 20px" }}>
              Pilih opsi untuk item {selectedItemMinuman.nama_menu}
            </p>

            {/* Tombol Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowVarianModal(false)}
                style={{
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "#4B5563",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSimpanVarianMinuman}
                style={{
                  background: "#4A2E2B",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}