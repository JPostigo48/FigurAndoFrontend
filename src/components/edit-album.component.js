// src/components/edit-album.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function EditAlbum() {
  const { id: albumId } = useParams();
  const token = localStorage.getItem("token");
  const [album, setAlbum] = useState(null);
  const [figures, setFigures] = useState([]);
  const [error, setError] = useState("");

  // Nueva figura
  const [currentTipo, setCurrentTipo] = useState("");
  const [currentCode, setCurrentCode] = useState("");

  // Nueva categoría
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");

  // Edición inline de categorías
  const [editingTipoKey, setEditingTipoKey] = useState(null);
  const [editTipoKey, setEditTipoKey] = useState("");
  const [editTipoLabel, setEditTipoLabel] = useState("");

  // Edición inline de figuras
  const [editingFigId, setEditingFigId] = useState(null);
  const [editFigCode, setEditFigCode] = useState("");
  const [editFigTipo, setEditFigTipo] = useState("");

  useEffect(() => {
    // 1) Carga álbum (público)
    axios.get(`${API}/albumes/${albumId}`)
      .then(r => {
        setAlbum(r.data);
        // inicializar currentTipo si hace falta
      })
      .catch(err => setError("Error cargando álbum: " + err.message));

    // 2) Figuras del usuario en este álbum (protected)
    axios.get(
      `${API}/albumes/${albumId}/figuras`,
      {
        params: { albumId },
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then(r => setFigures(r.data))
      .catch(err => {
        console.error(err);
        setError("Error cargando figuras: " + (err.response?.data.error || err.message));
      });
  }, [albumId, token]);

  // Añadir nueva figura
  const handleAddFigure = e => {
    e.preventDefault();
    if (!currentTipo || !currentCode) {
      return setError("Completa tipo y código");
    }
    axios.post(`${API}/figuras/add`, {
      albumId: albumId,
      tipo: currentTipo,
      code: currentCode
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(r => {
      setFigures(f => [...f, r.data.figure]);
      setCurrentCode("");
      setError("");
    })
    .catch(err => setError("Error añadiendo figura: " + (err.response?.data.error || err.message)));
  };

  // Añadir nueva categoría
  const handleAddTipo = e => {
    e.preventDefault();
    if (!newKey.trim() || !newLabel.trim()) {
      return setError("Completa key y label de la categoría");
    }
    axios.post(`${API}/albumes/${albumId}/tipos/add`, {
      key: newKey.trim(),
      label: newLabel.trim()
    })
    .then(r => {
      setAlbum(a => ({ ...a, tipos: r.data.tipos }));
      setNewKey(""); setNewLabel(""); setError("");
    })
    .catch(err => setError("Error añadiendo categoría: " + (err.response?.data.error || err.message)));
  };

  // Iniciar edición de categoría
  const startEditTipo = t => {
    setEditingTipoKey(t.key);
    setEditTipoKey(t.key);
    setEditTipoLabel(t.label);
  };
  // Cancelar edición de categoría
  const cancelEditTipo = () => setEditingTipoKey(null);

  // Guardar edición de categoría
  const saveEditTipo = () => {
    axios.put(
      `${API}/albumes/${albumId}/tipos/${encodeURIComponent(editingTipoKey)}`,
      {
        newKey: editTipoKey,
        label:   editTipoLabel
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )
    .then(r => {
      setAlbum(a => ({ ...a, tipos: r.data }));
      setEditingTipoKey(null);
    })
    .catch(err => setError("Error guardando categoría: " + (err.response?.data.error || err.message)));
  };

  // Eliminar categoría
  const handleDeleteTipo = key => {
    axios.post(`${API}/albumes/${albumId}/tipos/delete`, { key })
      .then(r => setAlbum(a => ({ ...a, tipos: r.data.tipos })))
      .catch(() => setError("Error eliminando categoría"));
  };

  // Iniciar edición de figura
  const startEditFig = f => {
    setEditingFigId(f._id);
    setEditFigCode(f.code);
    setEditFigTipo(f.tipo);
  };
  const cancelEditFig = () => setEditingFigId(null);

  // Guardar edición de figura
  const saveEditFig = figuraId => {
    axios.post(`${API}/figuras/update/${figuraId}`, {
      code: editFigCode,
      tipo: editFigTipo
    })
    .then(r => {
      setFigures(fs => fs.map(f => f._id === figuraId ? r.data : f));
      setEditingFigId(null);
    })
    .catch(() => setError("Error guardando figura"));
  };

  // Eliminar figura
  const handleDeleteFig = figuraId => {
    axios.delete(`${API}/figuras/${figuraId}`,{
      params: { figuraId },
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setFigures(fs => fs.filter(f => f._id !== figuraId)))
      .catch(() => setError("Error eliminando figura"));
  };

  if (!album) return <p>Cargando álbum…</p>;

  return (
    <div>
      <h2>Editar Álbum: {album.nombre}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* 1. Añadir nueva figura */}
      <section style={{ margin: "2rem 0" }}>
        <h4>Añadir nueva figura</h4>
        <form className="form-inline" onSubmit={handleAddFigure}>
          <div className="form-group mr-2">
            <label className="mr-1">Tipo:</label>
            <select
              className="form-control"
              value={currentTipo}
              onChange={e => setCurrentTipo(e.target.value)}
            >
              {album.tipos?.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group mr-2">
            <label className="mr-1">Código:</label>
            <input
              type="text"
              className="form-control"
              value={currentCode}
              onChange={e => setCurrentCode(e.target.value)}
              placeholder="e.g. 10, T-1"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Añadir Figura
          </button>
        </form>
      </section>

      {/* 2. Añadir / listar categorías */}
      <section style={{ margin: "2rem 0" }}>
        <h4>Gestionar categorías</h4>

        {/* Crear nueva */}
        <form className="form-inline mb-3" onSubmit={handleAddTipo}>
          <input
            type="text"
            className="form-control mr-2"
            placeholder="Key"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
          />
          <input
            type="text"
            className="form-control mr-2"
            placeholder="Label"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
          />
          <button type="submit" className="btn btn-success">
            Añadir Categoría
          </button>
        </form>

        {/* Listado */}
        <ul className="list-group">
          {album.tipos?.map(t => (
            <li key={t.key} className="list-group-item">
              {editingTipoKey === t.key ? (
                <div className="d-flex align-items-center">
                  <input
                    className="form-control mr-2"
                    value={editTipoKey}
                    onChange={e => setEditTipoKey(e.target.value)}
                    style={{ width: "120px" }}
                  />
                  <input
                    className="form-control mr-2"
                    value={editTipoLabel}
                    onChange={e => setEditTipoLabel(e.target.value)}
                    style={{ width: "150px" }}
                  />
                  <button className="btn btn-sm btn-primary mr-1"
                          onClick={saveEditTipo}>
                    OK
                  </button>
                  <button className="btn btn-sm btn-secondary"
                          onClick={cancelEditTipo}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <span>{t.label} <small>({t.key})</small></span>
                  <div>
                    <button className="btn btn-sm btn-outline-primary mr-1"
                            onClick={() => startEditTipo(t)}>
                      Modificar
                    </button>
                    <button className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteTipo(t.key)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Lista de figuras con CRUD */}
      <section>
        <h4>Figuras en el álbum</h4>
        {figures.length === 0 ? (
          <p>No hay figuras aún.</p>
        ) : (
          <div className="d-flex flex-wrap">
            {figures.map(f => (
              <div key={f._id} className="card m-2" style={{ width: "140px" }}>
                {editingFigId === f._id ? (
                  <div className="card-body">
                    <input
                      className="form-control mb-1"
                      value={editFigCode}
                      onChange={e => setEditFigCode(e.target.value)}
                    />
                    <select
                      className="form-control mb-2"
                      value={editFigTipo}
                      onChange={e => setEditFigTipo(e.target.value)}
                    >
                      {album.tipos.map(t => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <button className="btn btn-sm btn-primary mr-1"
                            onClick={() => saveEditFig(f._id)}>
                      Guardar
                    </button>
                    <button className="btn btn-sm btn-secondary"
                            onClick={cancelEditFig}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="card-body text-center p-2">
                      <strong>{f.code}</strong>
                      <div style={{ fontSize: "0.8rem", color: "#555" }}>
                        {(f.tipo || "").replace(/_/g, " ")}
                      </div>
                    </div>
                    <div className="card-footer d-flex flex-column align-items-center">
                      <button className="btn btn-sm btn-outline-primary"
                              onClick={() => startEditFig(f)}>
                        Modificar
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteFig(f._id)}>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
