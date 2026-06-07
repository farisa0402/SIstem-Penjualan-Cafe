import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabase";

function TambahStok() {

  const navigate = useNavigate();

  // STATE
  const [menuData, setMenuData] = useState([]);

  const [nama, setNama] = useState("");
  const [stok, setStok] = useState("");

  // GET MENU
  useEffect(() => {
    getMenu();
  }, []);

  async function getMenu() {

    const { data, error } = await supabase
      .from("Menu")
      .select("nama_menu")
      .order("nama_menu", { ascending: true });

    if (error) {

      console.log(error);

    } else {

      setMenuData(data || []);

    }

  }

  // SIMPAN DATA
  async function handleSubmit(e) {

    e.preventDefault();

    // STATUS
    // 1 = Tersedia
    // 2 = Habis
    const idStatus =
      Number(stok) > 0 ? 1 : 2;

    // CEK APAKAH MENU SUDAH ADA DI STOK
    const { data: cekData } = await supabase
      .from("Stok")
      .select("*")
      .eq("nama_menu", nama)
      .single();

    // JIKA SUDAH ADA → UPDATE STOK
    if (cekData) {

      const totalStok =
        Number(cekData.jumlah) + Number(stok);

      const statusBaru =
        totalStok > 0 ? 1 : 2;

      const { error } = await supabase
        .from("Stok")
        .update({
          jumlah: totalStok,
          id_status: statusBaru,
        })
        .eq("id", cekData.id);

      if (error) {

        console.log(error);
        alert("Gagal update stok");

      } else {

        alert("Stok berhasil ditambahkan");
        navigate("/dashboard/stok");

      }

    }

    // JIKA BELUM ADA → INSERT DATA BARU
    else {

      const { error } = await supabase
        .from("Stok")
        .insert([
          {
            nama_menu: nama,
            jumlah: Number(stok),
            id_status: idStatus,
          },
        ]);

      if (error) {

        console.log(error);
        alert("Gagal menambahkan stok");

      } else {

        alert("Stok berhasil ditambahkan");
        navigate("/dashboard/stok");

      }

    }

  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-6">

      {/* MODAL */}
      <div className="bg-[#f4f1ee] w-full max-w-[750px] rounded-2xl shadow-xl relative">

        {/* CLOSE BUTTON */}
        <Link
          to="/dashboard/stok"
          className="absolute top-5 right-5"
        >
          <X size={24} className="text-black" />
        </Link>

        {/* CONTENT */}
        <div className="px-6 md:px-12 py-10">

          {/* TITLE */}
          <h1 className="text-3xl font-bold text-center text-[#5c3a32] mb-10">
            Tambah Stok
          </h1>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* NAMA MENU */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">

              <label className="w-[140px] text-[#5c3a32] font-semibold">
                Nama Menu
              </label>

              <select
                value={nama}
                onChange={(e) =>
                  setNama(e.target.value)
                }
                required
                className="
                  flex-1
                  border
                  border-gray-300
                  rounded-md
                  px-4
                  py-2
                  outline-none
                  focus:border-[#5c3a32]
                  bg-white
                "
              >

                <option value="">
                  Pilih menu
                </option>

                {menuData.map((item, index) => (
                  <option
                    key={index}
                    value={item.nama_menu}
                  >
                    {item.nama_menu}
                  </option>
                ))}

              </select>

            </div>

            {/* STOK */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">

              <label className="w-[140px] text-[#5c3a32] font-semibold">
                Stok
              </label>

              <input
                type="number"
                min="0"
                placeholder="Masukkan jumlah stok"
                value={stok}
                onChange={(e) =>
                  setStok(e.target.value)
                }
                required
                className="
                  flex-1
                  border
                  border-gray-300
                  rounded-md
                  px-4
                  py-2
                  outline-none
                  focus:border-[#5c3a32]
                "
              />

            </div>

            {/* BUTTON */}
            <div className="flex justify-end gap-3 mt-12">

              <Link
                to="/dashboard/stok"
                className="
                  px-5 py-2
                  border
                  rounded-md
                  text-sm
                  hover:bg-gray-100
                "
              >
                Batal
              </Link>

              <button
                type="submit"
                className="
                  px-5 py-2
                  bg-[#5c3a32]
                  text-white
                  rounded-md
                  text-sm
                  hover:opacity-90
                "
              >
                Simpan
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}

export default TambahStok;