// src/components/view-figure-list.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function ViewFigureList() {
  const { userId, albumId } = useParams();
  const [items, setItems] = useState([]);
  const [userName, setUserName] = useState("");
  const [albumName, setAlbumName] = useState("");

  // Tipos y etiquetas en el orden deseado
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
    normal: "#efefef",
    dorado_normal: "#fff2cb",
    dorado_escarchado: "#FFECB3",
    lenticular: "#E1BEE7",
    troquelada: "#B2DFDB",
    premio: "#FFE0B2"
  };

  // Color de footer según count
  const footerColor = (count) => {
    if (count === 0) return "#F8D7DA";
    if (count === 1) return "#D4EDDA";
    if (count > 1) return "#D1ECF1";
    return "transparent";
  };

  useEffect(() => {
    // Fetch nombre de usuario y álbum
    axios.get(`${API}/usuarios/${userId}/nombre`)
      .then(r => setUserName(r.data.nombre))
      .catch(() => setUserName(userId));

    axios.get(`${API}/albumes/${albumId}/nombre`)
      .then(r => setAlbumName(r.data.nombre))
      .catch(() => setAlbumName(albumId));

    // Fetch figuritas + counts
    axios.get(`${API}/usuarios/${userId}/figuras`, { params: { albumId } })
      .then(r => setItems(r.data))
      .catch(err => console.error(err));
  }, [userId, albumId]);

  // Agrupa y parte en hojas de 9
  const grouped = tipos.map(({ key, label }) => {
    const list = items.filter(i => i.figura.tipo === key);
    const faltan = list.filter(i => i.count === 0).length;
    const hojas = [];
    for (let i = 0; i < list.length; i += 9) {
      hojas.push(list.slice(i, i + 9));
    }
    return { key, label, faltan, hojas };
  });

  return (
    <div>
      <h2>
        Figuras de <em>{userName}</em> en álbum <em>{albumName}</em>
      </h2>

      {grouped.map((section, sIdx) => {
        if (!section.hojas.length) return null;
        const isLastSection = sIdx === grouped.length - 1;

        return (
          <React.Fragment key={section.key}>
            {/* Título de sección */}
            <h4 style={{ margin: "1rem 0 0.5rem" }}>
              {section.label} (
              {section.faltan === 0 ? "COMPLETO" : `Faltan ${section.faltan}`}
              )
            </h4>

            {/* Cada “hoja” de 9 cards */}
            {section.hojas.map((hoja, hIdx) => (
              <div key={hIdx} style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    justifyContent: "center"
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
                          minWidth: "120px"
                        }}
                      >
                        {/* Header */}
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

                        {/* Footer solo lectura */}
                        <div
                          className="card-footer d-flex justify-content-center align-items-center"
                          style={{ backgroundColor: footerBg }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            {"Cantidad: " + count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Separador */}
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
