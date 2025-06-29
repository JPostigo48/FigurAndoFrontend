// src/components/navbar.component.js
import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false
    };
  }

  toggleMenu = () => {
    this.setState(prev => ({ menuOpen: !prev.menuOpen }));
  };

  handleLogout = () => {
    this.props.onLogout();
  };

  render() {
    const { user } = this.props;
    const { menuOpen, redirect } = this.state;

    return (
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-dark"
        style={{
          paddingInline: 40,
          borderRadius: 50
        }}
      >
        <Link
          className="navbar-brand"
          to="/"
          style={{
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "Papyrus"
          }}
        >
          FigurAndo
        </Link>

        {/* Toggler controlado */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={this.toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Collapse controlado */}
        <div className={`collapse navbar-collapse${menuOpen ? " show" : ""}`}>
          <div className="navbar-nav">
            <Link className="nav-link" to="/my/albums">
              Mis colecciones
            </Link>

            {user && user.rol === "admin" && (
              <Link className="nav-link" to="/crear-album">
                Crear Álbum
              </Link>
            )}

            {user && user.rol === "admin" && (
              <Link className="nav-link" to="/user">
                Crear Usuario
              </Link>
            )}

            {!user && (
              <Link className="nav-link" to="/login">
                Ingresar
              </Link>
            )}

            {user && (
              <span
                className="nav-link"
                style={{ cursor: "pointer" }}
                onClick={this.handleLogout}
              >
                Cerrar Sesión
              </span>
            )}
          </div>
        </div>
      </nav>
    );
  }
}
