import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    axios.get(API + '/categories').then(r => setCategories(r.data));
    axios.get(API + '/products').then(r => setProducts(r.data));
  }, []);

  const filterByCat = async (catId) => {
    setSelectedCat(catId);
    if (catId) {
      const r = await axios.get(API + '/products/category/' + catId);
      setProducts(r.data);
    } else {
      const r = await axios.get(API + '/products');
      setProducts(r.data);
    }
  };

  const addToCart = async (productId) => {
    await axios.post(API + '/cart', { product: productId });
    alert('Added to cart!');
  };

  const parentCats = categories.filter(c => !c.parent);
  const subCats = categories.filter(c => c.parent);

  return (
    <div>
      <h2>Shop Products</h2>

      {/* Category Tree */}
      <div className="category-tree">
        <h4 onClick={() => filterByCat('')} style={{ color: !selectedCat ? '#2196F3' : '#333' }}>
          All Products
        </h4>
        {parentCats.map(p => (
          <div key={p._id}>
            <h4 onClick={() => filterByCat(p._id)}
                style={{ color: selectedCat === p._id ? '#2196F3' : '#333' }}>
              {p.name}
            </h4>
            <div className="sub-list">
              {subCats.filter(s => (s.parent._id || s.parent) === p._id).map(s => (
                <span key={s._id}
                      className={selectedCat === s._id ? 'active' : ''}
                      onClick={() => filterByCat(s._id)}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Product Grid */}
      <div className="card-grid">
        {products.length === 0 && <p>No products found.</p>}
        {products.map(p => (
          <div className="card" key={p._id}>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p className="price">${p.price}</p>
            <p style={{ fontSize: 12, color: '#999' }}>{p.category ? p.category.name : ''}</p>
            <button className="btn btn-success" onClick={() => addToCart(p._id)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
