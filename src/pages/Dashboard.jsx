import { useState, useEffect } from "react";
import { Wallet, FileText, Coffee } from "lucide-react";
import { supabase } from "../database/supabase";
import DetailRiwayat from "./DetailRiwayat";

function Dashboard() {

  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [transaksiHariIni, setTransaksiHariIni] = useState(0);
  const [menuTerlaris, setMenuTerlaris] = useState("-");
  const [topMenus, setTopMenus] = useState([]);
  const [riwayatTerbaru, setRiwayatTerbaru] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [detailMenu, setDetailMenu] = useState([]);

  useEffect(() => {

    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 3000);

    return () => clearInterval(interval);

  }, []);

  async function loadDashboard() {
    try {

      const { data: riwayat } = await supabase
        .from("Riwayat")
        .select("*");

      console.log("RIWAYAT:", riwayat);

      const today = new Date();

      const riwayatHariIni = (riwayat || []).filter((item) => {

        if (!item.tanggal) return false;

        const trxDate = new Date(item.tanggal);

        return (
          trxDate.getDate() === today.getDate() &&
          trxDate.getMonth() === today.getMonth() &&
          trxDate.getFullYear() === today.getFullYear()
        );

      });

      const sortedRiwayat = riwayatHariIni.sort(
        (a, b) =>
          new Date(b.tanggal) -
          new Date(a.tanggal)
      );

      setRiwayatTerbaru(sortedRiwayat);

      const transaksiToday = riwayatHariIni;

      console.log("TRANSAKSI HARI INI:", transaksiToday);

      const total = transaksiToday.reduce(
        (sum, item) =>
          sum + Number(item.total_harga || 0),
        0
      );

      setTotalPendapatan(total);

      setTransaksiHariIni(transaksiToday.length);

      const idPesananHariIni = transaksiToday.map((item) => item.id_pesanan);

      const { data: detail } = await supabase
        .from("Detail_Pesanan")
        .select(`
                    jumlah,
                    id_pesanan,
                    nama_menu
                `)
        .in("id_pesanan", idPesananHariIni);

      console.log("DETAIL DASHBOARD:", detail);

      const menuCount = {};

      detail?.forEach((item) => {

        const nama = item.nama_menu;

        if (!nama) return;

        menuCount[nama] =
          (menuCount[nama] || 0) +
          Number(item.jumlah || 0);

      });

      let namaTerlaris = "-";
      let jumlahTerlaris = 0;

      Object.entries(menuCount).forEach(
        ([nama, jumlah]) => {

          if (jumlah > jumlahTerlaris) {
            jumlahTerlaris = jumlah;
            namaTerlaris = nama;
          }

        }
      );

      setMenuTerlaris(namaTerlaris);

      const sortedMenus =
        Object.entries(menuCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

      setTopMenus(sortedMenus);

    } catch (err) {

      console.log(err);

    }
  }

  async function fetchDetailMenu(idPesanan) {

    const { data, error } = await supabase
      .from("Detail_Pesanan")
      .select(`
        id,
        id_pesanan,
        nama_menu,
        harga,
        jumlah,
        subtotal
        `)
      .eq("id_pesanan", idPesanan);

    if (error) {
      console.log(error);
      return;
    }

    setDetailMenu(data || []);
  }


  return (
    <div className="px-4 md:px-8 py-6">

      <h1 className="text-xl sm:text-2xl md:text-3xl font-abhaya mb-6">
        BERANDA
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">

        <Card icon={<Wallet size={16} />} title="Total Pendapatan" value={`Rp ${totalPendapatan.toLocaleString("id-ID")}`} />

        <Card icon={<FileText size={16} />} title="Transaksi hari ini" value={`${transaksiHariIni} Transaksi`} />

        <Card icon={<Coffee size={16} />} title="Menu terlaris" value={menuTerlaris} />

      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-[#f4f1ee] rounded-2xl shadow-md p-5 mb-10">

        <h3 className="font-semibold mb-4">
          Riwayat Transaksi Terbaru
        </h3>

        <div className="overflow-x-auto overflow-y-auto max-h-[300px]">

          <table className="w-full min-w-[650px]">

            <thead>

              <tr className="border-b">

                <th className="text-left py-3">
                  No Pesanan
                </th>

                <th className="text-left py-3">
                  Nama Pemesan
                </th>

                <th className="text-left py-3">
                  Total
                </th>

                <th className="text-left py-3">
                  Tanggal
                </th>

              </tr>

            </thead>

            <tbody>

              {riwayatTerbaru.length > 0 ? (

                riwayatTerbaru.map((item) => (

                  <tr
                    key={item.id}
                    className="
                        border-b
                        cursor-pointer
                        hover:bg-gray-100
                    "
                    onClick={async () => {

                      setSelectedData(item);

                      await fetchDetailMenu(
                        item.id_pesanan
                      );

                      setOpenDetail(true);

                    }}
                  >

                    <td className="py-3">
                      {item.no_pesanan}
                    </td>

                    <td className="py-3">
                      {item.nama_pemesan}
                    </td>

                    <td className="py-3">
                      Rp {Number(
                        item.total_harga || 0
                      ).toLocaleString("id-ID")}
                    </td>

                    <td className="py-3">
                      {item.tanggal
                        ? new Date(item.tanggal)
                          .toLocaleString("id-ID")
                        : "-"}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="4"
                    className="text-center py-5"
                  >
                    Belum ada transaksi
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MENU TERLARIS */}
      <div className="flex justify-center">
        <div className="w-full sm:max-w-md bg-[#f4f1ee] rounded-2xl shadow-md p-5">
          <h3 className="text-center mb-4 font-semibold">Menu terlaris</h3>

          {topMenus.map(([nama, jumlah]) => {

            const max = topMenus[0]?.[1] || 1;

            return (
              <Progress
                key={nama}
                label={nama}
                value={`${((jumlah / max) * 100).toFixed(0)}%`}
              />
            );

          })}
        </div>
      </div>

      <DetailRiwayat
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        dataPesanan={selectedData}
        detailMenu={detailMenu}
      />

    </div>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="bg-[#f4f1ee] rounded-2xl shadow-md p-5">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon} {title}
      </div>

      <h2 className="text-base sm:text-lg font-semibold mt-3 break-words">
        {value}
      </h2>
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div className="mb-4">
      <p className="text-xs sm:text-sm mb-1 break-words">
        {label}
      </p>

      <div className="w-full h-2 bg-gray-300 rounded-full">
        <div
          className="h-2 bg-[#5c3a32] rounded-full"
          style={{ width: value }}
        />
      </div>
    </div>
  );
}
export default Dashboard;