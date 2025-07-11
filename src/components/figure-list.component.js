// src/components/figure-list.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function FigureList() {
  const { id: albumId } = useParams();
  const token = localStorage.getItem("token");

  const [items,        setItems]        = useState([]);
  const [tipos,        setTipos]        = useState([]);
  const [albumName,    setAlbumName]    = useState("");
  const [openSections, setOpenSections] = useState({});
  const [setsMap, setSetsMap] = useState({});
  const [errors,       setErrors]       = useState([]);

  // Cargo setsUsuario desde localStorage
  const saved = localStorage.getItem("user");
  const user  = saved ? JSON.parse(saved) : null;

  const tipoColors = {
    normal:            "#efefef",
    dorado_normal:     "#fff2cb",
    dorado_escarchado: "#FFECB3",
    lenticular:        "#E1BEE7",
    troquelada:        "#B2DFDB",
    premio:            "#FFE0B2"
  };
  const footerColor = c => c === 0 ? "#F8D7DA" : c === 1 ? "#D4EDDA" : "#D1ECF1";

  useEffect(() => {
    // limpia errores previos
    setErrors([]);

    // 1) Nombre del álbum
    axios.get(`${API}/albumes/${albumId}/nombre`)
      .then(r => setAlbumName(r.data.nombre))
      .catch(() => setErrors(e => [...e, "No se pudo cargar el nombre del álbum"]));

    // 2) Tipos configurados en el álbum
    axios.get(`${API}/albumes/${albumId}/tipos`)
      .then(r => {
        setTipos(r.data);
        // Inicializo todos abiertos
        const init = {};
        r.data.forEach(t => init[t.key] = true);
        setOpenSections(init);
      })
      .catch(() => setErrors(e => [...e, "No se pudieron cargar los tipos"]));

    axios.get(`${API}/usuarios/sets`, {
        params: { albumId },
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        // convierte array en mapa para lookup por tipo
        const mp = {};
        res.data.forEach(s => mp[s.tipo] = s.count);
        setSetsMap(mp);
        console.log(mp)
      })
      .catch(() => {
        setErrors(e => [...e, "No se pudieron cargar los sets"]);
      });

    // 3) Figuras del usuario en este álbum
    axios.get(`${API}/usuarios/figuras?albumId=${albumId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => setItems(r.data))
      .catch(() => setErrors(e => [...e, "No se pudieron cargar las figuras"]));
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

  const createSet = async (tipoKey) => {
    try {
      await axios.post(`${API}/usuarios/create-set`, { albumId, tipo: tipoKey }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Set creado!");
      // refrescar figuras
      const r = await axios.get(
        `${API}/usuarios/figuras?albumId=${albumId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(r.data);
      // actualizar localStorage
      const u = JSON.parse(localStorage.getItem("user"));
      u.setsUsuario = u.setsUsuario.map(s =>
        s.tipo === tipoKey ? { ...s, count: s.count + 1 } : s
      );
      localStorage.setItem("user", JSON.stringify(u));
    } catch {
      setErrors(e => [...e, "Error creando el set"]);
    }
  };

  const toggleSection = key => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyLink = () => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      return alert("No estás logueado.");
    }
    const user = JSON.parse(saved);
    const userId = user.id || user._id;
    const link = `${window.location.origin}/link/${userId}/${albumId}`;

    navigator.clipboard.writeText(link)
      .then(() => alert(`Link copiado:\n${link}`))
  }

  // agrupo
  const grouped = tipos.map(({ key, label }) => {
    const list   = items.filter(i => i.figura.tipo === key);
    const faltan = list.filter(i => i.count === 0).length;
    const hojas  = [];
    for (let i = 0; i < list.length; i += 9)
      hojas.push(list.slice(i, i + 9));
    return { key, label, faltan, hojas };
  });


  return (
    <div>
      {/* Errores agrupados */}
      {errors.length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0">
            {errors.map((msg,i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}
      <div className="d-flex justify-content-center flex-wrap">
        <h1>Figuras del Álbum: <em>{albumName}</em></h1>
      </div>

      {grouped.map((sec, idx) => {
        if (!sec.hojas.length) return null;
        const isComplete = sec.faltan === 0;
        const setsCount  = setsMap[sec.key] || 0;

        return (
          <React.Fragment key={sec.key}>
            {/* Cabecera alineada */}
            <div
              className="d-flex justify-content-between align-items-center mb-2"
              style={{ marginTop: idx === 0 ? "1rem" : "2rem" }}
            >
              <div>
                <h2><strong>{sec.label}</strong></h2>{" "}
                (
                  {isComplete ? "Completo" : `${sec.faltan} faltan`}
                  {" / "}
                  {setsCount} set{setsCount!==1?"s":""} en posesión
                )
              </div>
              <div className="d-flex">
                <button
                  className="btn btn-sm btn-warning mr-2"
                  disabled={!isComplete}
                  onClick={() => createSet(sec.key)}
                >
                  Crear Set
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => toggleSection(sec.key)}
                >
                  {openSections[sec.key] ? "▼" : "▶"}
                </button>
              </div>
            </div>

            {/* Contenido centrado y colapsable */}
            {openSections[sec.key] && sec.hojas.map((hoja,hIdx) => (
              <div key={hIdx} style={{ marginBottom: "1rem" }}>
                <h5 style={{ margin: "0.5rem 0" }}>Hoja {hIdx+1}</h5>
                <div
                  className="d-flex justify-content-center flex-wrap"
                  style={{ gap: "0.5rem" }}
                >
                  {hoja.map(({ figura, count }) => (
                    <div
                      key={figura._id}
                      className="card d-flex flex-column"
                      style={{
                        flex: "0 0 calc(100%/9 - 12px)",
                        maxWidth: "160px",
                        minWidth: "100px"
                      }}
                    >
                      <div className="p-2 text-center" style={{
                        backgroundColor: tipoColors[figura.tipo]||"#fff",
                        height: "60px",
                        borderTopLeftRadius: ".25rem",
                        borderTopRightRadius: ".25rem"
                      }}>
                        <div style={{
                          fontSize: figura.tipo==="premio"?"20px":"28px",
                          fontWeight: "bold",
                          lineHeight: 1
                        }}>
                          {figura.code}
                        </div>
                        <div style={{ fontSize:"12px", color:"#555" }}>
                          {figura.tipo.replace(/_/g," ")}
                        </div>
                      </div>
                      <div
                        className="card-footer d-flex justify-content-center align-items-center"
                        style={{ backgroundColor: footerColor(count) }}
                      >
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          disabled={count<=0}
                          onClick={()=>updateCount(figura._id,-1)}
                        >&minus;</button>
                        <span style={{ margin:"0 6px", fontWeight:"bold" }}>
                          {count}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={()=>updateCount(figura._id,+1)}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {idx < grouped.length-1 && (
              <hr style={{ border:0, borderTop:"1px solid #ccc", margin:"1rem 0" }}/>
            )}
          </React.Fragment>
        );
      })}

      <div className="text-center my-4">
        <button
          className="btn btn-info"
          onClick={handleCopyLink}
        >
          Obtener mi link
        </button>
      </div>
    </div>
  );
}
