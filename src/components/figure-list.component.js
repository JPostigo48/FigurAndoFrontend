import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function FigureList() {
  const { id: albumId } = useParams();
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Al montar, traemos todas las figuras de este álbum junto con el count del usuario
    async function fetchFigures() {
      try {
        const res = await axios.get(
          `${API}/usuarios/figuras?albumId=${albumId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setItems(res.data);
      } catch (err) {
        console.error("Error cargando figuras:", err);
      }
    }
    fetchFigures();
  }, [albumId, token]);

  // Actualiza el count de una figura (delta = +1 o -1)
  const updateCount = async (figuraId, delta) => {
    try {
      const res = await axios.post(
        `${API}/usuarios/update-figura`,
        { figuraId, delta },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // res.data = { figuraId, count: nuevoCount }
      const { figuraId: id, count } = res.data;
      setItems((prev) =>
        prev.map((it) =>
          it.figura._id === id ? { ...it, count } : it
        )
      );
    } catch (err) {
      console.error("Error actualizando count:", err);
    }
  };

  return (
    <div>
      <h2>Figuras del Álbum: {}</h2>
      <div className="d-flex flex-wrap">
        {items.map(({ figura, count }) => (
          <div
            key={figura._id}
            className="card m-2 d-flex flex-column"
            style={{ width: "180px" }}
          >
            <div
              className="card-body d-flex flex-column align-items-center"
              style={{ flexGrow: 1 }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  lineHeight: 1
                }}
              >
                {figura.code}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#555",
                  marginBottom: "auto"
                }}
              >
                {figura.tipo.replace(/_/g, " ")}
              </div>
            </div>
            <div className="card-footer d-flex justify-content-center align-items-center">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={count <= 0}
                onClick={() => updateCount(figura._id, -1)}
              >
                &minus;
              </button>
              <span style={{ margin: "0 12px" }}>{count}</span>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => updateCount(figura._id, +1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
