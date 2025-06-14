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

  // Colores
  const tipoColors = {
    normal:            "#D3D3D3",
    dorado_normal:     "#FFECB3",
    dorado_escarchado: "#FFECB3",
    lenticular:        "#E1BEE7",
    troquelada:        "#B2DFDB",
    premio:            "#FFE0B2"
  };
  const footerColor = (count) => {
    if (count === 0) return "#F8D7DA";
    if (count === 1) return "#D4EDDA";
    if (count > 1)  return "#D1ECF1";
    return "transparent";
  };

  useEffect(() => {
    // 1) Fetch figuras
    const fetchFigures = async () => {
      try {
        const res = await axios.get(
          `${API}/usuarios/${userId}/figuras`,
          { params: { albumId } }
        );
        setItems(res.data);
      } catch (err) {
        console.error("Error cargando figuras:", err);
      }
    };
    // 2) Fetch nombre de usuario
    const fetchUserName = async () => {
      try {
        const res = await axios.get(
          `${API}/usuarios/${userId}/nombre`
        );
        setUserName(res.data.nombre);
      } catch (err) {
        console.error("Error cargando nombre de usuario:", err);
      }
    };
    // 3) Fetch nombre de álbum
    const fetchAlbumName = async () => {
      try {
        const res = await axios.get(
          `${API}/albumes/${albumId}/nombre`
        );
        setAlbumName(res.data.nombre);
      } catch (err) {
        console.error("Error cargando nombre de álbum:", err);
      }
    };

    fetchUserName();
    fetchAlbumName();
    fetchFigures();
  }, [userId, albumId]);

  return (
    <div>
      <h2>
        Figuras de <em>{userName || userId}</em> en álbum <em>{albumName || albumId}</em>
      </h2>
      <div className="d-flex flex-wrap justify-content-center">
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
              <div
                className="p-2 text-center"
                style={{
                  backgroundColor: headerBg,
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
                <span style={{ margin: "0 12px", fontWeight: "bold" }}>
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: "30px" }}></div>
    </div>
  );
}
