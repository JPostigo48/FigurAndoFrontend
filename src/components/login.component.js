import { Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";  
import { API } from "../api/api";

export default class LoginUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nombre: "",
      contra: "",
      redirect: false 
    };
    this.onChangeNombre = this.onChangeNombre.bind(this);
    this.onChangeContra = this.onChangeContra.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChangeNombre(e) {
    this.setState({ nombre: e.target.value });
  }

  onChangeContra(e) {
    this.setState({ contra: e.target.value });
  }

  async onSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${API}/usuarios/login`,
        {
          nombre: this.state.nombre,
          contra: this.state.contra
        }
      );

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.token}`;
      
      console.log("Usuario logueado:", data.usuario);
      
      this.props.onLogin(data.usuario);
      this.setState({ redirect: true });
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data.error || "Error al ingresar");
    }
  }
  

  render() {
    if (this.state.redirect) {
      return <Navigate to="/" replace />;
    }
    return (
      <div>
        <h1>Ingresar</h1>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Usuario:</label>
            <input
              type="text"
              required
              className="form-control"
              value={this.state.nombre}
              onChange={this.onChangeNombre}
            />

            <label>Contraseña:</label>
            <input
              type="password"
              required
              className="form-control"
              value={this.state.contra}
              onChange={this.onChangeContra}
            />
          </div>
          <div className="form-group" style={{ marginTop: 10 }}>
            <input
              type="submit"
              value="Ingresar"
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
