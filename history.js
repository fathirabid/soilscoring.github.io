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
// 2. KONFIGURASI FIREBASE
// ==========================================================
const firebaseConfig = {
    apiKey: "AIzaSyBDqfGHqjAxHWhbPdyzXQgR9W2oZsz4zrQ",
    authDomain: "soilsense-project-fc64f.firebaseapp.com",
    databaseURL: "https://soilsense-project-fc64f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "soilsense-project-fc64f",
    storageBucket: "soilsense-project-fc64f.firebasestorage.app",
    messagingSenderId: "926337999147",
    appId: "1:926337999147:web:275d3ed44c7efd5b01e56e",
    measurementId: "G-ZRMNVTPZPW"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();


// ==========================================================
// 3. BLOK UNIVERSAL: AUTENTIKASI, MODAL, & TOAST
// ==========================================================
let isLoggedIn = false;
let historyDataArray = [];

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

// C. Fungsi Notifikasi Modal Status (Pop-up Tengah) - INI YANG SEBELUMNYA HILANG!
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

// F. Terapkan Perubahan UI Sidebar & Panel History
function applyAdminState(loginStatus) {
    isLoggedIn = loginStatus;
    const guestView = document.getElementById('guest-view');
    const adminView = document.getElementById('admin-view');
    const guestWarning = document.getElementById('guest-warning');
    
    const histBox = document.getElementById('history-content-box');
    const btnExport = document.getElementById('btn-export');
    const btnClear = document.getElementById('btn-clear');
    
    if (isLoggedIn) {
        if (guestView) guestView.style.display = 'none';
        if (adminView) adminView.style.display = 'block';
        if (guestWarning) guestWarning.style.display = 'none';
        
        if (histBox) histBox.style.display = 'block';
        if (btnExport) btnExport.style.display = 'flex';
        if (btnClear) btnClear.style.display = 'flex';
        
        loadHistoryData(); // Panggil data dari Firebase
    } else {
        if (guestView) guestView.style.display = 'block';
        if (adminView) adminView.style.display = 'none';
        if (guestWarning) guestWarning.style.display = 'block';
        
        if (histBox) histBox.style.display = 'none';
        if (btnExport) btnExport.style.display = 'none';
        if (btnClear) btnClear.style.display = 'none';
        
        const tbody = document.getElementById('history-body');
        if (tbody) tbody.innerHTML = ''; // Kosongkan tabel demi keamanan
    }
}


// ==========================================================
// 4. FUNGSI KHUSUS HALAMAN HISTORY (TIDAK ADA YANG DIRUBAH)
// ==========================================================

function loadHistoryData() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Mengambil data dari server awan...</td></tr>';
    
    database.ref('SoilSense/History').limitToLast(50).on('value', (snapshot) => {
        if (!isLoggedIn) return; 
        
        tbody.innerHTML = ''; 
        historyDataArray = [];

        if (snapshot.exists()) {
            const dataList = [];
            snapshot.forEach((childSnapshot) => { 
                let item = childSnapshot.val();
                item.firebaseKey = childSnapshot.key; 
                dataList.push(item); 
            });
            
            dataList.reverse(); 
            historyDataArray = dataList;

            dataList.forEach((data) => {
                let badgeClass = "badge-crit";
                if (data.score > 80) badgeClass = "badge-good";
                else if (data.score > 50) badgeClass = "badge-warn";

                const tr = document.createElement('tr');
                let timestamp = parseInt(data.lastUpdate);
                if (timestamp > 1000000000) timestamp = timestamp * 1000; 
                
                const dateObj = new Date(timestamp);
                const timeString = dateObj.toLocaleDateString('id-ID') + " - " + dateObj.toLocaleTimeString('id-ID');

                tr.innerHTML = `
                    <td>${timeString}</td>
                    <td><strong>${data.score} / 100</strong></td>
                    <td>${data.ph}</td>
                    <td>${data.nitrogen}</td>
                    <td>${data.fosfor}</td>
                    <td>${data.kalium}</td>
                    <td>${data.hum}%</td>
                    <td><span class="badge-status ${badgeClass}">${data.status}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Belum ada riwayat. Biarkan alat menyala beberapa menit untuk menyimpan log pertama.</td></tr>';
        }
    });
}

function exportHistoryCSV() {
    if(historyDataArray.length === 0) return alert("Belum ada data untuk diunduh!");
    let csvContent = "data:text/csv;charset=utf-8,Waktu,Skor AI,pH,Nitrogen,Fosfor,Kalium,Suhu,Kelembapan,Status\n";
    historyDataArray.forEach(data => {
        let timestamp = parseInt(data.lastUpdate);
        if (timestamp > 1000000000) timestamp = timestamp * 1000; 
        const timeStr = new Date(timestamp).toLocaleString('id-ID').replace(/,/g, '');
        csvContent += [timeStr, data.score, data.ph, data.nitrogen, data.fosfor, data.kalium, data.temp, data.hum, data.status].join(",") + "\n";
    });
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `SoilSense_Full_History_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function clearTodayLogs() { 
    if(historyDataArray.length === 0) {
        showToast('error', 'Gagal', 'Tidak ada data untuk dihapus.');
        return;
    }
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.style.display = 'none';
}

function executeClearLogs(mode) {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.style.display = 'none'; 
    
    if (mode === 'all') {
        let totalLogs = historyDataArray.length;
        if(confirm(`🚨 PERINGATAN KRITIS: Anda akan menghancurkan SELURUH database riwayat (${totalLogs}+ baris). Anda tidak dapat membatalkan ini.\n\nYakin untuk me-reset total?`)) {
            database.ref('SoilSense/History').remove()
                .then(() => { showToast('success', 'Reset Total Berhasil', 'Seluruh data riwayat telah dihapus dari server awan.'); })
                .catch((error) => { showToast('error', 'Gagal', 'Terjadi kesalahan sistem.'); });
        }
    } else if (mode === 'today') {
        const todayStr = new Date().toLocaleDateString('id-ID');
        let keysToDelete = [];

        historyDataArray.forEach(data => {
            let timestamp = parseInt(data.lastUpdate);
            if (timestamp > 1000000000) timestamp = timestamp * 1000;
            const dateObj = new Date(timestamp);
            
            if(dateObj.toLocaleDateString('id-ID') === todayStr) {
                keysToDelete.push(data.firebaseKey);
            }
        });

        if(keysToDelete.length === 0) {
            showToast('error', 'Info', 'Tidak ada rekaman log baru pada hari ini.');
            return;
        }

        keysToDelete.forEach(key => { database.ref('SoilSense/History/' + key).remove(); });
        showToast('success', 'Pembersihan Harian', `${keysToDelete.length} data log hari ini telah dihapus permanen.`);
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