'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  
  // Add/Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  const [form, setForm] = useState({
    id: '',
    name: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    deliveryFee: 0,
    image: '', // existing images CSV
    video: ''
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggested Categories (datalist)
  const existingCategories = [...new Set(products.map(p => p.category))];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  };

  const openAddModal = () => {
    setModalMode('add');
    setForm({ id: '', name: '', category: '', description: '', price: 0, stock: 0, deliveryFee: 0, image: '', video: '' });
    setImageFiles([]);
    setVideoFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setForm({ ...product });
    setImageFiles([]);
    setVideoFile(null);
    setIsModalOpen(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (videoFile && videoFile.size > 5 * 1024 * 1024) {
      alert("Video is too large. Please upload a short video (Max 5MB).");
      return;
    }

    if (!form.category.trim()) {
      alert("Please enter a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload new images
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await Promise.all(Array.from(imageFiles).map(file => uploadFile(file)));
      }
      
      // Combine existing images with newly uploaded ones
      let allImageUrls = form.image ? form.image.split(',').filter(Boolean) : [];
      allImageUrls = [...allImageUrls, ...uploadedImageUrls];
      const finalImageString = allImageUrls.join(',');

      let videoUrl = form.video;
      if (videoFile) videoUrl = await uploadFile(videoFile);

      const productData = {
        name: form.name,
        category: form.category,
        description: form.description,
        price: form.price,
        stock: form.stock,
        deliveryFee: form.deliveryFee,
        image: finalImageString,
        video: videoUrl,
      };

      if (modalMode === 'add') {
        productData.id = `p${Date.now()}`;
        productData.specialOffer = false;
        const { data, error } = await supabase.from('products').insert([productData]).select();
        if (!error && data) {
          setProducts([...products, data[0]]);
        } else throw error;
      } else {
        const { data, error } = await supabase.from('products').update(productData).eq('id', form.id).select();
        if (!error && data) {
          setProducts(prev => prev.map(p => p.id === form.id ? data[0] : p));
        } else throw error;
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExistingImage = (idxToRemove) => {
    const imgs = form.image.split(',').filter(Boolean);
    imgs.splice(idxToRemove, 1);
    setForm({ ...form, image: imgs.join(',') });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
        <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">Manage Products</h1>
        <button className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-colors" onClick={openAddModal}>
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-brand-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(product => {
                const primaryImage = product.image ? product.image.split(',')[0] : null;
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                        {primaryImage ? <Image src={primaryImage} alt="" fill className="object-cover" /> : <span className="text-slate-300 font-bold">{product.name.charAt(0)}</span>}
                      </div>
                      <span className="font-semibold text-slate-800 group-hover:text-brand-peach transition-colors">{product.name}</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">
                      <span className="bg-slate-100 px-3 py-1 rounded-full">{product.category}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">₦{product.price.toLocaleString()}</td>
                    <td className="p-4">
                      {product.stock > 0 ? (
                        <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md text-xs font-bold">{product.stock}</span>
                      ) : (
                        <span className="text-red-700 bg-red-100 px-3 py-1 rounded-md text-xs font-bold">0</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button onClick={() => openEditModal(product)} className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 font-bold rounded-lg transition-colors text-sm">
                        <Edit2 size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No products found. Click "Add Product" to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Name</label>
                  <input required type="text" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="E.g. Vintage Notebook" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <input required type="text" list="category-suggestions" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Type or select a category" />
                  <datalist id="category-suggestions">
                    {existingCategories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (₦)</label>
                  <input required type="number" min="0" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={form.price} onChange={e => setForm({...form, price: parseInt(e.target.value) || 0})} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stock Availability</label>
                  <input required type="number" min="0" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})} />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Fee (₦)</label>
                  <input required type="number" min="0" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={form.deliveryFee} onChange={e => setForm({...form, deliveryFee: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Description</label>
                <textarea required className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detailed description of the product..."></textarea>
              </div>

              {/* Images Section */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Product Images</label>
                
                {/* Existing Images */}
                {form.image && form.image.split(',').filter(Boolean).length > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {form.image.split(',').filter(Boolean).map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 group bg-white">
                        <Image src={img} alt="" fill className="object-cover" />
                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative border-2 border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100 transition-colors rounded-xl p-6 text-center cursor-pointer">
                    <UploadCloud size={32} className="mx-auto text-brand-500 mb-2" />
                    <span className="text-sm font-bold text-brand-600 block">Upload Images</span>
                    <span className="text-xs text-brand-400 block mt-1">Select multiple images</span>
                    <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setImageFiles(e.target.files)} />
                    {imageFiles.length > 0 && <span className="absolute bottom-2 left-0 right-0 text-xs font-bold text-brand-700 bg-brand-200/50 py-1">{imageFiles.length} files selected</span>}
                  </div>
                  
                  <div className="relative border-2 border-dashed border-slate-300 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl p-6 text-center cursor-pointer">
                    <UploadCloud size={32} className="mx-auto text-slate-500 mb-2" />
                    <span className="text-sm font-bold text-slate-600 block">Upload Video</span>
                    <span className="text-xs text-slate-400 block mt-1">Max 5MB</span>
                    <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setVideoFile(e.target.files[0])} />
                    {videoFile && <span className="absolute bottom-2 left-0 right-0 text-xs font-bold text-slate-700 bg-slate-300/50 py-1 truncate px-2">{videoFile.name}</span>}
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-peach text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-lg">
                  {isSubmitting ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
