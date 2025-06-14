import { Component } from "react";
import { Link } from "react-router-dom";

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  componentDidMount() {
    // Supongamos que guardaste al usuario así en el login:
    // localStorage.setItem('user', JSON.stringify(data.usuario));
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        // console.error(saved);
        this.setState({ user: JSON.parse(saved) });
      } catch (err) {
        console.error("Error parsing stored user", err);
      }
    }
  }

  handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // opcional: también puedes redirigir a "/" o forzar recarga
    this.setState({ user: null });
  };

  render() {
    const { user, onLogout } = this.props;

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
            color: "White",
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "Papyrus"
          }}
        >
          FigurAndo
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <Link className="nav-link" to="/my/albums">
              Mis colecciones
            </Link>

            {user && user.rol === "admin" && <Link className="nav-link" to="/crearalbum">
              Crear Album
            </Link>}
            

            {user && user.rol === "admin" && <Link className="nav-link" to="/user">Crear Usuario</Link>}
            {!user && <Link className="nav-link" to="/login">Ingresar</Link>}
            {user && <span className="nav-link" onClick={onLogout}>Cerrar Sesión</span>}
          </div>
        </div>
      </nav>
    );
  }
}
