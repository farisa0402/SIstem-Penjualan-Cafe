import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../database/supabase";

function Stok() {

  // STATE
  const [stokData, setStokData] = useState([]);
  const [search, setSearch] = useState("");

  // GET DATA
  useEffect(() => {
    getStok();
  }, []);

  // GET STOK
  async function getStok() {

    const { data, error } = await supabase
      .from("Stok")
      .select(`
        *,
        Status_Stok (
          id,
          status
        )
      `)
      .order("id", { ascending: false });

    if (error) {

      console.log("ERROR :", error);

    } else {

      console.log("DATA STOK :", data);

      setStokData(data || []);

    }

  }

  // FILTER SEARCH
  const filteredData = stokData.filter((item) =>
    (item.nama_menu || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <div className="px-4 md:px-8 py-6">

      {/* TITLE */}
      <h1
        className="
          text-2xl
          md:text-3xl
          font-abhaya
          text-[#2b1a17]
          mb-6
        "
      >
        STOK
      </h1>

      {/* TOP BAR */}
      <div
        className="
          flex
          flex-col
          md:flex-row
          gap-4
          md:items-center
          md:justify-between
          mb-6
        "
      >

        {/* SEARCH */}
        <div className="relative w-full md:w-[350px]">

          <Search
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
            size={18}
          />

          <input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              pl-10
              pr-4
              py-2.5
              rounded-xl
              bg-[#f4f1ee]
              outline-none
              text-sm
              shadow-sm
              border
              border-transparent
              focus:border-[#5c3a32]
            "
          />

        </div>

        {/* BUTTON */}
        <Link
          to="/dashboard/tambah-stok"
          className="
            flex
            items-center
            justify-center
            gap-2
            bg-[#5c3a32]
            text-white
            px-5
            py-2.5
            rounded-xl
            hover:bg-[#4a2d26]
            transition
            text-sm
            font-medium
            shadow-sm
            whitespace-nowrap
          "
        >

          <Plus size={16} />

          Tambah stok

        </Link>

      </div>

      {/* MOBILE CARD */}
      <div className="md:hidden space-y-4">

        {filteredData.length > 0 ? (

          filteredData.map((item) => {

            // STATUS DARI STOK
            const status =
              Number(item.jumlah) > 0
                ? "Tersedia"
                : "Habis";

            return (

              <div
                key={item.id}
                className="
                  bg-[#f4f1ee]
                  rounded-2xl
                  p-5
                  shadow-sm
                  border
                  border-[#ebe6e1]
                "
              >

                {/* NAMA */}
                <div className="mb-4">

                  <p className="text-xs text-gray-500 mb-1">
                    Nama Menu
                  </p>

                  <h3
                    className="
                      text-base
                      font-semibold
                      text-[#3b1f1a]
                    "
                  >
                    {item.nama_menu}
                  </h3>

                </div>

                {/* STOK + STATUS */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  {/* STOK */}
                  <div>

                    <p className="text-xs text-gray-500 mb-1">
                      Stok
                    </p>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[#3b1f1a]
                      "
                    >
                      {item.jumlah}
                    </p>

                  </div>

                  {/* STATUS */}
                  <div className="text-right">

                    <p className="text-xs text-gray-500 mb-2">
                      Status
                    </p>

                    <span
                      className={`
                        inline-block
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium
                        text-white
                        ${status === "Tersedia"
                          ? "bg-green-500"
                          : "bg-red-500"
                        }
                      `}
                    >
                      {status}
                    </span>

                  </div>

                </div>

              </div>

            );

          })

        ) : (

          <div className="text-center text-gray-500 py-10">
            Data stok belum ada
          </div>

        )}

      </div>

      {/* DESKTOP TABLE */}
      <div
        className="
          hidden
          md:block
          bg-[#f4f1ee]
          rounded-2xl
          shadow-sm
          overflow-hidden
          border
          border-[#ebe6e1]
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* HEADER */}
            <thead
              className="
                bg-[#ebe6e1]
                text-[#3b1f1a]
              "
            >

              <tr>

                <th
                  className="
                    px-8
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  "
                >
                  Nama Menu
                </th>

                <th
                  className="
                    px-8
                    py-4
                    text-center
                    text-sm
                    font-semibold
                  "
                >
                  Stok
                </th>

                <th
                  className="
                    px-8
                    py-4
                    text-center
                    text-sm
                    font-semibold
                  "
                >
                  Status
                </th>

              </tr>

            </thead>

            {/* BODY */}
            <tbody>

              {filteredData.length > 0 ? (

                filteredData.map((item) => {

                  // STATUS DARI STOK
                  const status =
                    Number(item.jumlah) > 0
                      ? "Tersedia"
                      : "Habis";

                  return (

                    <tr
                      key={item.id}
                      className="
                        border-t
                        border-[#ebe6e1]
                        hover:bg-[#efebe7]
                        transition
                      "
                    >

                      {/* NAMA */}
                      <td
                        className="
                          px-8
                          py-5
                          text-sm
                          font-medium
                          text-[#3b1f1a]
                        "
                      >
                        {item.nama_menu}
                      </td>

                      {/* STOK */}
                      <td
                        className="
                          px-8
                          py-5
                          text-center
                          text-sm
                          text-[#3b1f1a]
                        "
                      >
                        {item.jumlah}
                      </td>

                      {/* STATUS */}
                      <td className="px-8 py-5 text-center">

                        <span
                          className={`
                            inline-block
                            px-4
                            py-1.5
                            rounded-full
                            text-xs
                            font-medium
                            text-white
                            ${status === "Tersedia"
                              ? "bg-green-500"
                              : "bg-red-500"
                            }
                          `}
                        >
                          {status}
                        </span>

                      </td>

                    </tr>

                  );

                })

              ) : (

                <tr>

                  <td
                    colSpan="3"
                    className="
                      text-center
                      py-10
                      text-gray-500
                    "
                  >
                    Data stok belum ada
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default Stok;