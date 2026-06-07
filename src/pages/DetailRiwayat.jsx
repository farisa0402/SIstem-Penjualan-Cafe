import { X, Download } from "lucide-react";

export default function DetailRiwayat({
    open,
    onClose,
    dataPesanan,
    detailMenu
}) {

    if (!open || !dataPesanan) return null;

    console.log("DATA PESANAN:", dataPesanan);
    console.log("DETAIL MENU MODAL:", detailMenu);

    const formatRupiah = (angka) => {
        return Number(angka || 0).toLocaleString("id-ID");
    };

    const totalHarga = (detailMenu || []).reduce((total, item) => {
        return total + (Number(item.subtotal) || 0);
    }, 0);

    return (

        <div className="
        fixed inset-0
        bg-black/40
        flex justify-center items-center
        z-50
        ">

            <div className="
            bg-[#F8F3EE]
            w-[650px]
            rounded-2xl
            p-6
            shadow-xl
            relative
            ">

                {/* HEADER */}
                <div className="
                flex justify-between
                items-center
                mb-5
                ">

                    <h2 className="text-3xl font-bold">
                        Detail Riwayat Pesanan
                    </h2>

                </div>

                {/* STRUK */}
                <div className="
                bg-white
                rounded-2xl
                p-6
                font-mono
                shadow-sm
                ">

                    <div className="text-center">

                        <h1 className="text-3xl font-bold mb-2">
                            ☕ MESOMBANG CAFE
                        </h1>

                    </div>

                    <hr className="
                    my-5
                    border-dashed
                    border-gray-500
                    " />

                    {/* INFO PESANAN */}
                    <div className="text-lg">

                        <p>
                            No. Pesanan: {" "}
                            {dataPesanan.no_pesanan}
                        </p>

                        <p>
                            <b>Nama:</b>{" "}
                            {dataPesanan.nama_pemesan}
                        </p>

                        <p>
                            <b>Tanggal:</b>{" "}
                            {dataPesanan.tanggal}
                        </p>

                    </div>

                    <hr className="
                    my-5
                    border-dashed
                    border-gray-500
                    " />

                    {/* TABLE */}
                    <table className="w-full text-lg">

                        <thead>

                            <tr className="text-left">

                                <th>MENU</th>

                                <th>JUMLAH</th>

                                <th>HARGA</th>

                                <th>TOTAL</th>

                            </tr>

                        </thead>

                        <tbody>
                            {(detailMenu || []).length > 0 ? (

                                detailMenu.map((item, index) => (

                                    <tr key={index}>

                                        <td>
                                            {item.nama_menu}
                                        </td>

                                        <td>
                                            {item.jumlah}
                                        </td>

                                        <td>
                                            Rp {formatRupiah(item.harga)}
                                        </td>

                                        <td>
                                            Rp {formatRupiah(item.subtotal)}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td colSpan="4">
                                        Tidak ada detail menu
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>


                    <hr className="
                    my-5
                    border-dashed
                    border-gray-500
                    " />

                    {/* TOTAL */}
                    <div className="
                    text-lg
                    space-y-2
                    ">

                        <div className="text-lg font-bold flex justify-end border-t pt-4">

                            <span>
                                TOTAL AKHIR: {" "}
                                Rp {formatRupiah(totalHarga)}
                            </span>

                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="
                flex justify-between
                mt-5
                ">

                    <button
                        onClick={onClose}
                        className="
                        bg-green-700
                        hover:bg-green-800
                        text-white
                        px-6
                        py-3
                        rounded-xl
                        font-semibold
                        "
                    >
                        Kembali
                    </button>

                </div>

            </div>

        </div>

    );
}