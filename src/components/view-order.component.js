// src/components/view-order.component.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../api/api";

export default function ViewOrders() {
  const { id: albumId } = useParams();        // /my/albums/:id/pedido  → albumId
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);   // siempre array
  const [error,  setError]  = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axios.get(
          `${API}/orders`,
          {
            params: { albumId },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log(res.data);
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los pedidos");
      }
    }
    fetchOrders();
  }, [albumId, token]);

  const markDelivered = async (orderId) => {
    try {
      await axios.post(
        `${API}/orders/${orderId}/delivered`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: "delivered" } : o
      ));
    } catch {
      alert("Error marcando como entregado");
    }
  };

  const markCancelled = async (orderId) => {
    try {
      await axios.post(
        `${API}/orders/${orderId}/cancelled`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: "cancelled" } : o
      ));
    } catch {
      alert("Error cancelando el pedido");
    }
  };

  return (
    <div>
      <h2>Pedidos para este Álbum</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <p>No hay pedidos para este álbum.</p>
      ) : (
        <ul className="list-group">
          {orders.map(order => (
            <li key={order.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Pedido #{order.id}</strong>{" "}
                  <small className="text-muted">
                    {new Date(order.createdAt).toLocaleString()}
                  </small>
                  <br/>
                  Cliente: {order.customer}
                  <br/>
                  Total: S/.{order.total.toFixed(2)}
                  <br/>
                  Estado:{" "}
                  <span className={
                    order.status === "delivered" ? "text-success" :
                    order.status === "cancelled" ? "text-danger" :
                    "text-warning"
                  }>
                    {order.status}
                  </span>
                </div>
                <div>
                  {order.status === "pending" && (
                    <>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => markDelivered(order.id)}
                      >
                        ✔ Entregado
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => markCancelled(order.id)}
                      >
                        ✖ Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Detalle de items */}
              <ul className="mt-2">
                {order.items.map((it, i) => (
                  <li key={i}>
                    {it.figura.code} ({it.figura.tipo.replace(/_/g, " ")}) —{" "}
                    Cantidad: {it.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
