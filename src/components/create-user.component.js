import { Component } from "react";
import axios from "axios";
import { API } from "../api/api";
export default class CreateUser extends Component{
    
    constructor(props){
        super(props);
        // bind this to the methods
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        // set the initial state
        this.state = {
            usuario: '',
            contra: '',
        }
    }
    onChangeUsername(e){
        this.setState({
            nombre: e.target.value,
        });
    }
    onChangePassword(e){
        this.setState({
            contra: e.target.value
        });
    }
    onSubmit(e){
        e.preventDefault();
        const user = {
            nombre: this.state.nombre,
            contra: this.state.contra,
        }
        console.log(user);
        this.setState({
            nombre: '',
            contra: '',
        });
        axios.post(`${API}/usuarios/add`, user)
        .then(res => console.log(res.data));
        
    }
    render() {
        return (
            <div>
                <h1>Crear Usuario</h1>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Usuario: </label>
                        <input type="text" required className="form-control" value={this.state.nombre} onChange={this.onChangeUsername}/>
                        <label>Contraseña: </label>
                        <input type="password" required className="form-control" value={this.state.contra} onChange={this.onChangePassword}/>
                    </div>
                    <div className="form-group" style={
                        {
                            marginTop: 10
                        }
                    }>
                        <input type="submit" value="Crear Usuario" className="btn btn-primary" style={
                            {
                                width:"100%",
                                fontWeight: "bold",
                                background:"rgb(33,37,41)",
                            }
                        }/>
                    </div>
                </form>
            </div>
        )
    }
}