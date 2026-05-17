import React, { useState, useEffect } from 'react';
import { Upload, Camera, Image as ImageIcon, Calendar, MapPin, Tag, Trash2, Search, Filter, Plus, X, Eye } from 'lucide-react';

interface ElectionImage {
  id: string;
  title: string;
  description: string;
  category: 'Voting Day' | 'EVM & Tech' | 'Campaigns & Rallies' | 'Civic Education';
  location: string;
  date: string;
  imageUrl: string; // Can be base64 data URL or external URL
  isPreseeded?: boolean;
}

const PRESEEDED_IMAGES: ElectionImage[] = [
  {
    id: 'preseeded-1',
    title: 'Historic Voting Line',
    description: 'Enthusiastic citizens queueing up peacefully in the early hours to cast their democratic votes.',
    category: 'Voting Day',
    location: 'New Delhi, India',
    date: '2026-04-12',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
    isPreseeded: true
  },
  {
    id: 'preseeded-2',
    title: 'EVM Demonstration Camp',
    description: 'Local officials demonstrating the security features and functioning of the Electronic Voting Machine (EVM) to young voters.',
    category: 'EVM & Tech',
    location: 'Mumbai, Maharashtra',
    date: '2026-04-20',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    isPreseeded: true
  },
  {
    id: 'preseeded-3',
    title: 'Democracy Rally',
    description: 'A vibrant civic awareness campaign rally highlighting the importance of every single vote in a democratic nation.',
    category: 'Campaigns & Rallies',
    location: 'Bangalore, Karnataka',
    date: '2026-05-02',
    imageUrl: 'https://images.unsplash.com/photo-1552581230-c013b1841961?auto=format&fit=crop&w=800&q=80',
    isPreseeded: true
  },
  {
    id: 'preseeded-4',
    title: 'Voter Information Seminar',
    description: 'A university seminar educating students on voter registration processes, NOTA, and electoral systems.',
    category: 'Civic Education',
    location: 'Kolkata, West Bengal',
    date: '2026-05-10',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    isPreseeded: true
  }
];

