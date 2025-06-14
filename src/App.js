// src/App.js
import React, { useState, useEffect } from "react";
import { useNavigate, Route, Routes } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import Navbar             from "./components/navbar.component";
import CreateUser         from "./components/create-user.component";
import LoginUser          from "./components/login.component";
import CreateAlbum        from "./components/create-album.component";
import Colecciones        from "./components/colecciones.component";
import AlbumsList         from "./components/albums-list.component";
import FigureList         from "./components/figure-list.component";
import ViewFigureList     from "./components/view-figure-list.component";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();  // Ya bajo <BrowserRouter>

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <div className="container" style={{ paddingTop: "10px" }}>
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.clear();
          setUser(null);
          navigate("/");
        }}
      />
      <br />
      <Routes>
        {/* Ruta pública */}
        <Route path="/:userId/:albumId" element={<ViewFigureList />} />

        {/* Rutas autenticadas */}
        <Route path="/" element={<AlbumsList />} />
        <Route path="/my/albums" element={<Colecciones />} />
        <Route path="/my/albums/:id" element={<FigureList />} />
        <Route path="/crearalbum" element={<CreateAlbum />} />
        <Route path="/user" element={<CreateUser />} />
        <Route
          path="/login"
          element={<LoginUser onLogin={(u) => setUser(u)} />}
        />
      </Routes>
    </div>
  );
}
