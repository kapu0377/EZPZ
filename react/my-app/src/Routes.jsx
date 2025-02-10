import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';

const Routes = () => {
  return (
    <>
      <Header />
      <RouterRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </RouterRoutes>
    </>
  );
};

export default Routes; 