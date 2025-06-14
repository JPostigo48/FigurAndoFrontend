// src/components/colecciones.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlbumCard } from "./albums-list.component";
import { useNavigate } from "react-router-dom";
import { API } from "../api/api";

// Componente principal que lista las colecciones del usuario
export default function Colecciones() {
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;
    const user = JSON.parse(savedUser);
    const idUser = user._id ?? user.id;
    async function fetchAlbums() {
      try {
        const res = await axios.post(
          `${API}/usuarios/albumes`,
          { userId: idUser }          
        );
        setAlbums(res.data);           
      } catch (err) {
        console.error("Error cargando álbumes:", err);
        setError("Error cargando álbumes:"+ err.mensaje);
      }
    }

    fetchAlbums();
  }, []);

  const handleAdd = () => {
    navigate("/");
  };

  return (
    <div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <h2>Mis Colecciones</h2>
      <div className="d-flex flex-wrap">
        {albums.map(album => (
          <AlbumCard
            key={album._id}
            album={album}
            isAdded={true}    // ya está en userAlbums
            onAdd={() => {}}  // o rediriges a detalles
          />
        ))}

        {/* Tarjeta "Añadir nueva colección" */}
        <div
          className="card m-2 d-flex align-items-center justify-content-center"
          style={{ width: "200px", height: "200px", cursor: "pointer" }}
          onClick={handleAdd}
        >
          <div style={{ fontSize: "48px", color: "#6c757d" }}>+</div>
          <div style={{ color: "#6c757d" }}>Añadir</div>
        </div>
      </div>
    </div>
  );
}
