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
                
                showStatusModal('success', 'Akses Diterima', 'Menghubungkan ke sensor...');
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

    showToast('success', 'Keluar Berhasil', 'Anda telah berhasil keluar dari sistem.');

    setTimeout(() => {
        closeLogoutModal(); applyAdminState(false);
    }, 1500);
}

// F. Terapkan Perubahan UI Sidebar & Panel Settings
function applyAdminState(loginStatus) {
    isLoggedIn = loginStatus;
    const guestView = document.getElementById('guest-view');
    const adminView = document.getElementById('admin-view');
    const guestWarning = document.getElementById('guest-warning');
    const setBox = document.getElementById('admin-settings-panel');
    
    if (isLoggedIn) {
        if (guestView) guestView.style.display = 'none';
        if (adminView) adminView.style.display = 'block';
        if (guestWarning) guestWarning.style.display = 'none';
        if (setBox) setBox.style.display = 'block';
    } else {
        if (guestView) guestView.style.display = 'block';
        if (adminView) adminView.style.display = 'none';
        if (guestWarning) guestWarning.style.display = 'block';
        if (setBox) setBox.style.display = 'none';
    }
}


// ==========================================================
// 3. FUNGSI KHUSUS HALAMAN SETTINGS (TIDAK ADA YANG DIRUBAH)
// ==========================================================

// --- FUNGSI BERSIHKAN CACHE / FORMAT SD CARD JARAK JAUH ---
function clearCache() {
    if(confirm("⚠️ PERINGATAN: Seluruh data log sejarah yang tersimpan di memori SD Card alat akan dihapus permanen. Lanjutkan?")) {
        database.ref('SoilSense/Command/clearLog').set(true)
        .then(() => {
            showToast('success', 'Memori Dibersihkan', 'Perintah format memori telah dikirim ke ESP32.');
        })
        .catch((error) => {
            showToast('error', 'Gagal', 'Sinyal gagal dikirim: ' + error.message);
        });
    }
}

// --- INISIALISASI FIREBASE UNTUK SETTINGS ---
const firebaseConfig = {
    apiKey: "AIzaSyBDqfGHqjAxHWhbPdyzXQgR9W2oZsz4zrQ",
    authDomain: "soilsense-project-fc64f.firebaseapp.com",
    databaseURL: "https://soilsense-project-fc64f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "soilsense-project-fc64f",
    storageBucket: "soilsense-project-fc64f.firebasestorage.app",
    messagingSenderId: "926337999147",
    appId: "1:926337999147:web:275d3ed44c7efd5b01e56e"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- FUNGSI SIMPAN AMBANG BATAS (THRESHOLD) KE FIREBASE ---
function saveThresholds(e) {
    e.preventDefault(); 
    
    const nMin = parseInt(document.getElementById('thresh-n').value);
    const pMin = parseInt(document.getElementById('thresh-p').value);
    const kMin = parseInt(document.getElementById('thresh-k').value); 
    const phMin = parseFloat(document.getElementById('thresh-ph').value);

    // Kirim ke Firebase
    database.ref('SoilSense/Settings/Thresholds').set({
        n_min: nMin,
        p_min: pMin,
        k_min: kMin, 
        ph_min: phMin
    }).then(() => {
        showToast('success', 'Kalibrasi Disimpan', 'Ambang batas berhasil diperbarui.');
    }).catch((error) => {
        showToast('error', 'Gagal', error.message);
    });
}

// --- AMBIL DATA TERAKHIR SAAT HALAMAN SETTINGS DIBUKA ---
database.ref('SoilSense/Settings/Thresholds').on('value', (snapshot) => {
    if(snapshot.exists()) {
        const data = snapshot.val();
        if(document.getElementById('thresh-n')) document.getElementById('thresh-n').value = data.n_min;
        if(document.getElementById('thresh-p')) document.getElementById('thresh-p').value = data.p_min;
        if(document.getElementById('thresh-k')) document.getElementById('thresh-k').value = data.k_min; 
        if(document.getElementById('thresh-ph')) document.getElementById('thresh-ph').value = data.ph_min;
    }
});

// --- FUNGSI REBOOT JARAK JAUH ---
function rebootDevice() {
    if(confirm("⚠️ PERINGATAN: Apakah Anda yakin ingin me-restart ESP32? Alat akan mati sesaat dan koneksi akan terputus sementara.")) {
        database.ref('SoilSense/Command/reboot').set(true)
        .then(() => {
            showToast('success', 'Sinyal Dikirim', 'Mengeksekusi Reboot pada ESP32...');
            
            setTimeout(() => {
                showToast('error', 'Koneksi Terputus', 'Alat sedang restart. Menunggu koneksi ulang...');
            }, 2000);
        })
        .catch((error) => {
            showToast('error', 'Gagal', 'Sinyal gagal dikirim: ' + error.message);
        });
    }
}

// ==========================================
// MAGIC SCRIPT: TELEPORTASI PROFIL DI HP
// ==========================================
window.addEventListener('load', () => {
    // Jika layar seukuran HP atau lebih kecil
    if (window.innerWidth <= 768) {
        const profile = document.querySelector('.sidebar-footer');
        const mainContent = document.querySelector('.main-content');
        
        // Evakuasi profil dari menu bawah ke bagian paling atas halaman utama
        if (profile && mainContent) {
            mainContent.insertBefore(profile, mainContent.firstChild);
        }
    }
});