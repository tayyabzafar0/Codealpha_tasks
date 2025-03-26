document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const galleryGrid = document.getElementById('galleryGrid');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const closeBtn = document.getElementById('closeBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const imageInfo = document.getElementById('imageInfo');
    
    // Gallery State
    let images = JSON.parse(localStorage.getItem('galleryImages')) || [];
    let currentIndex = 0;
    let filteredImages = [];
    
    // Initialize Gallery
    initGallery();
    
    // Event Listeners
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileUpload);
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        fileInput.files = e.dataTransfer.files;
        handleFileUpload();
    });
    
    searchInput.addEventListener('input', filterImages);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterImages();
        });
    });
    
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    favoriteBtn.addEventListener('click', toggleFavorite);
    downloadBtn.addEventListener('click', downloadImage);
    
    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'f') {
            toggleFavorite();
        }
    });
    
    // Functions
    function initGallery() {
        if (images.length === 0) {
            showEmptyState();
        } else {
            renderGallery(images);
        }
    }
    
    function showEmptyState() {
        galleryGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h3>No images found</h3>
                <p>Upload some images to get started</p>
            </div>
        `;
    }
    
    function renderGallery(imagesToRender) {
        galleryGrid.innerHTML = '';
        
        if (imagesToRender.length === 0) {
            showEmptyState();
            return;
        }
        
        imagesToRender.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            
            const title = document.createElement('h3');
            title.className = 'item-title';
            title.textContent = image.name.split('.')[0];
            
            const date = document.createElement('p');
            date.className = 'item-date';
            date.textContent = formatDate(image.uploadDate);
            
            const favButton = document.createElement('button');
            favButton.className = `favorite-btn ${image.isFavorite ? 'active' : ''}`;
            favButton.innerHTML = '<i class="fas fa-heart"></i>';
            favButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavoriteInGallery(index);
            });
            
            overlay.appendChild(title);
            overlay.appendChild(date);
            galleryItem.appendChild(img);
            galleryItem.appendChild(overlay);
            galleryItem.appendChild(favButton);
            
            galleryItem.addEventListener('click', () => openLightbox(index));
            
            galleryGrid.appendChild(galleryItem);
        });
    }
    
    function handleFileUpload() {
        const files = fileInput.files;
        if (files.length === 0) return;
        
        uploadProgress.style.display = 'block';
        let uploadedCount = 0;
        
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) {
                uploadedCount++;
                updateProgress(uploadedCount, files.length);
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const newImage = {
                    id: Date.now() + index,
                    url: e.target.result,
                    name: file.name,
                    size: formatFileSize(file.size),
                    uploadDate: new Date().toISOString(),
                    isFavorite: false
                };
                
                images.unshift(newImage);
                uploadedCount++;
                updateProgress(uploadedCount, files.length);
                
                if (uploadedCount === files.length) {
                    finishUpload();
                }
            };
            
            reader.onerror = function() {
                uploadedCount++;
                updateProgress(uploadedCount, files.length);
                
                if (uploadedCount === files.length) {
                    finishUpload();
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    function updateProgress(uploaded, total) {
        const percent = Math.round((uploaded / total) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}% uploaded`;
    }
    
    function finishUpload() {
        saveToLocalStorage();
        renderGallery(images);
        filterImages();
        
        // Reset upload area
        setTimeout(() => {
            uploadProgress.style.display = 'none';
            progressBar.style.width = '0%';
            progressText.textContent = '0% uploaded';
            fileInput.value = '';
        }, 1000);
    }
    
    function filterImages() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        filteredImages = images.filter(image => {
            const matchesSearch = image.name.toLowerCase().includes(searchTerm);
            let matchesFilter = true;
            
            if (activeFilter === 'recent') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                matchesFilter = new Date(image.uploadDate) > oneWeekAgo;
            } else if (activeFilter === 'favorites') {
                matchesFilter = image.isFavorite;
            }
            
            return matchesSearch && matchesFilter;
        });
        
        renderGallery(filteredImages);
    }
    
    function openLightbox(index) {
        currentIndex = index;
        const imagesToUse = filteredImages.length > 0 ? filteredImages : images;
        const image = imagesToUse[currentIndex];
        
        lightboxImage.src = image.url;
        lightboxImage.alt = image.name;
        
        // Update image info
        imageInfo.querySelector('.image-title').textContent = image.name.split('.')[0];
        imageInfo.querySelector('.image-date span').textContent = formatDate(image.uploadDate, true);
        imageInfo.querySelector('.image-size span').textContent = image.size;
        
        // Update favorite button
        favoriteBtn.className = image.isFavorite ? 'lightbox-btn active' : 'lightbox-btn';
        favoriteBtn.innerHTML = image.isFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function showPrevImage() {
        const imagesToUse = filteredImages.length > 0 ? filteredImages : images;
        currentIndex = (currentIndex - 1 + imagesToUse.length) % imagesToUse.length;
        openLightbox(currentIndex);
    }
    
    function showNextImage() {
        const imagesToUse = filteredImages.length > 0 ? filteredImages : images;
        currentIndex = (currentIndex + 1) % imagesToUse.length;
        openLightbox(currentIndex);
    }
    
    function toggleFavorite() {
        const imagesToUse = filteredImages.length > 0 ? filteredImages : images;
        const image = imagesToUse[currentIndex];
        
        // Find the original image in the main array
        const originalImageIndex = images.findIndex(img => img.id === image.id);
        if (originalImageIndex === -1) return;
        
        images[originalImageIndex].isFavorite = !images[originalImageIndex].isFavorite;
        saveToLocalStorage();
        
        // Update UI
        favoriteBtn.className = images[originalImageIndex].isFavorite ? 'lightbox-btn active' : 'lightbox-btn';
        favoriteBtn.innerHTML = images[originalImageIndex].isFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        
        // Update gallery if needed
        if (document.querySelector('.filter-btn.active').dataset.filter === 'favorites') {
            filterImages();
        }
        
        // Update the favorite button in the gallery
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            if (parseInt(item.dataset.index) === originalImageIndex) {
                const favBtn = item.querySelector('.favorite-btn');
                favBtn.classList.toggle('active', images[originalImageIndex].isFavorite);
            }
        });
    }
    
    function toggleFavoriteInGallery(index) {
        const imagesToUse = filteredImages.length > 0 ? filteredImages : images;
        const image = imagesToUse[index];
        
        // Find the original image in the main array
        const originalImageIndex = images.findIndex(img => img.id === image.id);
        if (originalImageIndex === -1) return;
        
        images[originalImageIndex].isFavorite = !images[originalImageIndex].isFavorite;
        saveToLocalStorage();
        
        // Update the favorite button
        const favBtn = document.querySelector(`.gallery-item[data-index="${index}"] .favorite-btn`);
        favBtn.classList.toggle('active', images[originalImageIndex].isFavorite);
        favBtn.innerHTML = images[originalImageIndex].isFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        
        // Update filter if needed
        if (document.querySelector('.filter-btn.active').dataset.filter === 'favorites') {
            filterImages();
        }
    }
    
    function downloadImage() {
        const imagesToUse = filteredImages.length > 0 ? filteredImages : images;
        const image = imagesToUse[currentIndex];
        
        const link = document.createElement('a');
        link.href = image.url;
        link.download = image.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function saveToLocalStorage() {
        localStorage.setItem('galleryImages', JSON.stringify(images));
    }
    
    function formatDate(dateString, fullDate = false) {
        const date = new Date(dateString);
        if (fullDate) {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString();
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});