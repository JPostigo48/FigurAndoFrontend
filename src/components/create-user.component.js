// src/components/create-user.component.js
import React, { Component } from "react";
import axios from "axios";
import { API } from "../api/api";

export default class CreateUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nombre: "",
      contra: "",
      rol: "usuario", // rol por defecto
      error: ""
    };

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeRole     = this.onChangeRole.bind(this);
    this.onSubmit         = this.onSubmit.bind(this);
  }

  onChangeUsername(e) {
    this.setState({ nombre: e.target.value });
  }

  onChangePassword(e) {
    this.setState({ contra: e.target.value });
  }

  onChangeRole(e) {
    this.setState({ rol: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    const { nombre, contra, rol } = this.state;
    const user = { nombre, contra, rol };

    axios
      .post(`${API}/usuarios/add`, user)
      .then((res) => {
        console.log(res.data);
        // limpiar formulario y error
        this.setState({ nombre: "", contra: "", rol: "usuario", error: "" });
        alert("Usuario creado correctamente");
      })
      .catch((err) => {
        console.error("Error creando usuario:", err.response || err.message);
        this.setState({
          error:
            err.response?.data?.error ||
            err.response?.data ||
            "No se pudo crear el usuario"
        });
      });
  }

  render() {
    const { nombre, contra, rol, error } = this.state;

    return (
      <div>
        <h1>Crear Usuario</h1>

        {/* Mensaje de error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Usuario:</label>
            <input
              type="text"
              required
              className="form-control"
              value={nombre}
              onChange={this.onChangeUsername}
            />
          </div>

          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              required
              className="form-control"
              value={contra}
              onChange={this.onChangePassword}
            />
          </div>

          <div className="form-group">
            <label>Rol:</label>
            <select
              className="form-control"
              value={rol}
              onChange={this.onChangeRole}
              required
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div
            className="form-group"
            style={{ marginTop: 10 }}
          >
            <input
              type="submit"
              value="Crear Usuario"
              className="btn btn-primary"
              style={{
                width: "100%",
                fontWeight: "bold",
                background: "rgb(33,37,41)"
              }}
            />
          </div>
        </form>
      </div>
    );
  }
}
