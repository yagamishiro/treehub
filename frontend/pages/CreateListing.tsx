import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Plus } from 'lucide-react';

export const CreateListing = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('sale');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetch(`${apiBase}/api/categories`).then(res => res.json()).then(setCategories);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file: File) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    formData.append('type', type);
    formData.append('quantity', quantity);
    formData.append('price', price || '0');
    images.forEach(image => formData.append('images', image));

    try {
      const res = await fetch(`${apiBase}/api/listings`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) navigate('/');
      else {
        const data = await res.json();
        alert(data.error || "Failed to create listing");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-4 md:pt-20 px-4 max-w-2xl mx-auto">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-gray-900">Create Listing</h1>
        <p className="text-gray-500">Offer something to your community.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">Photos (1-5 images)</label>
          <div className="grid grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-400 hover:text-primary-600">
                <Plus size={24} />
                <span className="text-xs mt-1 font-medium">Add Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">What are you offering?</label>
          <input 
            type="text" placeholder="e.g. Bosch Power Drill for Borrowing" required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            value={title} onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Listing Type</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'sale', label: 'For Sale' },
              { id: 'borrow', label: 'Borrowing' },
              { id: 'service', label: 'Service' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                  type === t.id 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Quantity</label>
          <input 
            type="number" min="1" required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            value={quantity} onChange={e => setQuantity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Category</label>
          <select 
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white"
            value={categoryId} onChange={e => setCategoryId(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Description</label>
          <textarea 
            placeholder="Tell your neighbors more about it..." required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[150px]"
            value={description} onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Price (Optional, leave blank if free/borrow)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₱</span>
            <input 
              type="number" placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={Number(price).toLocaleString('en-PH')} onChange={e => setPrice(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95"
        >
          {isSubmitting ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
};
