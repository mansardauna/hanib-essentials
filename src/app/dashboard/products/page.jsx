'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function ProductsManagement() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Product Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState('add');
  
  const [productForm, setProductForm] = useState({
    id: '', name: '', category: '', description: '', price: 0, stock: 0, deliveryFee: 0, image: '', video: ''
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('add');
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '' });

  useEffect(() => {
    const initializeData = async () => {
      // 1. Fetch Products
      const { data: prodData } = await supabase.from('products').select('*');
      const loadedProducts = prodData || [];
      setProducts(loadedProducts);

      // 2. Fetch Categories (with safe fallback to loaded products)
      const { data: catData, error: catError } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (!catError && catData && catData.length > 0) {
        setCategories(catData);
      } else {
        const uniqueCats = [...new Set(loadedProducts.map(p => p.category))].filter(Boolean);
        setCategories(uniqueCats.map((c, i) => ({ id: `cat_${i}`, name: c })));
      }
    };
    
    initializeData();
  }, []);

  /* --- Product Functions --- */
  const openAddProductModal = () => {
    setProductModalMode('add');
    setProductForm({ id: '', name: '', category: '', description: '', price: 0, stock: 0, deliveryFee: 0, image: '', video: '' });
    setImageFiles([]);
    setVideoFile(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setProductModalMode('edit');
    setProductForm({ ...product });
    setImageFiles([]);
    setVideoFile(null);
    setIsProductModalOpen(true);
  };

  const uploadFile = async (file) => {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabase.storage.from('products').upload(filename, file, { 
      cacheControl: '3600', 
      upsert: false 
    });
    
    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(filename);
    return publicUrlData.publicUrl;
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (videoFile && videoFile.size > 5 * 1024 * 1024) {
      alert("Video is too large. Please upload a short video (Max 5MB).");
      return;
    }
    if (!productForm.category.trim()) {
      alert("Please select or enter a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await Promise.all(Array.from(imageFiles).map(file => uploadFile(file)));
      }
      
      let allImageUrls = productForm.image ? productForm.image.split(',').filter(Boolean) : [];
      allImageUrls = [...allImageUrls, ...uploadedImageUrls];
      const finalImageString = allImageUrls.join(',');

      let videoUrl = productForm.video;
      if (videoFile) videoUrl = await uploadFile(videoFile);

      const productData = {
        name: productForm.name,
        category: productForm.category,
        description: productForm.description,
        price: productForm.price,
        stock: productForm.stock,
        deliveryFee: productForm.deliveryFee,
        image: finalImageString,
        video: videoUrl,
      };

      if (productModalMode === 'add') {
        productData.id = `p${Date.now()}`;
        productData.specialOffer = false;
        const { data, error } = await supabase.from('products').insert([productData]).select();
        if (!error && data) setProducts([...products, data[0]]);
        else throw error;
      } else {
        const { data, error } = await supabase.from('products').update(productData).eq('id', productForm.id).select();
        if (!error && data) setProducts(prev => prev.map(p => p.id === productForm.id ? data[0] : p));
        else throw error;
      }
      setIsProductModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExistingImage = (idxToRemove) => {
    const imgs = productForm.image.split(',').filter(Boolean);
    imgs.splice(idxToRemove, 1);
    setProductForm({ ...productForm, image: imgs.join(',') });
  };

  /* --- Category Functions --- */
  const openAddCategoryModal = () => {
    setCategoryModalMode('add');
    setCategoryForm({ id: '', name: '' });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setCategoryModalMode('edit');
    setCategoryForm({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const deleteCategory = async (cat) => {
    // Check if products use this category
    const inUse = products.some(p => p.category === cat.name);
    if (inUse) {
      alert(`Cannot delete category "${cat.name}" because it is currently used by one or more products. Please reassign those products first.`);
      return;
    }
    
    if (confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', cat.id);
        if (!error) {
          setCategories(prev => prev.filter(c => c.id !== cat.id));
        } else {
          // If error occurs, it might be due to missing table, fallback to UI only
          setCategories(prev => prev.filter(c => c.id !== cat.id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (categoryModalMode === 'add') {
        const newCat = { id: `c${Date.now()}`, name: categoryForm.name };
        const { data, error } = await supabase.from('categories').insert([newCat]).select();
        if (!error && data) {
          setCategories([...categories, data[0]]);
        } else {
          // Fallback UI update if table is missing
          setCategories([...categories, newCat]);
        }
      } else {
        const { data, error } = await supabase.from('categories').update({ name: categoryForm.name }).eq('id', categoryForm.id).select();
        if (!error && data) {
          // Update any products that were using the old category name
          const oldCat = categories.find(c => c.id === categoryForm.id);
          if (oldCat) {
            await supabase.from('products').update({ category: data[0].name }).eq('category', oldCat.name);
            fetchProducts();
          }
          setCategories(prev => prev.map(c => c.id === categoryForm.id ? data[0] : c));
        } else {
          setCategories(prev => prev.map(c => c.id === categoryForm.id ? { ...c, name: categoryForm.name } : c));
        }
      }
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">Manage Store</h1>
          {activeTab === 'products' ? (
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-colors" onClick={openAddProductModal}>
              + Add Product
            </button>
          ) : (
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-colors" onClick={openAddCategoryModal}>
              + Add Category
            </button>
          )}
        </div>
        
        <div className="flex gap-4">
          <button 
            className={`px-6 py-3 font-bold rounded-xl transition-colors ${activeTab === 'products' ? 'bg-brand-500 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`px-6 py-3 font-bold rounded-xl transition-colors ${activeTab === 'categories' ? 'bg-brand-500 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
        </div>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
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
                        <button onClick={() => openEditProductModal(product)} className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 font-bold rounded-lg transition-colors text-sm">
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
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl shadow-sm border border-brand-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Products in Category</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat.name).length;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{cat.name}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-600">
                          {count} Product{count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => openEditCategoryModal(cat)} className="flex items-center gap-2 px-3 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 font-bold rounded-lg transition-colors text-sm">
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => deleteCategory(cat)} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition-colors text-sm">
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500 font-medium">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">{productModalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Name</label>
                  <input required type="text" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="E.g. Vintage Notebook" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <select required className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (₦)</label>
                  <input required type="number" min="0" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseInt(e.target.value) || 0})} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stock Availability</label>
                  <input required type="number" min="0" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})} />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Fee (₦)</label>
                  <input required type="number" min="0" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={productForm.deliveryFee} onChange={e => setProductForm({...productForm, deliveryFee: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Description</label>
                <textarea required className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" rows="4" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} placeholder="Detailed description of the product..."></textarea>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Product Images</label>
                
                {productForm.image && productForm.image.split(',').filter(Boolean).length > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {productForm.image.split(',').filter(Boolean).map((img, idx) => (
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
              
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-peach text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-lg">
                  {isSubmitting ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md flex flex-col rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">{categoryModalMode === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Name</label>
                <input required type="text" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-400 font-medium text-slate-800" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="E.g. Electronics" />
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl shadow-md hover:bg-slate-900 transition-all disabled:opacity-50 text-lg">
                {isSubmitting ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
