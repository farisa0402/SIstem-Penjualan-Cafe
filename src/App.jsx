import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Transaksi from "./pages/Transaksi";
import Menu from "./pages/Menu";
import Stok from "./pages/Stok";
import Login from "./pages/Login";
import LupaSandi from "./pages/LupaSandi";
import TambahMenu from "./pages/TambahMenu";
import UbahMenu from "./pages/UbahMenu";
import TambahStok from "./pages/TambahStok";
import UbahStok from "./pages/UbahStok";
import UbahSandi from "./pages/UbahSandi";
import DetailRiwayat from "./pages/DetailRiwayat";
import Laporan from "./pages/Laporan";


function App() {
  return (
   <Routes>
   <Route path="/" element={<LandingPage />}/>
   <Route path="/login" element={<Login />}/>
   <Route path="/lupasandi" element={<LupaSandi />}/>
   <Route path="UbahSandi" element={<UbahSandi />}/>
   <Route path="/dashboard" element={<MainLayout />}>
    <Route index element={<Dashboard />}/>
    <Route path="transaksi" element={<Transaksi />}/>
    <Route path="menu" element={<Menu />}/>
    <Route path="tambah-menu" element={<TambahMenu />}/>
    <Route path="stok" element={<Stok />}/>
    <Route path="ubah-menu/:id" element={<UbahMenu />} />
    <Route path="tambah-stok" element={<TambahStok />}/>
    <Route path="ubah-stok" element={<UbahStok />}/>
    <Route path="detail-riwayat" element={<DetailRiwayat />}/>
    <Route path="laporan" element={<Laporan />}/>
    </Route>
   </Routes>
  );
}

export default App;