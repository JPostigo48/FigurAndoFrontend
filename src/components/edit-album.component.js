// src/components/edit-album.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function EditAlbum() {
  const { id: albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [figures, setFigures] = useState([]);
  const [currentTipo, setCurrentTipo] = useState("normal");
  const [currentCode, setCurrentCode] = useState("");
  const [error, setError] = useState("");

  const tipoOptions = [
    { value: "normal", label: "Normal" },
    { value: "dorado_normal", label: "Dorado Normal" },
    { value: "dorado_escarchado", label: "Dorado Escarchado" },
    { value: "lenticular", label: "Lenticular" },
    { value: "troquelada", label: "Troquelada" },
    { value: "premio", label: "Premio" }
  ];

  useEffect(() => {
    // 1) Carga datos del álbum
    axios
      .get(`${API}/albumes/${albumId}`)
      .then((res) => setAlbum(res.data))
      .catch((err) => setError("Error cargando álbum: " + err.message));

    // 2) Carga figuras actuales
    axios
      .get(`${API}/albumes/${albumId}/figuras`)
      .then((res) => setFigures(res.data))
      .catch((err) => setError("Error cargando figuras: " + err.message));
  }, [albumId]);

  const handleAddFigure = (e) => {
    e.preventDefault();
    if (!currentTipo || !currentCode) {
      return setError("Completa tipo y código");
    }

    axios
      .post(`${API}/albumes/${albumId}/add-figure`, {
        tipo: currentTipo,
        code: currentCode
      })
      .then((res) => {
        setFigures((prev) => [...prev, res.data.figure]);
        setCurrentTipo("normal");
        setCurrentCode("");
        setError("");
      })
      .catch((err) =>
        setError("Error añadiendo figura: " + err.response?.data.error || err.message)
      );
  };

  if (!album) return <p>Cargando álbum…</p>;

  return (
    <div>
      <h2>Editar Álbum: {album.nombre}</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Sección 1: Añadir figura */}
      <section style={{ margin: "2rem 0" }}>
        <h4>Añadir nueva figura</h4>
        <form className="form-inline" onSubmit={handleAddFigure}>
          <div className="form-group mr-2">
            <label className="mr-1">Tipo:</label>
            <select
              className="form-control"
              value={currentTipo}
              onChange={(e) => setCurrentTipo(e.target.value)}
            >
              {tipoOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group mr-2">
            <label className="mr-1">Código:</label>
            <input
              type="text"
              className="form-control"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              placeholder="e.g. 10, T-1"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Añadir Figura
          </button>
        </form>
      </section>

      {/* Sección 2: Lista de figuras */}
      <section>
        <h4>Figuras en el álbum</h4>
        {figures.length === 0 ? (
          <p>No hay figuras aún.</p>
        ) : (
          <div className="d-flex flex-wrap">
            {figures.map((f) => (
              <div
                key={f._id}
                className="card m-2"
                style={{ width: "120px" }}
              >
                <div className="card-body text-center p-2">
                  <strong>{f.code}</strong>
                  <div style={{ fontSize: "0.8rem", color: "#555" }}>
                    {f.tipo.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
