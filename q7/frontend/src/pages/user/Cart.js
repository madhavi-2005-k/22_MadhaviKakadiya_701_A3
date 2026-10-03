import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/cart';

export default function Cart() {
  const [items, setItems] = useState([]);

  const fetchCart = async () => {
    const r = await axios.get(API);
    setItems(r.data);
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (id) => {
    await axios.delete(API + '/' + id);
    fetchCart();
  };

  const clearCart = async () => {
    await axios.delete(API);
    fetchCart();
  };

  const total = items.reduce((sum, item) => {
    return sum + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  return (
    <div>
      <h2>Shopping Cart</h2>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th>Action</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td>{item.product ? item.product.name : 'N/A'}</td>
                  <td>${item.product ? item.product.price : 0}</td>
                  <td>{item.quantity}</td>
                  <td>${item.product ? item.product.price * item.quantity : 0}</td>
                  <td><button className="btn btn-danger" onClick={() => removeItem(item._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-total">
            Total: ${total.toFixed(2)}
          </div>

          <div style={{ marginTop: 10, textAlign: 'right' }}>
            <button className="btn btn-danger" onClick={clearCart}>Clear Cart</button>
          </div>
        </>
      )}
    </div>
  );
}
