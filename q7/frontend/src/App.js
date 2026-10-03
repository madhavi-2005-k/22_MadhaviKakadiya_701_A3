import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import Shop from './pages/user/Shop';
import Cart from './pages/user/Cart';

function NavBar() {
  const loc = useLocation();
  return (
    <nav>
      <Link to="/" className={loc.pathname === '/' ? 'active' : ''}>Shop</Link>
      <Link to="/cart" className={loc.pathname === '/cart' ? 'active' : ''}>Cart</Link>
      <Link to="/admin/categories" className={loc.pathname.startsWith('/admin/cat') ? 'active' : ''}>
        Admin: Categories
      </Link>
      <Link to="/admin/products" className={loc.pathname.startsWith('/admin/prod') ? 'active' : ''}>
        Admin: Products
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
