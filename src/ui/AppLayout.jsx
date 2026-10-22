import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./AppLayout.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <Header />
      <Sidebar />
      <main className="main-contents">
        <div className="outlet-container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
