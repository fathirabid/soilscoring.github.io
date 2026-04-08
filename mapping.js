// ==========================================================
// 1. INISIALISASI IKON & WAKTU (SIDEBAR)
// ==========================================================
if (typeof feather !== 'undefined') feather.replace();

function updateTime() {
    const now = new Date();
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    if (clockEl) clockEl.innerText = now.toLocaleTimeString('id-ID', { hour12: false });
    if (dateEl) dateEl.innerText = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
setInterval(updateTime, 1000); updateTime();


// ==========================================================
// 2. BLOK UNIVERSAL: AUTENTIKASI, MODAL, & TOAST
// ==========================================================
let isLoggedIn = false;

// A. Buka/Tutup Modal
function showLogin() { document.getElementById('loginModal').style.display = 'flex'; }
function closeLogin() { document.getElementById('loginModal').style.display = 'none'; }
function handleLogout() { document.getElementById('logoutModal').style.display = 'flex'; }
function closeLogoutModal() { document.getElementById('logoutModal').style.display = 'none'; }

// B. Fungsi Notifikasi Toast (Pojok Layar)
function showToast(status, title, msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toast-title').innerText = title;
    document.getElementById('toast-msg').innerText = msg;
    toast.className = "toast-container";
    toast.classList.add(status === 'success' ? 'toast-success' : 'toast-error');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// C. Fungsi Notifikasi Modal Status (Pop-up Tengah)
function showStatusModal(type, title, message) {
    const modal = document.getElementById('statusModal');
    if (!modal) return;
    const icon = document.getElementById('statusIcon');
    const titleEl = document.getElementById('statusTitle');
    const msgEl = document.getElementById('statusMessage');
    const box = modal.querySelector('.status-box');

    if (type === 'success') {
        icon.innerText = "✅"; box.className = "modal-content status-box success"; 
    } else if (type === 'error') {
        icon.innerText = "❌"; box.className = "modal-content status-box error";
    } else {
        icon.innerText = "⚠️"; box.className = "modal-content status-box warning";
    }

    titleEl.innerText = title; msgEl.innerText = message;
    
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.display = 'none'; }, 2000);
}

// D. Event Listener Utama
document.addEventListener("DOMContentLoaded", () => {
    
    // Toggle Ikon Mata Password
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const passInput = document.getElementById('loginPass');
            if (passInput.type === 'password') {
                passInput.type = 'text'; this.innerHTML = '<i data-feather="eye-off"></i>';
            } else {
                passInput.type = 'password'; this.innerHTML = '<i data-feather="eye"></i>';
            }
            if (typeof feather !== 'undefined') feather.replace();
        });
    }

    // Form Login Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const user = document.getElementById('loginUser').value;
            const pass = document.getElementById('loginPass').value;

            if (user === "admin" && pass === "pkm2026") {
                localStorage.setItem("adminLoggedIn", "true");
                
                showStatusModal('success', 'Akses Diterima', 'Login berhasil, memuat sistem SoilSense...');
                showToast('success', 'Berhasil Masuk!', 'Selamat datang, data lahan siap dikelola.');

                setTimeout(() => {
                    closeLogin(); loginForm.reset(); applyAdminState(true); 
                }, 1000);
            } else {        
                showStatusModal('error', 'Akses Ditolak', 'Username atau password yang Anda masukkan salah.');
                showToast('error', 'Gagal Masuk!', 'Username atau password salah.');
            }
        });
    }

    // Cek Memori Auto-Login
    if (localStorage.getItem("adminLoggedIn") === "true") { applyAdminState(true); } 
    else { applyAdminState(false); }
});

// E. Eksekusi Logout
function confirmLogout() {
    localStorage.setItem("adminLoggedIn", "false");
    
    showStatusModal('success', 'Sesi Berakhir', 'Anda telah keluar dari sistem.');
    showToast('success', 'Keluar Berhasil', 'Anda telah berhasil keluar dari sistem.');

    setTimeout(() => {
        closeLogoutModal(); applyAdminState(false);
    }, 1500);
}

// F. Terapkan Perubahan UI Sidebar & Panel Mapping
function applyAdminState(loginStatus) {
    isLoggedIn = loginStatus;
    const guestView = document.getElementById('guest-view');
    const adminView = document.getElementById('admin-view');
    const guestWarning = document.getElementById('guest-warning');
    const mapBox = document.getElementById('map-content-box');
    
    if (isLoggedIn) {
        if (guestView) guestView.style.display = 'none';
        if (adminView) adminView.style.display = 'block';
        if (guestWarning) guestWarning.style.display = 'none';
        
        if (mapBox) mapBox.style.display = 'block';
        if (typeof initMap === 'function') initMap(); // Panggil peta HANYA setelah login
    } else {
        if (guestView) guestView.style.display = 'block';
        if (adminView) adminView.style.display = 'none';
        if (guestWarning) guestWarning.style.display = 'block';
        
        if (mapBox) mapBox.style.display = 'none';
    }
}


