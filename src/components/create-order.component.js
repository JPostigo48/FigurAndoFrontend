// src/components/create-order.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api/api";

export default function CreateOrder() {
  const { id: albumId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [albumName, setAlbumName] = useState("");
  const [items, setItems] = useState([]);           // [{ figura, count }]
  const [quantities, setQuantities] = useState({}); // { figuraId: qty }
  const [customer, setCustomer] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [openSections, setOpenSections] = useState({});

  // precios por tipo
  const PRICE = {
    normal:             0,
    dorado_liso:      3,
    dorado_escarchado:  3,
    lenticular:         2.5,
    troquelada:         3,
    premio:             0
  };

  // tipos en orden
  const tipos = [
    { key: "normal",            label: "Normales" },
    { key: "dorado_liso",     label: "Doradas Normales" },
    { key: "dorado_escarchado", label: "Doradas Escarchadas" },
    { key: "lenticular",        label: "Lenticulares" },
    { key: "troquelada",        label: "Troqueladas" },
    { key: "premio",            label: "Premios" }
  ];

  useEffect(() => {
    // 1) Nombre del álbum
    axios.get(`${API}/albumes/${albumId}/nombre`)
      .then(res => setAlbumName(res.data.nombre))
      .catch(() => setError("No se pudo cargar el nombre del álbum"));

    // 2) Figuras >0
    axios.get(`${API}/usuarios/figuras?albumId=${albumId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const positivas = res.data.filter(fu => fu.count > 0);
      setItems(positivas);
    })
    .catch(() => setError("No se pudieron cargar las figuras"));

    // Inicializar toggles
    const init = {};
    tipos.forEach(t => { init[t.key] = true });
    setOpenSections(init);
  }, [albumId, token]);

  // recalcula total
  useEffect(() => {
    let sum = 0;
    items.forEach(({ figura }) => {
      const qty = quantities[figura._id] || 0;
      sum += qty * (PRICE[figura.tipo] || 0);
    });
    setTotal(sum);
  }, [quantities, items]);

  const incQty = (id, max) => {
    setQuantities(q => {
      const cur = q[id] || 0;
      return cur < max ? { ...q, [id]: cur + 1 } : q;
    });
  };
  const decQty = id => {
    setQuantities(q => {
      const cur = q[id] || 0;
      return cur > 0 ? { ...q, [id]: cur - 1 } : q;
    });
  };

  const toggleSection = key => {
    setOpenSections(o => ({ ...o, [key]: !o[key] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!customer.trim()) {
      return setError("Debes ingresar el nombre del cliente");
    }
    const orderItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([figuraId, qty]) => ({ figuraId, quantity: qty }));
    if (orderItems.length === 0) {
      return setError("Selecciona al menos una figura para el pedido");
    }
    try {
      await axios.post(
        `${API}/orders/create-order`,
        { albumId, customer, items: orderItems, total },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pedido creado con éxito");
      navigate(`/my/albums/${albumId}`);
    } catch (err) {
      setError("Error al crear el pedido: " +
        (err.response?.data.error || err.message));
    }
  };

  // agrupar por tipo
  const grouped = tipos.map(({ key, label }) => {
    const list = items.filter(i => i.figura.tipo === key);
    return { key, label, list };
  }).filter(sec => sec.list.length > 0);

  return (
    <div className="container py-4">
      <h2>Nuevo Pedido — Álbum: {albumName}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre del Cliente</label>
          <input
            type="text"
            className="form-control"
            value={customer}
            onChange={e => setCustomer(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Precio Total (S/.)</label>
          <input
            type="text"
            className="form-control"
            readOnly
            value={total.toFixed(2)}
          />
        </div>

        <button type="submit" className="btn btn-primary mb-3">
          Confirmar Pedido
        </button>

        {grouped.map(({ key, label, list }) => (
          <section key={key} className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{label}</h4>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => toggleSection(key)}
              >
                {openSections[key] ? "▼ Ocultar" : "▶ Mostrar"}
              </button>
            </div>
            {openSections[key] && (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-3 mt-2">
                {list.map(({ figura, count }) => (
                  <div key={figura._id} className="col">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <strong>{figura.code}</strong>
                        <p className="text-muted">
                          {figura.tipo.replace(/_/g, " ")}
                        </p>
                        <div className="d-flex justify-content-center align-items-center">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => decQty(figura._id)}
                          >
                            -
                          </button>
                          <span className="mx-2">{quantities[figura._id] || 0}</span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => incQty(figura._id, count)}
                          >
                            +
                          </button>
                        </div>
                        <small className="text-muted d-block mt-2">
                          (tienes: {count})
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </form>
    </div>
  );
}
