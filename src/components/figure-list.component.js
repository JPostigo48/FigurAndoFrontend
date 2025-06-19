// src/components/figure-list.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function FigureList() {
  const { id: albumId } = useParams();
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  // Define los tipos en orden y etiquetas
  const tipos = [
    { key: "normal", label: "Normales" },
    { key: "dorado_normal", label: "Doradas Normales" },
    { key: "dorado_escarchado", label: "Doradas Escarchadas" },
    { key: "troquelada", label: "Troqueladas" },
    { key: "lenticular", label: "Lenticulares" },
    { key: "premio", label: "Premios" }
  ];

  // Colores de header por tipo
  const tipoColors = {
    normal:            "#efefef",
    dorado_normal:     "#fff2cb",
    dorado_escarchado: "#FFECB3",
    lenticular:        "#E1BEE7",
    troquelada:        "#B2DFDB",
    premio:            "#FFE0B2"
  };

  // Color de footer según count
  const footerColor = (count) => {
    if (count === 0)      return "#F8D7DA";
    if (count === 1)      return "#D4EDDA";
    if (count > 1)        return "#D1ECF1";
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
      setItems(prev =>
        prev.map(it =>
          it.figura._id === id ? { ...it, count } : it
        )
      );
    } catch (err) {
      console.error("Error actualizando count:", err);
    }
  };

  // Agrupa items por tipo

  const grouped = tipos.map(({ key, label }) => {
    const list = items.filter(i => i.figura.tipo === key);
    const faltan = list.filter(i => i.count === 0).length;
    // Partimos en trozos de 9:
    const hojas = [];
    for (let i = 0; i < list.length; i += 9) {
      hojas.push(list.slice(i, i + 9));
    }
    return { key, label, faltan, hojas };
  });

  return (
    <div>
      <h2>Figuras del Álbum</h2>

      {grouped.map((section, idx) => {
        if (!section.hojas.length) return null;
        const isLastSection = idx === grouped.length - 1;

        return (
          <React.Fragment key={section.key}>
            {/* Título de sección */}
            <h4 style={{ margin: "1rem 0 0.5rem" }}>
              {section.label} (
              {section.faltan === 0 ? "COMPLETO" : `${section.faltan} faltan`}
              )
            </h4>

            {/* Para cada hoja de 9 figuras */}
            {section.hojas.map((hoja, hIdx) => (
              <div key={hIdx}>
                {/* Subtítulo de hoja */}
                <h5 style={{ margin: "0.5rem 0" }}>
                  Hoja {hIdx + 1}
                </h5>

                {/* Contenedor flex córner */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "1rem"
                  }}
                >
                  {hoja.map(({ figura, count }) => {
                    const headerBg = tipoColors[figura.tipo] || "#FFF";
                    const footerBg = footerColor(count);
                    const isPremio = figura.tipo === "premio";

                    return (
                      <div
                        key={figura._id}
                        className="card d-flex flex-column"
                        style={{
                          flex: "0 0 calc(100% / 9 - 12px)",
                          maxWidth: "150px",
                          minWidth: "100px"
                        }}
                      >
                        {/* Cabecera */}
                        <div
                          className="p-2 text-center"
                          style={{
                            backgroundColor: headerBg,
                            height: "60px",
                            borderTopLeftRadius: "0.25rem",
                            borderTopRightRadius: "0.25rem"
                          }}
                        >
                          <div
                            style={{
                              fontSize: isPremio ? "20px" : "28px",
                              fontWeight: "bold",
                              lineHeight: 1
                            }}
                          >
                            {figura.code}
                          </div>
                          <div style={{ fontSize: "12px", color: "#555" }}>
                            {figura.tipo.replace(/_/g, " ")}
                          </div>
                        </div>

                        {/* Footer */}
                        <div
                          className="card-footer d-flex justify-content-center align-items-center"
                          style={{ backgroundColor: footerBg }}
                        >
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={count <= 0}
                            onClick={() => updateCount(figura._id, -1)}
                          >
                            &minus;
                          </button>
                          <span style={{ margin: "0 6px", fontWeight: "bold" }}>
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
            ))}

            {/* Línea separadora entre secciones */}
            {!isLastSection && (
              <hr
                style={{
                  border: 0,
                  borderTop: "1px solid #ccc",
                  margin: "1rem 0"
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}