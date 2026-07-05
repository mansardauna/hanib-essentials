'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  
  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Add Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    category: 'School Items',
    description: '',
    price: 0,
    stock: 0,
    deliveryFee: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('products').select('*').then(({ data }) => { if (data) setProducts(data); });
  }, []);

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleSaveEdit = async (id) => {
    try {
      const { data, error } = await supabase.from('products').update(editForm).eq('id', id).select();
      if (!error && data) {
        setProducts(prev => prev.map(p => p.id === id ? data[0] : p));
        setEditingId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Video Validation for strict "short 0.5sec" size constraint (e.g. limit to 5MB)
    if (videoFile && videoFile.size > 5 * 1024 * 1024) {
      alert("Video is too large. Please upload a short video (Max 5MB).");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = '';
      let videoUrl = '';

      if (imageFile) imageUrl = await uploadFile(imageFile);
      if (videoFile) videoUrl = await uploadFile(videoFile);

      const newProduct = {
        id: `p${Date.now()}`,
        ...addForm,
        image: imageUrl,
        video: videoUrl,
        specialOffer: false
      };

      const { data, error } = await supabase.from('products').insert([newProduct]).select();

      if (!error && data) {
        setProducts([...products, data[0]]);
        setIsAddModalOpen(false);
        // Reset form
        setAddForm({ name: '', category: 'School Items', description: '', price: 0, stock: 0, deliveryFee: 0 });
        setImageFile(null);
        setVideoFile(null);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0'}}>
        <h1>Manage Products</h1>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>Add Product</button>
      </div>

      <div className="card" style={{padding: '1.5rem'}}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price (₦)</th>
              <th>Stock</th>
              <th>Delivery Fee (₦)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>
                  {editingId === product.id ? (
                    <input 
                      type="number" 
                      value={editForm.price} 
                      onChange={e => setEditForm({...editForm, price: parseInt(e.target.value)})}
                      className="edit-input"
                    />
                  ) : (
                    product.price.toLocaleString()
                  )}
                </td>
                <td>
                  {editingId === product.id ? (
                    <input 
                      type="number" 
                      value={editForm.stock} 
                      onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value)})}
                      className="edit-input"
                    />
                  ) : (
                    <span style={{color: product.stock <= 0 ? 'red' : 'inherit', fontWeight: product.stock <= 0 ? '600' : 'normal'}}>
                      {product.stock}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === product.id ? (
                    <input 
                      type="number" 
                      value={editForm.deliveryFee} 
                      onChange={e => setEditForm({...editForm, deliveryFee: parseInt(e.target.value)})}
                      className="edit-input"
                    />
                  ) : (
                    product.deliveryFee.toLocaleString()
                  )}
                </td>
                <td>
                  {editingId === product.id ? (
                    <button onClick={() => handleSaveEdit(product.id)} className="btn btn-primary" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}>Save</button>
                  ) : (
                    <button onClick={() => handleEditClick(product)} className="btn btn-outline" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button onClick={() => setIsAddModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-body">
              <div className="form-grid">
                <div className="mui-form-group">
                  <input required type="text" className="mui-input" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} placeholder=" " />
                  <label className="mui-label">Product Name</label>
                </div>
                <div className="mui-form-group">
                  <select className="mui-input" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})}>
                    <option value="School Items">School Items</option>
                    <option value="Toys">Toys</option>
                    <option value="Special Offers">Special Offers</option>
                  </select>
                  <label className="mui-label">Category</label>
                </div>
                <div className="mui-form-group">
                  <input required type="number" min="0" className="mui-input" value={addForm.price} onChange={e => setAddForm({...addForm, price: parseInt(e.target.value) || 0})} placeholder=" " />
                  <label className="mui-label">Price (₦)</label>
                </div>
                <div className="mui-form-group">
                  <input required type="number" min="0" className="mui-input" value={addForm.stock} onChange={e => setAddForm({...addForm, stock: parseInt(e.target.value) || 0})} placeholder=" " />
                  <label className="mui-label">Initial Stock</label>
                </div>
                <div className="mui-form-group">
                  <input required type="number" min="0" className="mui-input" value={addForm.deliveryFee} onChange={e => setAddForm({...addForm, deliveryFee: parseInt(e.target.value) || 0})} placeholder=" " />
                  <label className="mui-label">Delivery Fee (₦)</label>
                </div>
              </div>
              
              <div className="mui-form-group" style={{marginTop: '1rem'}}>
                <textarea required className="mui-input" rows="3" value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} placeholder=" "></textarea>
                <label className="mui-label">Product Description</label>
              </div>

              <div className="file-uploads">
                <div className="upload-box">
                  <UploadCloud size={24} />
                  <p>Product Image</p>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                  {imageFile && <span className="file-name">{imageFile.name}</span>}
                </div>
                <div className="upload-box">
                  <UploadCloud size={24} />
                  <p>Short Video (Max 5MB)</p>
                  <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} />
                  {videoFile && <span className="file-name">{videoFile.name}</span>}
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{width: '100%'}}>
                  {isSubmitting ? 'Uploading & Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .table th {
          color: var(--muted-foreground);
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        .edit-input {
          width: 80px;
          padding: 0.25rem;
          border: 1px solid var(--border);
          font-size: 0.875rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          width: 95%;
          max-width: 600px;
          background: var(--card);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }
        .modal-body {
          padding: 2rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .file-uploads {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
          margin-top: 1rem;
        }
        .upload-box {
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          text-align: center;
          position: relative;
          background: var(--muted);
          transition: all 0.3s;
        }
        .upload-box:hover {
          border-color: var(--primary);
        }
        .upload-box input {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .file-name {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .modal-footer {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .form-grid, .file-uploads {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
