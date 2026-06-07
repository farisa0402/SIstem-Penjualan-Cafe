import { useEffect, useState } from "react";
import { supabase } from "../database/supabase";
import { Search, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoMesombang from "../assets/image.png";

export default function Laporan() {
  const [sudahFilter, setSudahFilter] = useState(false);

  const [grafikPendapatan, setGrafikPendapatan] = useState([]);
  const [grafikMenu, setGrafikMenu] = useState([]);

  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");

  const [laporan, setLaporan] = useState([]);

  const [summary, setSummary] = useState({
    transaksi: 0,
    produk: 0,
    pendapatan: 0,
    menuTerlaris: "-"
  });

  useEffect(() => {
    setLaporan([]);
    setGrafikPendapatan([]);
    setGrafikMenu([]);
  }, []);

  async function loadLaporan() {

    let query = supabase
      .from("Riwayat")
      .select("*")
      .order("tanggal", {
        ascending: true
      });

    if (dariTanggal) {
      query = query.gte(
        "tanggal",
        `${dariTanggal} 00:00:00`
      );
    }

    if (sampaiTanggal) {
      query = query.lte(
        "tanggal",
        `${sampaiTanggal} 23:59:59`
      );
    }

    const { data, error } =
      await query;

    console.log("Filter:", dariTanggal, sampaiTanggal);
    console.log("Data:", data);

    if (error) {
      console.log(error);
      return;
    }

    setLaporan(data || []);

    hitungSummary(data || []);
    setSudahFilter(true);
  }

  async function hitungSummary(riwayatData) {

    const transaksi = riwayatData.length;

    const totalPendapatan = riwayatData.reduce(
      (total, item) =>
        total + Number(item.total_harga || 0),
      0
    );

    const start = dariTanggal
      ? new Date(dariTanggal)
      : null;

    const end = sampaiTanggal
      ? new Date(sampaiTanggal)
      : null;

    let selisihHari = 0;

    if (start && end) {
      selisihHari =
        Math.ceil(
          (end - start) /
          (1000 * 60 * 60 * 24)
        ) + 1;
    }

    // ==========================
    // GRAFIK PENDAPATAN
    // ==========================

    const pendapatanPerPeriode = {};

    riwayatData.forEach(item => {

      const date = new Date(item.tanggal);

      let label = "";

      // Harian
      if (selisihHari <= 14) {

        label = date.toLocaleDateString(
          "id-ID",
          {
            day: "numeric",
            month: "short"
          }
        );

      }

      // Mingguan
      else if (selisihHari <= 90) {

        const minggu =
          Math.ceil(date.getDate() / 7);

        label = `Minggu ${minggu}`;

      }

      // Bulanan
      else {

        label = date.toLocaleDateString(
          "id-ID",
          {
            month: "short",
            year: "numeric"
          }
        );

      }

      if (!pendapatanPerPeriode[label]) {
        pendapatanPerPeriode[label] = {
          total: 0,
          tanggal: date
        };
      }

      pendapatanPerPeriode[label].total +=
        Number(item.total_harga || 0);

    });

    const dataGrafikPendapatan =
      Object.entries(pendapatanPerPeriode)
        .map(([label, data]) => ({
          label,
          total: data.total,
          tanggal: data.tanggal
        }))
        .sort((a, b) => a.tanggal - b.tanggal);

    console.log("Total Pendapatan:", totalPendapatan);
    console.log("Grafik:", dataGrafikPendapatan);

    setGrafikPendapatan(
      dataGrafikPendapatan
    );

    const pesananIds = riwayatData.map(
      item => item.id_pesanan
    );

    if (pesananIds.length === 0) {

      setSummary({
        transaksi: "",
        produk: "",
        pendapatan: "",
        menuTerlaris: ""
      });

      setGrafikMenu([]);

      return;
    }

    const { data: detail } =
      await supabase
        .from("Detail_Pesanan")
        .select(`
          jumlah,
          nama_menu
        `)
        .in("id_pesanan", pesananIds);

    let produkTerjual = 0;

    const menuCounter = {};

    detail?.forEach(item => {

      const jumlah =
        Number(item.jumlah || 0);

      produkTerjual += jumlah;

      if (!item.nama_menu) return;

      menuCounter[item.nama_menu] =
        (menuCounter[item.nama_menu] || 0)
        + jumlah;

    });

    // ==========================
    // TOP 5 MENU TERLARIS
    // ==========================
    let menuTerlaris = "-";
    let jumlahTerlaris = 0;

    Object.entries(menuCounter).forEach(
      ([nama, jumlah]) => {

        if (jumlah > jumlahTerlaris) {

          jumlahTerlaris = jumlah;
          menuTerlaris = nama;

        }

      }
    );

    const topMenu =
      Object.entries(menuCounter)
        .map(([nama, jumlah]) => ({
          nama,
          jumlah
        }))
        .sort((a, b) =>
          b.jumlah - a.jumlah
        )
        .slice(0, 5);

    setGrafikMenu(topMenu);

    setSummary({
      transaksi,
      produk: produkTerjual,
      pendapatan: totalPendapatan,
      menuTerlaris
    });
  }

  const rupiah = (angka) =>
    Number(angka || 0)
      .toLocaleString("id-ID");
  const downloadPDF = () => {

    const doc = new jsPDF();

    const img = new Image();
    img.src = logoMesombang;

    img.onload = () => {

      doc.addImage(
        img,
        "PNG",
        15,
        8,
        25,
        25
      );


      // KOP SURAT
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("MESOMBANG CAFE", 105, 15, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Jl. Boulevard 2. Manado",
        105,
        22,
        { align: "center" }
      );

      doc.text(
        "Telp: 082259530644 | Email: Mesombang2@gmail.com",
        105,
        28,
        { align: "center" }
      )

      // Garis pemisah
      doc.setLineWidth(0.8);
      doc.line(14, 34, 196, 34);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Periode : ${dariTanggal || "-"} s/d ${sampaiTanggal || "-"}`,
        14,
        55
      );

      doc.text(
        `Total Transaksi : ${summary.transaksi}`,
        14,
        63
      );

      doc.text(
        `Produk Terjual : ${summary.produk}`,
        14,
        71
      );

      doc.text(
        `Total Pendapatan : Rp ${rupiah(summary.pendapatan)}`,
        14,
        79
      );

      doc.text(
        `Menu Terlaris : ${summary.menuTerlaris}`,
        14,
        87
      );

      autoTable(doc, {

        startY: 95,

        head: [[
          "No Pesanan",
          "Tanggal",
          "Nama Pemesan",
          "Total Bayar"
        ]],

        body: laporan.map(item => [

          item.no_pesanan,

          new Date(
            item.tanggal
          ).toLocaleString("id-ID"),

          item.nama_pemesan,

          `Rp ${rupiah(
            item.total_harga
          )}`

        ]),

        styles: {
          fontSize: 10
        },

        headStyles: {
          fillColor: [107, 79, 79]
        }

      });

      doc.save(
        `Laporan-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
    };
  };

  function getMaxScale(nilai) {

    if (nilai <= 1000000) {
      return Math.ceil(nilai / 100000) * 100000;
    }

    if (nilai <= 5000000) {
      return Math.ceil(nilai / 500000) * 500000;
    }

    if (nilai <= 10000000) {
      return Math.ceil(nilai / 1000000) * 1000000;
    }

    return Math.ceil(nilai / 5000000) * 5000000;
  }

  const maxPendapatan = getMaxScale(
    Math.max(
      ...grafikPendapatan.map(item => item.total),
      1
    )
  );

  const stepPendapatan =
  maxPendapatan / 5;

  const maxMenu = Math.max(
    ...grafikMenu.map(x => x.jumlah),
    1
  );

  return (

    <div
      className="
      min-h-screen
      bg-[#F5EEE6]
      p-3
      md:p-8
      "
    >

      <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">
        LAPORAN PENJUALAN
      </h1>

      {/* FILTER */}

      <div
        className="
        bg-white
        rounded-xl
        p-6
        shadow-sm
        mb-6
        "
      >

        <div
          className="
          grid
          md:grid-cols-3
          gap-4
          "
        >

          <div>

            <label>
              Dari Tanggal
            </label>

            <input
              type="date"
              value={dariTanggal}
              onChange={(e) =>
                setDariTanggal(
                  e.target.value
                )
              }
              className="
              w-full
              border
              rounded-lg
              p-3
              mt-2
              "
            />

          </div>

          <div>

            <label>
              Sampai Tanggal
            </label>

            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) =>
                setSampaiTanggal(
                  e.target.value
                )
              }
              className="
              w-full
              border
              rounded-lg
              p-3
              mt-2
              "
            />

          </div>

          <div
            className="
            flex
            flex-col
            md:flex-row
            md:items-end
            gap-3
            "
          >

            <button
              onClick={loadLaporan}
              className="
              bg-green-500
              text-white
              px-6
              py-3
              rounded-lg
              flex
              items-center
              justify-center
              gap-2
              w-full
              md:w-auto
              "
            >
              <Search size={18} />
              Filter Laporan
            </button>

            <button
              onClick={downloadPDF}
              className="
              bg-[#6B4F4F]
              text-white
              px-6
              py-3
              rounded-lg
              flex
              items-center
              justify-center
              gap-2
              w-full
              md:w-auto
              "
            >
              <Download size={18} />
              Unduh PDF
            </button>

          </div>

        </div>

      </div>

      {/* SUMMARY */}

      <div
        className="
        grid
        grid-cols-2
        md:grid-cols-4
        gap-3
        md:gap-4
        mb-6
        "
      >

        <SummaryCard
          title="Total Transaksi"
          value={summary.transaksi || "-"}
        />

        <SummaryCard
          title="Produk Terjual"
          value={summary.produk || "-"}
        />

        <SummaryCard
          title="Total Pendapatan"
          value={
            summary.pendapatan
              ? `Rp ${rupiah(summary.pendapatan)}`
              : "-"
          }
        />

        <SummaryCard
          title="Menu Terlaris"
          value={summary.menuTerlaris || "-"}
        />

      </div>

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-6
        mb-6
        "
      >

        {/* Grafik Pendapatan */}

        <div className="bg-white rounded-xl shadow-sm p-5 md:col-span-2">
          <h2 className="text-xl font-bold mb-5">
            Trend Pendapatan
          </h2>

          {!sudahFilter ? (
            <p>Silakan pilih tanggal lalu klik Filter Laporan</p>
          ) : grafikPendapatan.length === 0 ? (
            <p>Tidak ada data</p>
          ) : (
  

          <div className="w-full relative border rounded-lg p-4">
            <svg
              width="100%"
              height="260"
              viewBox="0 0 1000 320"
              preserveAspectRatio="none"
            >
              {(() => {
                const max = maxPendapatan;
                const paddingX = 180;   // ← lebih lebar agar label rupiah muat
                const chartTop = 20;
                const chartBottom = 300; // ← turunkan agar Rp 0 ada di bawah, bukan tengah
                const chartLeft = paddingX;
                const chartRight = 960;
                const chartHeight = chartBottom - chartTop; // 280

                const step = max / 5;

                const points = grafikPendapatan
                  .map((item, index) => {
                    const x =
                      grafikPendapatan.length === 1
                        ? (chartLeft + chartRight) / 2
                        : chartLeft +
                          (index / (grafikPendapatan.length - 1)) *
                            (chartRight - chartLeft);

                    const y =
                      chartBottom -
                      (item.total / max) * chartHeight;

                    return `${x},${y}`;
                  })
                  .join(" ");

                const firstX =
                  grafikPendapatan.length === 1
                    ? (chartLeft + chartRight) / 2
                    : chartLeft;
                const lastX =
                  grafikPendapatan.length === 1
                    ? (chartLeft + chartRight) / 2
                    : chartRight;

                const areaPoints =
                  points + ` ${lastX},${chartBottom} ${firstX},${chartBottom}`;

                return (
                  <>
                    {/* Background area */}
                    <rect
                      x={chartLeft}
                      y={chartTop}
                      width={chartRight - chartLeft}
                      height={chartHeight}
                      fill="#fafafa"
                    />

                    {/* Grid horizontal + Label Y di dalam SVG */}
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const y = chartBottom - (i / 5) * chartHeight;
                      const nilai = step * i;
                      return (
                        <g key={i}>
                          <line
                            x1={chartLeft}
                            y1={y}
                            x2={chartRight}
                            y2={y}
                            stroke="#e5e5e5"
                            strokeWidth="1"
                          />
                          {/* Label rupiah sejajar persis dengan garis grid */}
                          <text
                            x={chartLeft - 35}
                            y={y + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill="#666"
                          >
                            {`Rp ${rupiah(nilai)}`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Grid vertikal */}
                    {grafikPendapatan.map((_, index) => {
                      const x =
                        grafikPendapatan.length === 1
                          ? (chartLeft + chartRight) / 2
                          : chartLeft +
                            (index / (grafikPendapatan.length - 1)) *
                              (chartRight - chartLeft);
                      return (
                        <line
                          key={`v-${index}`}
                          x1={x}
                          y1={chartTop}
                          x2={x}
                          y2={chartBottom}
                          stroke="#e5e5e5"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Sumbu Y */}
                    <line
                      x1={chartLeft}
                      y1={chartTop}
                      x2={chartLeft}
                      y2={chartBottom}
                      stroke="#888"
                      strokeWidth="2"
                    />

                    {/* Sumbu X */}
                    <line
                      x1={chartLeft}
                      y1={chartBottom}
                      x2={chartRight}
                      y2={chartBottom}
                      stroke="#888"
                      strokeWidth="2"
                    />

                    {/* Area shading */}
                    <polygon points={areaPoints} fill="#6B4F4F20" />

                    {/* Garis grafik */}
                    <polyline
                      fill="none"
                      stroke="#6B4F4F"
                      strokeWidth="3"
                      points={points}
                    />

                    {/* Titik + Label nilai di atas titik */}
                    {grafikPendapatan.map((item, index) => {
                      const x =
                        grafikPendapatan.length === 1
                          ? (chartLeft + chartRight) / 2
                          : chartLeft +
                            (index / (grafikPendapatan.length - 1)) *
                              (chartRight - chartLeft);
                      const y =
                        chartBottom - (item.total / max) * chartHeight;

                      return (
                        <g key={index}>
                          <circle cx={x} cy={y} r="5" fill="#6B4F4F" />
                          {/* Nilai di atas titik — opsional, hapus jika terlalu ramai */}
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6B4F4F"
                            fontWeight="600"
                          >
                            {`Rp ${rupiah(item.total)}`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Label tanggal / periode di bawah sumbu X */}
                    {grafikPendapatan.map((item, index) => {
                      const x =
                        grafikPendapatan.length === 1
                          ? (chartLeft + chartRight) / 2
                          : chartLeft +
                            (index / (grafikPendapatan.length - 1)) *
                              (chartRight - chartLeft);
                      return (
                        <text
                          key={`label-${index}`}
                          x={x}
                          y={chartBottom + 18}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#666"
                        >
                          {item.label}
                        </text>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          )}
        </div>

        {/* Top Menu */}

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold mb-5">
            Top 5 Menu Terlaris
          </h2>

          {grafikMenu.map((item, i) => {
            return (
              <div
                key={i}
                className="mb-4"
              >
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.nama}</span>
                  <span>{item.jumlah}</span>
                </div>

                <div className="h-6 bg-gray-200 rounded">
                  <div
                    className="h-6 bg-[#6B4F4F] rounded"
                    style={{
                      width: `${(item.jumlah / maxMenu) * 100}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* TABEL */}

      <div
        className="
        bg-white
        rounded-xl
        shadow-sm
        overflow-x-auto
        "
      >

        <table className="min-w-[700px] w-full">
          <thead>
            <tr className="bg-[#6B4F4F] text-white">
              <th className="p-4 w-[20%] text-left">
                No Pesanan
              </th>

              <th className="p-4 w-[30%] text-left">
                Waktu
              </th>

              <th className="p-4 w-[30%] text-left">
                Nama Pemesan
              </th>

              <th className="p-4 w-[20%] text-left">
                Total Bayar
              </th>
            </tr>
          </thead>

          <tbody>
            {laporan.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4 w-[20%]">
                  {item.no_pesanan}
                </td>

                <td className="p-4 w-[30%]">
                  {new Date(item.tanggal)
                    .toLocaleString("id-ID")}
                </td>

                <td className="p-4 w-[30%]">
                  {item.nama_pemesan}
                </td>

                <td className="p-4 w-[20%]">
                  Rp {rupiah(item.total_harga)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>

  );

}

function SummaryCard({
  title,
  value
}) {

  return (

    <div
      className="
      bg-white
      rounded-xl
      shadow-sm
      p-5
      "
    >

      <p
        className="
        text-gray-500
        text-sm
        "
      >
        {title}
      </p>

      <h2
        className="
        text-lg
        md:text-2xl
        font-bold
        mt-2
        break-words
        "
      >
        {value}
      </h2>

    </div>

  );

}