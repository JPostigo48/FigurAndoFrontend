// src/components/create-album.component.js
import React, { Component } from "react";
import axios from "axios";

export default class CreateAlbum extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nombre: "",
      editorial: "",
      imagen: "",          
      figurasDisplay: [],           
      figurasIds: [],               

      currentTipo: "",
      currentIndex: ""
    };

    this.onChangeNombre       = this.onChangeNombre.bind(this);
    this.onChangeEditorial    = this.onChangeEditorial.bind(this);
    this.onChangeImagen       = this.onChangeImagen.bind(this);    // ← bind
    this.onChangeCurrentTipo  = this.onChangeCurrentTipo.bind(this);
    this.onChangeCurrentIndex = this.onChangeCurrentIndex.bind(this);
    this.onAddFigura          = this.onAddFigura.bind(this);
    this.onSubmit             = this.onSubmit.bind(this);
  }

  onChangeNombre(e) {
    this.setState({ nombre: e.target.value });
  }

  onChangeEditorial(e) {
    this.setState({ editorial: e.target.value });
  }

  onChangeImagen(e) {
    this.setState({ imagen: e.target.value });
  }

  onChangeCurrentTipo(e) {
    this.setState({ currentTipo: e.target.value });
  }

  onChangeCurrentIndex(e) {
    this.setState({ currentIndex: e.target.value });
  }

  async onAddFigura(e) {
    e.preventDefault();
    const { nombre, currentTipo, currentIndex } = this.state;
    if (!currentTipo || !currentIndex || !nombre) {
      return alert("Debes ingresar nombre de álbum y datos de la figura");
    }

    try {
      const payload = { album: nombre, code: currentIndex, tipo: currentTipo };
      const res = await axios.post("http://localhost:5000/figuras/add", payload);
      const nuevaFigura = res.data;

      this.setState(prev => ({
        figurasDisplay: [
          ...prev.figurasDisplay,
          { _id: nuevaFigura._id, tipo: currentTipo, index: currentIndex }
        ],
        figurasIds: [...prev.figurasIds, nuevaFigura._id],
        currentTipo: "",
        currentIndex: ""
      }));
    } catch (err) {
      console.error("Error creando figura:", err.response || err.message);
      alert("No se pudo crear la figura");
    }
  }

  async onSubmit(e) {
    e.preventDefault();
    const { nombre, editorial, imagen, figurasIds } = this.state;
    if (!imagen) {
      return alert("Debes proporcionar la URL de la imagen del álbum");
    }
    if (!figurasIds.length) {
      return alert("Agrega al menos una figura antes de crear el álbum");
    }

    const newAlbum = { nombre, editorial, imagen, figuras: figurasIds };
    try {
      const res = await axios.post("http://localhost:5000/albumes/add", newAlbum);
      console.log("Álbum creado:", res.data);
      window.location = "/";
    } catch (err) {
      console.error("Error creando álbum:", err.response || err.message);
      alert("No se pudo crear el álbum.");
    }
  }

  render() {
    const { nombre, editorial, imagen, figurasDisplay, currentTipo, currentIndex } = this.state;
    const tipoOptions = [
      { value: "normal", label: "Normal" },
      { value: "dorado_normal", label: "Dorado Normal" },
      { value: "dorado_escarchado", label: "Dorado Escarchado" },
      { value: "lenticular", label: "Lenticular" },
      { value: "troquelada", label: "Troquelada" },
      { value: "premio", label: "Premio" }
    ];

    return (
      <div>
        <h1>Crear Nuevo Álbum</h1>
        <form onSubmit={this.onSubmit}>
          {/* Nombre + Editorial */}
          <div className="form-group">
            <label>Nombre del Álbum:</label>
            <input
              type="text" required className="form-control"
              value={nombre} onChange={this.onChangeNombre}
            />
          </div>
          <div className="form-group">
            <label>Editorial:</label>
            <input
              type="text" required className="form-control"
              value={editorial} onChange={this.onChangeEditorial}
            />
          </div>
          {/* Nuevo campo Imagen */}
          <div className="form-group">
            <label>URL de la imagen:</label>
            <input
              type="url" required className="form-control"
              placeholder="https://ejemplo.com/portada.jpg"
              value={imagen} onChange={this.onChangeImagen}
            />
          </div>

          <hr />

          {/* Lista de figuras en UI */}
          <h5>Listado de Figuras</h5>
          {figurasDisplay.length === 0 && <p>No hay figuras agregadas.</p>}
          <ul className="list-group mb-3">
            {figurasDisplay.map(f => (
              <li key={f._id} className="list-group-item">
                <strong>{
                  tipoOptions.find(o => o.value === f.tipo)?.label || f.tipo
                }</strong> – {f.index}
              </li>
            ))}
          </ul>

          {/* Form para añadir figura */}
          <div className="form-row align-items-end">
            <div className="col">
              <label>Tipo:</label>
              <select
                className="form-control"
                value={currentTipo}
                onChange={this.onChangeCurrentTipo}
                required
              >
                <option value="" disabled>Selecciona tipo</option>
                {tipoOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="col">
              <label>Code:</label>
              <input
                type="text" className="form-control"
                placeholder="1, T-1, P-funko..."
                value={currentIndex}
                onChange={this.onChangeCurrentIndex}
                required
              />
            </div>
            <div className="col-auto">
              <button className="btn btn-secondary" onClick={this.onAddFigura}>
                Crear Figura
              </button>
            </div>
          </div>

          {/* Botón Crear Álbum */}
          <div className="form-group" style={{ marginTop: 20 }}>
            <input
              type="submit" value="Finalizar y Crear Álbum"
              className="btn btn-primary"
              style={{
                width: "100%",
                fontWeight: "bold",
                background: "rgb(33,37,41)",
                color: "white"
              }}
            />
          </div>
        </form>
      </div>
    );
  }
}