// ==========================================================
// 3. FUNGSI KHUSUS HALAMAN MAPPING (TIDAK ADA YANG DIRUBAH)
// ==========================================================

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBDqfGHqjAxHWhbPdyzXQgR9W2oZsz4zrQ",
    authDomain: "soilsense-project-fc64f.firebaseapp.com",
    databaseURL: "https://soilsense-project-fc64f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "soilsense-project-fc64f"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let map; // Variabel global untuk Peta
let soilMarker; // Variabel global untuk Pin/Penanda

// --- FUNGSI SAKTI: MENGEMBALIKAN INGATAN TERAKHIR SAAT PINDAH HALAMAN ---
function restoreCachedData() {
    const cachedData = localStorage.getItem('soilSenseCache');
    if (cachedData) {
        const data = JSON.parse(cachedData);
        
        // Langsung tembak data ke HUD tanpa menunggu Firebase!
        const badge = document.getElementById('map-status-badge');
        if (badge) {
            badge.innerText = `Skor AI: ${data.score}/100 - ${data.status}`;
            badge.className = (data.score > 80) ? "badge-status badge-good" : (data.score > 50) ? "badge-status badge-warn" : "badge-status badge-crit";
        }

        const pulse = document.getElementById('hud-pulse');
        if (pulse) pulse.className = "pulse-indicator pulse-active";
        
        const hudScore = document.getElementById('hud-score');
        if (hudScore) hudScore.innerText = `${data.score} / 100`;
        
        const statusEl = document.getElementById('hud-status');
        if (statusEl) {
            statusEl.innerText = data.status;
            statusEl.style.color = (data.score > 80) ? "#27ae60" : (data.score > 50) ? "#f39c12" : "#e74c3c";
        }
        
        const hudPh = document.getElementById('hud-ph');
        if (hudPh) hudPh.innerText = `${data.ph} (${data.ph_status})`;
        
        const hudHum = document.getElementById('hud-hum');
        if (hudHum) hudHum.innerText = `${data.hum}%`;

        // Tipu sistem seolah-olah sedang online agar tidak kedip
        isMapOnline = true;
        lastMapDataTime = Date.now();
    }
}

