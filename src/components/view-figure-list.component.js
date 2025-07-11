// src/components/view-figure-list.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function ViewFigureList() {
  const { userId, albumId } = useParams();
  const [items, setItems]       = useState([]);
  const [tipos, setTipos]       = useState([]);
  const [userName, setUserName] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [errors, setErrors]     = useState([]);

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
    if (count === 0) return "#F8D7DA";
    if (count === 1) return "#D4EDDA";
    if (count > 1)  return "#D1ECF1";
    return "transparent";
  };

  useEffect(() => {
    setErrors([]);

    // 1) tipos del álbum
    axios.get(`${API}/albumes/${albumId}/tipos`)
      .then(r => setTipos(r.data))
      .catch(() => setErrors(e => [...e, "No se pudieron cargar los tipos"]));

    // 2) nombre usuario
    axios.get(`${API}/usuarios/${userId}/nombre`)
      .then(r => setUserName(r.data.nombre))
      .catch(() => setErrors(e => [...e, "No se pudo cargar el nombre de usuario"]));

    // 3) nombre álbum
    axios.get(`${API}/albumes/${albumId}/nombre`)
      .then(r => setAlbumName(r.data.nombre))
      .catch(() => setErrors(e => [...e, "No se pudo cargar el nombre del álbum"]));

    // 4) figuras + counts
    axios.get(`${API}/usuarios/${userId}/figuras`, { params: { albumId } })
      .then(r => setItems(r.data))
      .catch(() => setErrors(e => [...e, "No se pudieron cargar las figuras"]));
  }, [userId, albumId]);

  // Agrupa, sin partir en hojas
  const grouped = tipos.map(({ key, label }) => {
    const list   = items.filter(i => i.figura.tipo === key);
    const faltan = list.filter(i => i.count === 0).length;
    return { key, label, faltan, list };
  });

  return (
    <div>
      {/* Errores agrupados */}
      {errors.length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0">
            {errors.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      {/* Título */}
      <div className="d-flex justify-content-center mb-4">
        <h1>
          Figuras de <em>{userName || userId}</em> en álbum <em>{albumName || albumId}</em>
        </h1>
      </div>

      {/* Secciones por tipo */}
      {grouped.map((section, idx) => {
        if (!section.list.length) return null;
        const isLast = idx === grouped.length - 1;
        return (
          <React.Fragment key={section.key}>
            <h4 style={{ margin: "1rem 0 0.5rem" }}>
              {section.label} (
              {section.faltan === 0 ? "COMPLETO" : `Faltan ${section.faltan}`}
              )
            </h4>
            <div
              className="d-flex justify-content-center flex-wrap"
              style={{ gap: "0.5rem", marginBottom: "1rem" }}
            >
              {section.list.map(({ figura, count }) => {
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
                      minWidth: "120px"
                    }}
                  >
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
                          fontSize: isPremio ? "24px" : "32px",
                          fontWeight: "bold",
                          lineHeight: 1
                        }}
                      >
                        {figura.code}
                      </div>
                      <div style={{ fontSize: "14px", color: "#555" }}>
                        {figura.tipo.replace(/_/g, " ")}
                      </div>
                    </div>
                    <div
                      className="card-footer d-flex justify-content-center align-items-center"
                      style={{ backgroundColor: footerBg }}
                    >
                      <span style={{ fontWeight: "bold" }}>
                        Cantidad: {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Separador */}
            {!isLast && (
              <hr style={{ border: 0, borderTop: "1px solid #ccc", margin: "1rem 0" }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
