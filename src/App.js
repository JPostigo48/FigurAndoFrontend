import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/navbar.component';
import CreateUser from './components/create-user.component';
import LoginUser from './components/login.component';
import CreateAlbum from './components/create-album.component';
import Colecciones from './components/colecciones.component';
import AlbumsList from './components/albums-list.component';
import FigureList from './components/figure-list.component';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <Router>
      <div className="container" style={{ paddingTop: '10px' }}>
        <Navbar
          user={user}
          onLogout={() => {
            localStorage.clear();
            setUser(null);
          }}
        />
        <br />
        <Routes>
          {/* En v6 ya no existe exact ni prop Component */}
          <Route path="/" element={<AlbumsList />} />
          <Route path="/my/albums" element={<Colecciones />} />
          <Route path="/my/albums/:id" element={<FigureList />} />
          <Route path="/crearalbum" element={<CreateAlbum />} />
          <Route path="/user" element={<CreateUser />} />
          {/* Para Login pasas el prop onLogin dentro del JSX */}
          <Route
            path="/login"
            element={<LoginUser onLogin={(u) => setUser(u)} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
