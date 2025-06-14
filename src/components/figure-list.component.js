// src/components/figure-list.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function FigureList() {
  const { id: albumId } = useParams();
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  // Mapa de colores suaves según tipo
  const tipoColors = {
    normal:            "#efefef",  // gris plomo suave
    dorado_normal:     "#fff2cb",  // dorado suave
    dorado_escarchado: "#FFECB3",
    lenticular:        "#E1BEE7",
    troquelada:        "#B2DFDB",
    premio:            "#FFE0B2"
  };

  // Determina color de fondo del footer según count
  const footerColor = (count) => {
    if (count === 0)      return "#F8D7DA"; // rojo claro
    if (count === 1)      return "#D4EDDA"; // verde claro
    if (count > 1)        return "#D1ECF1"; // azul claro
    return "transparent";
  };

  useEffect(() => {
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

  const updateCount = async (figuraId, delta) => {
    try {
      const res = await axios.post(
        `${API}/usuarios/update-figura`,
        { figuraId, delta },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      <h2>Figuras del Álbum</h2>
      <div className="d-flex flex-wrap">
      {items.map(({ figura, count }) => {
        const headerBg = tipoColors[figura.tipo] || "#FFF";
        const footerBg = footerColor(count);
        const isPremio = figura.tipo === "premio";

        return (
          <div
            key={figura._id}
            className="card m-2 d-flex flex-column"
            style={{ width: "180px" }}
          >
            {/* Cabecera con fondo según tipo */}
            <div
              className="p-2 text-center"
              style={{
                backgroundColor: headerBg,
                borderTopLeftRadius: "0.25rem",
                borderTopRightRadius: "0.25rem", height: "60px"
              }}
            >
              <div
                style={{
                  fontSize: isPremio ? "24px" : "32px",   // ← más pequeño para premios
                  fontWeight: "bold",
                  lineHeight: 1
                }}
              >
                {figura.code}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#555"
                }}
              >
                {figura.tipo.replace(/_/g, " ")}
              </div>
            </div>

            {/* Pie de tarjeta */}
            <div
              className="card-footer d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: footerBg
              }}
            >
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={count <= 0}
                onClick={() => updateCount(figura._id, -1)}
              >
                &minus;
              </button>
              <span style={{ margin: "0 12px", fontWeight: "bold" }}>
                {count}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => updateCount(figura._id, +1)}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