// --- INISIALISASI PETA LEAFLET ---
function initMap() {
    if (map !== undefined) return; 

    // Titik awal sementara (sebelum GPS mengunci)
    const startLat = -6.860500; 
    const startLng = 107.589800;

    map = L.map('soilMap').setView([startLat, startLng], 15); 

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    const radarIcon = L.divIcon({
        className: 'custom-radar-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    soilMarker = L.marker([startLat, startLng], {icon: radarIcon}).addTo(map);
    soilMarker.bindPopup("<div class='popup-title'>📡 Prototype Smart Soil</div>Mencari sinyal GPS & data sensor...").openPopup();

    fetchLiveDataForMap();
    
    // --- NYALAKAN PELACAK GPS SEKARANG ---
    startLiveTracking();
}

// --- HUBUNGKAN DATA SENSOR & WATCHDOG (PEMANTAU KONEKSI) ---
let lastMapDataTime = 0;
let mapWatchdog;
let isMapOnline = false;

function fetchLiveDataForMap() {
    // 1. JALANKAN WATCHDOG (Cek tiap 3 detik)
    mapWatchdog = setInterval(() => {
        if (!isLoggedIn) return;
        const now = Date.now();
        
        // Jika data ESP32 tidak masuk selama lebih dari 10 detik = OFFLINE
        if (now - lastMapDataTime > 10000 && isMapOnline) {
            isMapOnline = false; // Tandai sistem mati
            
            // Ubah UI menjadi Offline
            const badge = document.getElementById('map-status-badge');
            if (badge) { badge.innerText = "Sensor ESP32 Terputus"; badge.className = "badge-status badge-crit"; }
            
            const pulse = document.getElementById('hud-pulse');
            if (pulse) pulse.className = "pulse-indicator"; // Matikan lampu hijau berkedip di HUD
            
            const hudScore = document.getElementById('hud-score');
            if (hudScore) hudScore.innerText = "-- / 100";
            
            const hudPh = document.getElementById('hud-ph');
            if (hudPh) hudPh.innerText = "--";
            
            const hudHum = document.getElementById('hud-hum');
            if (hudHum) hudHum.innerText = "--%";
            
            const statusEl = document.getElementById('hud-status');
            if (statusEl) { statusEl.innerText = "Koneksi Hilang"; statusEl.style.color = "#e74c3c"; }

            // Ubah Radar jadi Merah dan Berhenti Berkedip
            const offlineIcon = L.divIcon({ className: 'custom-radar-marker offline-radar', iconSize: [30, 30], iconAnchor: [15, 15] });
            if (soilMarker) {
                soilMarker.setIcon(offlineIcon);
                soilMarker.setPopupContent("<div class='popup-title' style='color:#e74c3c;'>⚠️ Sensor Offline</div>ESP32 mati. Peta hanya melacak lokasi Anda saat ini.");
            }
        }
    }, 3000);

    // 2. TERIMA DATA DARI FIREBASE
    database.ref('SoilSense/SensorData').on('value', (snapshot) => {
        if (!isLoggedIn || !soilMarker) return; 

        const data = snapshot.val();
        if(data) {
            lastMapDataTime = Date.now(); // Catat waktu data masuk
            
            // Jika sebelumnya mati, sekarang hidup lagi
            if (!isMapOnline) {
                isMapOnline = true;
                const onlineIcon = L.divIcon({ className: 'custom-radar-marker', iconSize: [30, 30], iconAnchor: [15, 15] });
                soilMarker.setIcon(onlineIcon); // Kembalikan radar hijau berkedip
            }

            // Update UI dengan data real-time
            const badge = document.getElementById('map-status-badge');
            if (badge) {
                badge.innerText = `Skor AI: ${data.score}/100 - ${data.status}`;
                if(data.score > 80) badge.className = "badge-status badge-good";
                else if(data.score > 50) badge.className = "badge-status badge-warn";
                else badge.className = "badge-status badge-crit";
            }

            const pulse = document.getElementById('hud-pulse');
            if (pulse) pulse.className = "pulse-indicator pulse-active"; // Nyalakan lampu HUD
            
            const hudScore = document.getElementById('hud-score');
            if (hudScore) hudScore.innerText = `${data.score} / 100`;
            
            const statusEl = document.getElementById('hud-status');
            if (statusEl) {
                statusEl.innerText = data.status;
                statusEl.style.color = (data.score > 80) ? "#27ae60" : (data.score > 50) ? "#f39c12" : "#e74c3c";
            }
            
            const hudPh = document.getElementById('hud-ph');
            if (hudPh) hudPh.innerText = `${data.ph} (${data.ph_status})`;
            
            const hudHum = document.getElementById('hud-hum');
            if (hudHum) hudHum.innerText = `${data.hum}%`;

            let timestamp = parseInt(data.lastUpdate);
            if (timestamp > 1000000000) timestamp = timestamp * 1000;
            const timeString = new Date(timestamp).toLocaleTimeString('id-ID');

            const popupHTML = `
                <div class='popup-title'>📡 Prototype Smart Soil (Live)</div>
                <div style="font-size: 13px; color: #555;">
                    <strong>Waktu Sinkron:</strong> ${timeString}<br>
                    <hr style="margin: 6px 0; border:none; border-top:1px dashed #ccc;">
                    <strong>Nitrogen:</strong> ${data.nitrogen} mg/kg<br>
                    <strong>Fosfor:</strong> ${data.fosfor} mg/kg<br>
                    <strong>Kalium:</strong> ${data.kalium} mg/kg<br>
                </div>
            `;
            // Hanya update isi popup tanpa harus menampilkannya paksa
            soilMarker.setPopupContent(popupHTML); 
        }
    });
}

// --- FITUR LIVE GPS TRACKING (BROWSER GEOLOCATION) ---
let watchId = null;

function startLiveTracking() {
    // Cek apakah browser HP/Laptop mendukung GPS
    if ("geolocation" in navigator) {
        
        // Mulai melacak pergerakan secara real-time
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy; 

                // Pindahkan Peta dan Pin Radar HANYA JIKA SENSOR ONLINE!
                if (map && soilMarker && isMapOnline) {
                    map.setView([lat, lng], 17);
                    soilMarker.setLatLng([lat, lng]);
                }
                
                console.log(`Live GPS Update: ${lat}, ${lng} (Akurasi: ${accuracy}m)`);
            },
            (error) => {
                console.warn("Error GPS: ", error.message);
                showToast('error', 'Akses GPS Ditolak', 'Izinkan browser mengakses lokasi Anda.');
            },
            {
                enableHighAccuracy: true, // Paksa gunakan satelit GPS (bukan sekadar tower seluler)
                maximumAge: 0,
                timeout: 10000
            }
        );
        
    } else {
        showToast('error', 'Sistem Gagal', 'Browser Anda tidak mendukung fitur Live GPS.');
    }
}

// ==========================================================
// MAGIC SCRIPT: TELEPORTASI PROFIL PINTAR (RESPONSIVE REAL-TIME)
// ==========================================================
function handleProfilePosition() {
    const profile = document.querySelector('.sidebar-footer');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (!profile || !sidebar || !mainContent) return; // Keamanan jika elemen tidak ditemukan

    if (window.innerWidth <= 768) {
        // JIKA LAYAR HP: Pindahkan profil ke atas Main Content (jika belum ada di sana)
        if (profile.parentElement !== mainContent) {
            mainContent.insertBefore(profile, mainContent.firstChild);
        }
    } else {
        // JIKA LAYAR DEKSTOP: Pulangkan profil kembali ke bawah Sidebar (jika belum ada di sana)
        if (profile.parentElement !== sidebar) {
            sidebar.appendChild(profile);
        }
    }
}

// 1. Jalankan saat halaman pertama kali dibuka
window.addEventListener('load', handleProfilePosition);

// 2. Jalankan secara REAL-TIME setiap kali ukuran layar ditarik/diubah (resize)
window.addEventListener('resize', handleProfilePosition);