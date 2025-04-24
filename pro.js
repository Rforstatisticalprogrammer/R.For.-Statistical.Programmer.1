// Simulated database
const users = [
    { username: 'sharoon shaik', password: 'shubham', role: 'admin' },
    { username: 'R Classes', password: 'batch 1', role: 'user' }
];

let videos = []; // Start with empty video collection

// Current user session
let currentUser = null;
let currentSessionToken = null;

// DOM Elements
const loginPage = document.getElementById('loginPage');
const videosPage = document.getElementById('videosPage');
const adminPage = document.getElementById('adminPage');
const playerPage = document.getElementById('playerPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const adminBtn = document.getElementById('adminBtn');
const backToVideosBtn = document.getElementById('backToVideosBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const backFromPlayerBtn = document.getElementById('backFromPlayerBtn');
const playerLogoutBtn = document.getElementById('playerLogoutBtn');
const videoGrid = document.getElementById('videoGrid');
const secureVideoPlayer = document.getElementById('secureVideoPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoDescription = document.getElementById('videoDescription');
const recordingWarning = document.getElementById('recordingWarning');
const uploadSection = document.getElementById('uploadSection');
const manageSection = document.getElementById('manageSection');
const adminVideoList = document.getElementById('adminVideoList');
const videoUpload = document.getElementById('videoUpload');
const dropArea = document.getElementById('dropArea');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const uploadProgress = document.getElementById('uploadProgress');
const uploadFileName = document.getElementById('uploadFileName');
const uploadProgressBar = document.getElementById('uploadProgressBar');
const uploadStatus = document.getElementById('uploadStatus');

// Reset video player function
function resetVideoPlayer() {
    secureVideoPlayer.pause();
    secureVideoPlayer.currentTime = 0;
    secureVideoPlayer.removeAttribute('src');
    secureVideoPlayer.load();
    videoTitle.textContent = '';
    videoDescription.textContent = '';
}

// Initialize the app
function init() {
    // Check if user is already logged in
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
            currentSessionToken = sessionToken;
            showVideosPage();
        } catch (e) {
            handleLogout();
        }
    } else {
        showLoginPage();
    }

    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    adminBtn.addEventListener('click', showAdminPage);
    backToVideosBtn.addEventListener('click', showVideosPage);
    adminLogoutBtn.addEventListener('click', handleLogout);
    backFromPlayerBtn.addEventListener('click', () => {
        resetVideoPlayer();
        showVideosPage();
    });
    playerLogoutBtn.addEventListener('click', handleLogout);
    videoUpload.addEventListener('change', handleFileUpload);
    selectFilesBtn.addEventListener('click', () => videoUpload.click());

    // Drag and drop for upload
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    // Admin sidebar navigation
    document.querySelectorAll('.admin-sidebar li').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.admin-sidebar li').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            if (item.dataset.section === 'upload') {
                uploadSection.classList.remove('hidden');
                manageSection.classList.add('hidden');
            } else {
                uploadSection.classList.add('hidden');
                manageSection.classList.remove('hidden');
                loadAdminVideoList();
            }
        });
    });

    // Initialize video grid
    renderVideoGrid();
}

// Generate random session token
function generateSessionToken() {
    return 'token-' + Math.random().toString(36).substr(2, 16);
}

// Show login page
function showLoginPage() {
    resetVideoPlayer();
    loginPage.classList.remove('hidden');
    videosPage.classList.add('hidden');
    adminPage.classList.add('hidden');
    playerPage.classList.add('hidden');
}

// Show videos page
function showVideosPage() {
    resetVideoPlayer();
    loginPage.classList.add('hidden');
    videosPage.classList.remove('hidden');
    adminPage.classList.add('hidden');
    playerPage.classList.add('hidden');
    
    if (currentUser && currentUser.role === 'admin') {
        adminBtn.classList.remove('hidden');
    } else {
        adminBtn.classList.add('hidden');
    }
    
    renderVideoGrid();
}

// Show admin page
function showAdminPage() {
    resetVideoPlayer();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('You do not have admin privileges');
        return;
    }
    
    loginPage.classList.add('hidden');
    videosPage.classList.add('hidden');
    adminPage.classList.remove('hidden');
    playerPage.classList.add('hidden');
    
    document.querySelectorAll('.admin-sidebar li').forEach(i => i.classList.remove('active'));
    document.querySelector('.admin-sidebar li[data-section="upload"]').classList.add('active');
    uploadSection.classList.remove('hidden');
    manageSection.classList.add('hidden');
}

