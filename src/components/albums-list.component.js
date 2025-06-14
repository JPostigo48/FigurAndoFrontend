// src/components/albums-list.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/api";

export function AlbumCard({ album, isAdded, onAdd }) {
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
          <Link to={`/my/albums/${album._id}`} className="btn btn-sm btn-primary mt-auto">
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
      </div>
    </div>
  );
}

export default function AlbumsList() {
  const [albums, setAlbums] = useState([]);
  const [userAlbums, setUserAlbums] = useState([]); 
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Carga de todos los álbumes
  useEffect(() => {
    axios
      .get(`${API}/albumes/`)
      .then((res) => setAlbums(res.data))
      .catch((err) => {
        console.error("Error al cargar álbumes:", err);
        setError("No se pudieron cargar los álbumes.");
      });
  }, []);

  // Carga de álbumes del usuario desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;
    const user = JSON.parse(savedUser);
    async function fetchAlbumsIds() {
      try {
        const res = await axios.post(
          "http://localhost:5000/usuarios/albumesIds",
          { userId: user._id }          
        );
        setUserAlbums(res.data || []); 
      } catch (err) {
        console.error("Error cargando álbumes IDs:", err);
        setUserAlbums([]);  
      }
    }

    fetchAlbumsIds();
  }, []);

  // Handler para añadir un álbum a las colecciones del usuario
  const handleAdd = async (albumId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API}/usuarios/add-album`,
        { albumId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 1) Actualiza localStorage con el usuario recibido
      localStorage.setItem('user', JSON.stringify(data.usuario));
      // 2) Actualiza estado para re-render
      setUserAlbums(data.usuario.albumesUsuario.map(a => a._id));
      alert('Álbum y figuras inicializadas.');
    } catch (err) {
      console.error(err);
      alert('No se pudo añadir el álbum.');
    }
  };
  

  return (
    <div>
      <h2>Todos los Álbumes</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex flex-wrap">
        {albums.map((alb) => (
          <AlbumCard
            key={alb._id}
            album={alb}
            isAdded={userAlbums.includes(alb._id)}
            onAdd={handleAdd}
          />
        ))}
      </div>
    </div>
  );
}
