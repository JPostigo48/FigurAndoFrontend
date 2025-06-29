// src/components/albums-list.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/api";

export function AlbumCard({ album, isAdded, onAdd, onEdit, isAdmin }) {
  return (
    <div className="card m-2" style={{ width: "220px" }}>
      <img
        src={album.imagen}
        className="card-img-top"
        alt={album.nombre}
        style={{ height: "140px", objectFit: "cover" }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{album.nombre}</h5>
        <p className="card-text text-muted mb-2">{album.editorial}</p>
        {isAdded ? (
          <Link
            to={`/my/albums/${album._id}`}
            className="btn btn-sm btn-primary mt-auto"
          >
            Ver detalles
          </Link>
        ) : (
          <button
            className="btn btn-sm btn-success mt-auto"
            onClick={() => onAdd(album._id)}
          >
            Añadir
          </button>
        )}
        {isAdmin && (
          <button
            className="btn btn-sm btn-warning mt-2"
            onClick={() => onEdit(album._id)}
          >
            Modificar
          </button>
        )}
      </div>
    </div>
  );
}

export default function AlbumsList() {
  const [albums, setAlbums] = useState([]);
  const [userAlbums, setUserAlbums] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Extraemos rol del usuario de localStorage
  const saved = localStorage.getItem("user");
  const user = saved ? JSON.parse(saved) : null;
  const isAdmin = user?.rol === "admin";

  // Carga de todos los álbumes
  useEffect(() => {
    axios
      .get(`${API}/albumes`)
      .then((res) => {
        setAlbums(res.data);
        setError("");
      })
      .catch((err) => {
        console.error("Error al cargar álbumes:", err);
        setError("No se pudieron cargar los álbumes: " + err.message);
      });
  }, []);

  // Carga de álbumes del usuario
  useEffect(() => {
    if (!user) return;
    const idUser = user._id ?? user.id;
    axios
      .post(`${API}/usuarios/albumesIds`, { userId: idUser })
      .then((res) => {
        setUserAlbums(res.data || []);
        setError("");
      })
      .catch((err) => {
        console.error("Error cargando álbumes IDs:", err);
        setError("No se pudieron cargar tus colecciones: " + err.message);
      });
  }, [user]);

  // Handler para añadir un álbum
  const handleAdd = async (albumId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API}/usuarios/add-album`,
        { albumId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(data.usuario));
      setUserAlbums(data.usuario.albumesUsuario.map((a) => a._id));
      setError("");
      alert("Álbum y figuras inicializadas.");
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo añadir el álbum: " +
          (err.response?.data.error || err.message)
      );
    }
  };

  // Handler para editar un álbum
  const handleEdit = (albumId) => {
    navigate(`/edit-album/${albumId}`);
  };

  return (
    <div>
      <h2>Todos los Álbumes</h2>

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex flex-wrap justify-content-center">
        {albums.map((alb) => (
          <AlbumCard
            key={alb._id}
            album={alb}
            isAdded={userAlbums.includes(alb._id)}
            onAdd={handleAdd}
            isAdmin={isAdmin}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
}