// Show video player with MP4 specific handling
function showVideoPlayer(videoId) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    loginPage.classList.add('hidden');
    videosPage.classList.add('hidden');
    adminPage.classList.add('hidden');
    playerPage.classList.remove('hidden');
    
    videoTitle.textContent = video.title;
    videoDescription.textContent = video.description;
    
    // Set video source with type attribute for MP4
    secureVideoPlayer.innerHTML = `
        <source src="${video.url}" type="video/mp4">
        Your browser does not support MP4 videos.
    `;
    secureVideoPlayer.load();
    secureVideoPlayer.controls = true;
    secureVideoPlayer.controlsList = 'nodownload';
    
    // Enhanced error handling for MP4
    secureVideoPlayer.addEventListener('error', () => {
        const error = secureVideoPlayer.error;
        let message = 'Error loading MP4 video.';
        
        if (error) {
            switch(error.code) {
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    message = 'The MP4 format is not supported.';
                    break;
                case MediaError.MEDIA_ERR_NETWORK:
                    message = 'Network error loading MP4 video.';
                    break;
                case MediaError.MEDIA_ERR_DECODE:
                    message = 'Error decoding MP4 video.';
                    break;
            }
        }
        
        console.error('MP4 video error:', error);
        alert(message);
        showVideosPage();
    });
}

// Render video grid
function renderVideoGrid() {
    videoGrid.innerHTML = '';
    
    if (videos.length === 0) {
        videoGrid.innerHTML = `
            <div class="empty-state">
                <p>No videos available</p>
                ${currentUser?.role === 'admin' ? 
                    '<p>Upload MP4 videos using the admin panel</p>' : 
                    '<p>Contact administrator to upload videos</p>'}
            </div>
        `;
        return;
    }
    
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = ` 
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://via.placeholder.com/300x180?text=Video+Thumbnail'">
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <button class="btn" onclick="showVideoPlayer(${video.id})">Play Video</button>
            </div>
        `;
        videoGrid.appendChild(videoCard);
    });
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        currentSessionToken = generateSessionToken();
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('sessionToken', currentSessionToken);
        
        loginError.style.display = 'none';
        showVideosPage();
    } else {
        loginError.textContent = 'Invalid username or password';
        loginError.style.display = 'block';
    }
}

// Handle logout
function handleLogout() {
    // Clean up any blob URLs
    videos.forEach(video => {
        if (video.url.startsWith('blob:')) {
            URL.revokeObjectURL(video.url);
        }
    });
    
    resetVideoPlayer();
    currentUser = null;
    currentSessionToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionToken');
    showLoginPage();
}

// Prevent default drag and drop behavior
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area
function highlight() {
    dropArea.style.borderColor = 'var(--primary-color)';
    dropArea.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
}

// Unhighlight drop area
function unhighlight() {
    dropArea.style.borderColor = '#ddd';
    dropArea.style.backgroundColor = '';
}

// Handle dropped files
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle selected files with MP4 validation
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')) {
            simulateUpload(file);
        } else {
            alert('Please upload only MP4 video files (.mp4)');
        }
    }
}

// Handle file upload
function handleFileUpload(e) {
    handleFiles(e.target.files);
}

// Simulate file upload with MP4 validation
function simulateUpload(file) {
    uploadProgress.classList.remove('hidden');
    uploadFileName.textContent = file.name;
    uploadProgressBar.value = 0;
    uploadStatus.textContent = 'Starting upload...';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        uploadProgressBar.value = progress;
        uploadStatus.textContent = `Uploading... ${Math.round(progress)}%`;

        if (progress === 100) {
            clearInterval(interval);
            uploadStatus.textContent = 'Upload complete! Processing video...';
            
            setTimeout(() => {
                const videoUrl = URL.createObjectURL(file);
                const newVideo = {
                    id: videos.length > 0 ? Math.max(...videos.map(v => v.id)) + 1 : 1,
                    title: file.name.replace(/\.mp4$/i, "").replace(/_/g, " "),
                    thumbnail: 'https://via.placeholder.com/300x180?text=Video+Thumbnail',
                    url: videoUrl,
                    description: `Uploaded on ${new Date().toLocaleDateString()}`
                };
                
                videos.push(newVideo);
                uploadStatus.textContent = 'Video ready!';
                
                loadAdminVideoList();
                renderVideoGrid();
                
                setTimeout(() => {
                    uploadProgress.classList.add('hidden');
                    videoUpload.value = '';
                }, 1500);
            }, 1500);
        }
    }, 200);
}

// Load admin video list
function loadAdminVideoList() {
    adminVideoList.innerHTML = '';
    
    if (videos.length === 0) {
        adminVideoList.innerHTML = '<p class="empty-state">No videos uploaded yet</p>';
        return;
    }
    
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-list-item';
        videoItem.innerHTML = ` 
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>ID: ${video.id}</p>
            </div>
            <div class="actions">
                <button class="btn" style="background-color: var(--danger-color);" onclick="deleteVideo(${video.id})">Delete</button>
            </div>
        `;
        adminVideoList.appendChild(videoItem);
    });
}

// Delete video with blob URL cleanup
function deleteVideo(id) {
    if (confirm('Are you sure you want to delete this video?')) {
        const index = videos.findIndex(v => v.id === id);
        if (index !== -1) {
            // Revoke object URL if it was created from a local file
            if (videos[index].url.startsWith('blob:')) {
                URL.revokeObjectURL(videos[index].url);
            }
            videos.splice(index, 1);
            loadAdminVideoList();
            renderVideoGrid();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Make functions available globally for HTML event handlers
window.showVideoPlayer = showVideoPlayer;
window.deleteVideo = deleteVideo;
