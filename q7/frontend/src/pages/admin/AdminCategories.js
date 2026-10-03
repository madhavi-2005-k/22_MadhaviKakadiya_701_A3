import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/categories';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [parents, setParents] = useState([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');

  const fetchData = async () => {
    const all = await axios.get(API);
    const par = await axios.get(API + '/parents');
    setCategories(all.data);
    setParents(par.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post(API, { name, parent: parentId || null });
    setName('');
    setParentId('');
    fetchData();
  };

  const handleDelete = async (id) => {
    await axios.delete(API + '/' + id);
    fetchData();
  };

  return (
    <div>
      <h2>Manage Categories</h2>
      <form onSubmit={handleAdd} style={{ background: 'white', padding: 15, borderRadius: 6, border: '1px solid #ddd' }}>
        <div className="form-group">
          <label>Category Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Parent Category (leave empty for top-level)</label>
          <select value={parentId} onChange={e => setParentId(e.target.value)}>
            <option value="">-- None (Top Level) --</option>
            {parents.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">Add Category</button>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Type</th><th>Parent</th><th>Action</th></tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.parent ? 'Sub-category' : 'Parent'}</td>
              <td>{c.parent ? c.parent.name : '-'}</td>
              <td><button className="btn btn-danger" onClick={() => handleDelete(c._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
