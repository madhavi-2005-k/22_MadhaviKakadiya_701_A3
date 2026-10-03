import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const fetchData = async () => {
    const prods = await axios.get(API + '/products');
    const cats = await axios.get(API + '/categories');
    setProducts(prods.data);
    setCategories(cats.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post(API + '/products', { name, price: Number(price), description, category });
    setName(''); setPrice(''); setDescription(''); setCategory('');
    fetchData();
  };

  const handleDelete = async (id) => {
    await axios.delete(API + '/products/' + id);
    fetchData();
  };

  // Group categories by parent for display
  const parentCats = categories.filter(c => !c.parent);
  const subCats = categories.filter(c => c.parent);

  return (
    <div>
      <h2>Manage Products</h2>
      <form onSubmit={handleAdd} style={{ background: 'white', padding: 15, borderRadius: 6, border: '1px solid #ddd' }}>
        <div className="form-group">
          <label>Product Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">-- Select Category --</option>
            {parentCats.map(p => {
              const children = subCats.filter(s => {
                const pid = s.parent && s.parent._id ? s.parent._id : s.parent;
                return pid === p._id;
              });
              return (
                <React.Fragment key={p._id}>
                  <option value={p._id}>{p.name}</option>
                  {children.map(s => (
                    <option key={s._id} value={s._id}>&nbsp;&nbsp;-- {s.name}</option>
                  ))}
                </React.Fragment>
              );
            })}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">Add Product</button>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Price</th><th>Category</th><th>Action</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.category ? p.category.name : '-'}</td>
              <td><button className="btn btn-danger" onClick={() => handleDelete(p._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
