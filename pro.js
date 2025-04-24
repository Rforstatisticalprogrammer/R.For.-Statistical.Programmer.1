// Simulated database
const users = [
    { username: 'viewer', password: 'viewer123', role: 'viewer' },
    { username: 'admin', password: 'admin123', role: 'admin' }
];

const videos = [
    { id: 1, title: 'Introduction to Security', thumbnail: 'https://via.placeholder.com/300x180?text=Security+Video', url: 'assets/videos/sample1.mp4', description: 'Learn the basics of security principles.' },
    { id: 2, title: 'Advanced Encryption', thumbnail: 'https://via.placeholder.com/300x180?text=Encryption+Video', url: 'assets/videos/sample2.mp4', description: 'Deep dive into encryption techniques.' },
    { id: 3, title: 'DRM Protection', thumbnail: 'https://via.placeholder.com/300x180?text=DRM+Video', url: 'assets/videos/sample3.mp4', description: 'Understanding Digital Rights Management.' }
];

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
const uploadProgress = document.getElementById('uploadProgress');
const uploadFileName = document.getElementById('uploadFileName');
const uploadProgressBar = document.getElementById('uploadProgressBar');
const uploadStatus = document.getElementById('uploadStatus');

// Initialize the app
function init() {
    // Check if user is already logged in (simulated session check)
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentSessionToken = sessionToken;
        showVideosPage();
        return;
    }

    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    adminBtn.addEventListener('click', showAdminPage);
    backToVideosBtn.addEventListener('click', showVideosPage);
    adminLogoutBtn.addEventListener('click', handleLogout);
    backFromPlayerBtn.addEventListener('click', showVideosPage);
    playerLogoutBtn.addEventListener('click', handleLogout);
    videoUpload.addEventListener('change', handleFileUpload);

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
    loginPage.classList.remove('hidden');
    videosPage.classList.add('hidden');
    adminPage.classList.add('hidden');
    playerPage.classList.add('hidden');
}

// Show videos page
function showVideosPage() {
    loginPage.classList.add('hidden');
    videosPage.classList.remove('hidden');
    adminPage.classList.add('hidden');
    playerPage.classList.add('hidden');
    
    // Show admin button if user is admin
    if (currentUser && currentUser.role === 'admin') {
        adminBtn.classList.remove('hidden');
    } else {
        adminBtn.classList.add('hidden');
    }
    
    renderVideoGrid();
}

// Show admin page
function showAdminPage() {
    loginPage.classList.add('hidden');
    videosPage.classList.add('hidden');
    adminPage.classList.remove('hidden');
    playerPage.classList.add('hidden');
    
    // Reset to upload section
    document.querySelectorAll('.admin-sidebar li').forEach(i => i.classList.remove('active'));
    document.querySelector('.admin-sidebar li[data-section="upload"]').classList.add('active');
    uploadSection.classList.remove('hidden');
    manageSection.classList.add('hidden');
}

// Show video player
function showVideoPlayer(videoId) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    loginPage.classList.add('hidden');
    videosPage.classList.add('hidden');
    adminPage.classList.add('hidden');
    playerPage.classList.remove('hidden');
    
    videoTitle.textContent = video.title;
    videoDescription.textContent = video.description;
    
    // In a real app, we would use DRM-protected streams
    secureVideoPlayer.src = video.url;
    
    // Check for screen recording (simulated)
    checkScreenRecording();
}

// Render video grid
function renderVideoGrid() {
    videoGrid.innerHTML = '';
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <button class="btn" onclick="showVideoPlayer(${video.id})">Watch</button>
            </div>
        `;
        videoGrid.appendChild(videoCard);
    });
}

// Check for screen recording (simulated)
function checkScreenRecording() {
    // In a real app, this would use Widevine DRM or other detection methods
    // For demo purposes, we'll simulate random detection
    const isRecording = Math.random() > 0.7; // 30% chance of "detection"
    
    if (isRecording) {
        recordingWarning.style.display = 'block';
        secureVideoPlayer.pause();
        secureVideoPlayer.controls = false;
    } else {
        recordingWarning.style.display = 'none';
        secureVideoPlayer.controls = true;
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simulate authentication
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Simulate session creation
        currentUser = user;
        currentSessionToken = generateSessionToken();
        
        // Store session (in a real app, this would be a secure HTTP-only cookie)
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

// Handle selected files
function handleFiles(files) {
    if (files.length > 0) {
        simulateUpload(files[0]);
    }
}

// Handle file upload
function handleFileUpload(e) {
    handleFiles(e.target.files);
}

// Simulate file upload (in a real app, this would be an AJAX call)
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
            
            // Simulate processing delay
            setTimeout(() => {
                // Add the new video to the "database"
                const newVideo = {
                    id: videos.length + 1,
                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    thumbnail: 'https://via.placeholder.com/300x180?text=New+Video',
                    url: URL.createObjectURL(file),
                    description: 'Newly uploaded video'
                };
                videos.push(newVideo);
                
                uploadStatus.textContent = 'Video processed and ready!';
                loadAdminVideoList();
                
                // Reset form after delay
                setTimeout(() => {
                    uploadProgress.classList.add('hidden');
                    videoUpload.value = '';
                }, 2000);
            }, 2000);
        }
    }, 300);
}

// Load admin video list
function loadAdminVideoList() {
    adminVideoList.innerHTML = '';
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-list-item';
        videoItem.innerHTML = `
            <div>
                <h3>${video.title}</h3>
                <p>ID: ${video.id}</p>
            </div>
            <div class="actions">
                <button class="btn" onclick="deleteVideo(${video.id})">Delete</button>
            </div>
        `;
        adminVideoList.appendChild(videoItem);
    });
}

// Delete video
function deleteVideo(id) {
    if (confirm('Are you sure you want to delete this video?')) {
        const index = videos.findIndex(v => v.id === id);
        if (index !== -1) {
            videos.splice(index, 1);
            loadAdminVideoList();
            renderVideoGrid(); // Update the main video grid
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Make functions available globally for HTML onclick attributes
window.showVideoPlayer = showVideoPlayer;
window.deleteVideo = deleteVideo;