const ElectionUploads: React.FC = () => {
  const [images, setImages] = useState<ElectionImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal & Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ElectionImage | null>(null);
  
  // New Upload Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Voting Day' | 'EVM & Tech' | 'Campaigns & Rallies' | 'Civic Education'>('Voting Day');
  const [locationName, setLocationName] = useState('');
  const [dateVal, setDateVal] = useState(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Load images from local storage
  useEffect(() => {
    const saved = localStorage.getItem('civicbrain_election_images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Combine pre-seeded and user-uploaded images, filter out duplicates
        const userUploaded = parsed.filter((img: ElectionImage) => !img.isPreseeded);
        setImages([...PRESEEDED_IMAGES, ...userUploaded]);
      } catch (err) {
        console.error('Failed to parse uploaded images:', err);
        setImages(PRESEEDED_IMAGES);
      }
    } else {
      setImages(PRESEEDED_IMAGES);
    }
  }, []);

  // Save user-uploaded images to local storage
  const saveImagesToLocalStorage = (updatedImages: ElectionImage[]) => {
    const userOnly = updatedImages.filter(img => !img.isPreseeded);
    localStorage.setItem('civicbrain_election_images', JSON.stringify(userOnly));
  };

  // Handle Image File Selection and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG/JPG/WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrorMsg('Image is too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageFile(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  // Submit the Upload Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim() || !imageFile) {
      setErrorMsg('Please fill in all fields and choose an image.');
      return;
    }

    const newImg: ElectionImage = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      location: locationName.trim(),
      date: dateVal,
      imageUrl: imageFile
    };

    const newImages = [newImg, ...images];
    setImages(newImages);
    saveImagesToLocalStorage(newImages);

    // Reset Form
    setTitle('');
    setDescription('');
    setCategory('Voting Day');
    setLocationName('');
    setDateVal(new Date().toISOString().split('T')[0]);
    setImageFile(null);
    setIsUploadOpen(false);
  };

  // Delete User-Uploaded Image
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      const updated = images.filter(img => img.id !== id);
      setImages(updated);
      saveImagesToLocalStorage(updated);
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    }
  };

  // Filter and Search logic
  const filteredImages = images.filter(img => {
    const matchesSearch = 
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="election-uploads-view">
      <div className="gallery-header-section">
        <div>
          <h2 className="view-title">Voter Lens: <span className="text-gradient">Election Gallery</span></h2>
          <p className="subtitle">Upload, view, and document democratic moments, polling infrastructure, and civic learning memories.</p>
        </div>
        <button className="btn-primary flex-center gap-2" onClick={() => setIsUploadOpen(true)}>
          <Plus size={20} /> Upload Moment
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="gallery-controls glass-card">
        <div className="search-bar-gallery">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by title, description, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="category-filter-chips">
          {['All', 'Voting Day', 'EVM & Tech', 'Campaigns & Rallies', 'Civic Education'].map(cat => (
            <button 
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="empty-gallery glass-card flex-center">
          <ImageIcon size={48} className="empty-icon" />
          <h3>No moments found</h3>
          <p>Try resetting filters or be the first to upload an election moment!</p>
          <button className="btn-outline mt-4" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredImages.map(img => (
            <div 
              key={img.id} 
              className="gallery-card glass-card animate-fade-in"
              onClick={() => setSelectedImage(img)}
            >
              <div className="card-image-wrapper">
                <img src={img.imageUrl} alt={img.title} loading="lazy" />
                <span className={`category-badge ${img.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
                  {img.category}
                </span>
                <div className="card-hover-overlay flex-center">
                  <div className="action-circle-btn">
                    <Eye size={20} />
                  </div>
                </div>
              </div>
              <div className="card-details">
                <h3>{img.title}</h3>
                <p className="card-description">{img.description}</p>
                <div className="card-meta">
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{img.location}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{img.date}</span>
                  </div>
                </div>
                {!img.isPreseeded && (
                  <button 
                    className="delete-card-btn" 
                    onClick={(e) => handleDelete(img.id, e)}
                    title="Delete moment"
                    aria-label={`Delete ${img.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="modal-backdrop flex-center" onClick={() => setIsUploadOpen(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Election Moment</h3>
              <button className="close-modal" onClick={() => setIsUploadOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {errorMsg && <div className="error-alert">{errorMsg}</div>}
              
              <div className="form-group image-dropzone">
                {imageFile ? (
                  <div className="image-preview-container">
                    <img src={imageFile} alt="Preview" />
                    <button type="button" className="remove-preview" onClick={() => setImageFile(null)}>
                      <X size={16} /> Remove Image
                    </button>
                  </div>
                ) : (
                  <label className="file-upload-label flex-center">
                    <Upload size={32} />
                    <span>Choose an Image</span>
                    <span className="file-spec">PNG, JPG, WEBP up to 5MB</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }}
                      required
                    />
                  </label>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input 
                    type="text" 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="E.g., Voting Booth setup"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select 
                    id="category" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="Voting Day">Voting Day</option>
                    <option value="EVM & Tech">EVM & Tech</option>
                    <option value="Campaigns & Rallies">Campaigns & Rallies</option>
                    <option value="Civic Education">Civic Education</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input 
                    type="text" 
                    id="location" 
                    value={locationName} 
                    onChange={(e) => setLocationName(e.target.value)} 
                    placeholder="E.g., Chennai, Tamil Nadu"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input 
                    type="date" 
                    id="date" 
                    value={dateVal} 
                    onChange={(e) => setDateVal(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Share the significance of this moment or any interesting facts about it..."
                  rows={3}
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / View Details Modal */}
      {selectedImage && (
        <div className="modal-backdrop flex-center" onClick={() => setSelectedImage(null)}>
          <div className="modal-content glass-card view-details-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedImage.title}</h3>
              <button className="close-modal" onClick={() => setSelectedImage(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="detail-modal-body">
              <div className="detail-image-wrapper">
                <img src={selectedImage.imageUrl} alt={selectedImage.title} />
              </div>
              <div className="detail-info">
                <span className={`category-badge ${selectedImage.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
                  {selectedImage.category}
                </span>
                <p className="detail-description">{selectedImage.description}</p>
                <div className="detail-meta-list">
                  <div className="detail-meta-item">
                    <MapPin size={18} className="meta-icon" />
                    <div>
                      <span className="meta-label">Location</span>
                      <span className="meta-value">{selectedImage.location}</span>
                    </div>
                  </div>
                  <div className="detail-meta-item">
                    <Calendar size={18} className="meta-icon" />
                    <div>
                      <span className="meta-label">Date Documented</span>
                      <span className="meta-value">{selectedImage.date}</span>
                    </div>
                  </div>
                </div>
                {selectedImage.isPreseeded && (
                  <div className="curated-badge-notice">
                    <Tag size={14} />
                    <span>Curated CivicBrain.AI Editorial Moment</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .election-uploads-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 4rem;
        }

        .gallery-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
        }

        .gallery-header-section .subtitle {
          color: var(--text-dim);
          font-size: 1rem;
          margin-top: 0.25rem;
        }

        .gallery-controls {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .search-bar-gallery {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          width: 100%;
        }

        .search-bar-gallery input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          width: 100%;
          font-size: 0.95rem;
        }

        .category-filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .filter-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-dim);
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .filter-chip:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-main);
        }

        .filter-chip.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .empty-gallery {
          min-height: 300px;
          flex-direction: column;
          gap: 1rem;
          padding: 3rem;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-dim);
          opacity: 0.5;
        }

        .empty-gallery p {
          color: var(--text-dim);
          font-size: 0.95rem;
          max-width: 400px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .gallery-card {
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .gallery-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-image-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .card-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-card:hover .card-image-wrapper img {
          transform: scale(1.05);
        }

        .category-badge {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .category-badge.voting-day { background: rgba(99, 102, 241, 0.85); }
        .category-badge.evm-&-tech { background: rgba(168, 85, 247, 0.85); }
        .category-badge.campaigns-&-rallies { background: rgba(234, 179, 8, 0.85); }
        .category-badge.civic-education { background: rgba(16, 185, 129, 0.85); }

        .card-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.4);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-card:hover .card-hover-overlay {
          opacity: 1;
        }

        .action-circle-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .action-circle-btn:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.3);
        }

        .card-details {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
        }

        .card-details h3 {
          font-size: 1.15rem;
          font-weight: 650;
          line-height: 1.3;
        }

        .card-description {
          font-size: 0.88rem;
          color: var(--text-dim);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          flex: 1;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-dim);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.75rem;
          margin-top: auto;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .delete-card-btn {
          position: absolute;
          bottom: 1.25rem;
          right: 1.25rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
        }

        .gallery-card:hover .delete-card-btn {
          opacity: 1;
        }

        .delete-card-btn:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        /* Modals & Forms */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 999;
          padding: 1.5rem;
        }

        .modal-content {
          width: 100%;
          max-width: 600px;
          background: rgba(30, 27, 75, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
        }

        .view-details-modal {
          max-width: 750px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .modal-header h3 {
          font-size: 1.3rem;
          font-weight: 700;
        }

        .close-modal {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .close-modal:hover {
          color: var(--text-main);
        }

        .modal-form {
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #ef4444;
          color: #f87171;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.88rem;
        }

        .image-dropzone {
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          height: 180px;
          transition: border-color 0.2s ease;
          overflow: hidden;
        }

        .image-dropzone:hover {
          border-color: var(--primary);
        }

        .file-upload-label {
          width: 100%;
          height: 100%;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
          color: var(--text-dim);
          font-size: 0.95rem;
        }

        .file-upload-label:hover {
          color: var(--text-main);
        }

        .file-spec {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .image-preview-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .image-preview-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-preview {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          backdrop-filter: blur(4px);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.88rem;
          font-weight: 550;
          color: var(--text-main);
        }

        .form-group input, .form-group select, .form-group textarea {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 0.65rem 0.85rem;
          color: var(--text-main);
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: var(--primary);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1.25rem;
        }

        /* Detail Modal Body */
        .detail-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
          max-height: 70vh;
        }

        .detail-image-wrapper {
          border-radius: 12px;
          overflow: hidden;
          background: black;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .detail-image-wrapper img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
        }

        .detail-info {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          align-items: flex-start;
        }

        .detail-description {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-main);
        }

        .detail-meta-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1rem;
        }

        .detail-meta-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .detail-meta-item .meta-icon {
          color: var(--primary);
        }

        .detail-meta-item .meta-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .detail-meta-item .meta-value {
          font-size: 0.92rem;
          font-weight: 550;
        }

        .curated-badge-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .gallery-header-section {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }

          .detail-modal-body {
            grid-template-columns: 1fr;
          }
        }
      ` }} />
    </div>
  );
};

export default ElectionUploads;
