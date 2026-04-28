// Initialize Icons
        feather.replace();

        // Real-time Clock & Date
        function updateTime() {
            const now = new Date();
            const clockEl = document.getElementById('clock');
            const dateEl = document.getElementById('date');

            clockEl.innerText = now.toLocaleTimeString('id-ID', { hour12: false });
            dateEl.innerText = now.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
        setInterval(updateTime, 1000);
        updateTime();

        // Buka & Tutup Modal
        function showLogin() {
            document.getElementById('loginModal').style.display = 'flex';
        }
        function closeLogin() {
            document.getElementById('loginModal').style.display = 'none';
        }

        // LOGIKA LOGIN DENGAN MODAL STATUS
        function showStatusModal(type, title, message) {
        const modal = document.getElementById('statusModal');
        const icon = document.getElementById('statusIcon');
        const titleEl = document.getElementById('statusTitle');
        const msgEl = document.getElementById('statusMessage');
        const box = modal.querySelector('.status-box');

        // Atur Tema
        if(type === 'success') {
            icon.innerText = "✅";
            box.className = "modal-content status-box success-theme";
        } else {
            icon.innerText = "❌";
            box.className = "modal-content status-box error-theme";
        }

        titleEl.innerText = title;
        msgEl.innerText = message;
        
        // Tampilkan Modal & Jalankan Loader
        modal.style.display = 'flex';
        modal.classList.add('show-loader');

        // Tutup otomatis setelah 2 detik
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('show-loader');
        }, 2000);
    }

    // Fungsi Verifikasi Login (Update dari kode sebelumnya)
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const user = document.getElementById('loginUser').value;
            const pass = document.getElementById('loginPass').value;

            if(user === "admin" && pass === "pkm2026") {
                isLoggedIn = true; // AKTIFKAN AKSES

                // TAMBAHKAN BARIS INI UNTUK MENYIMPAN SESI KE BROWSER 
                 localStorage.setItem("adminLoggedIn", "true");

                showStatusModal('success', 'Akses Diterima', 'Menghubungkan ke sensor...');
                showToast('success', 'Berhasil Masuk!', 'Selamat datang, data lahan siap dikelola.');
                
                setTimeout(() => {
                    document.getElementById('guest-view').style.display = 'none';
                    document.getElementById('admin-view').style.display = 'block';
                    closeLogin();
                    
                    // MULAI SCAN SENSOR SETELAH LOGIN
                    startSensorMonitoring(); 
                }, 1000);
            } else {        
                // --- UBAH BAGIAN INI JUGA ---
                showStatusModal('error', 'Akses Ditolak', 'Username atau password salah.');
                showToast('error', 'Gagal masuk!', 'Username atau password salah.');
            }
        });

        // Proses Logout
        // LOGIKA LOGOUT DENGAN KONFIRMASI
        function handleLogout() {
            if(confirm("Apakah Anda ingin keluar sistem?")) {
                document.getElementById('guest-view').style.display = 'block';
                document.getElementById('admin-view').style.display = 'none';
            }
        }

        document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('loginPass');
        const eyeIcon = this.querySelector('i');

        // Cek tipe input saat ini
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            // Ganti ikon ke mata terbuka/tertutup (tergantung versi Feather)
            this.innerHTML = feather.icons['eye-off'].toSvg();
        } else {
            passwordInput.type = 'password';
            this.innerHTML = feather.icons['eye'].toSvg();
        }
        
        // Render ulang ikon feather setelah diganti via JS
        feather.replace();
        });

        // Fungsi untuk menampilkan Toast
        function showToast(status, title, msg) {
            const toast = document.getElementById('toast');
            const toastTitle = document.getElementById('toast-title');
            const toastMsg = document.getElementById('toast-msg');
            
            // Reset class
            toast.className = "toast-container";
            toast.classList.add(status === 'success' ? 'toast-success' : 'toast-error');
            
            toastTitle.innerText = title;
            toastMsg.innerText = msg;
            
            // Tampilkan
            toast.classList.add('show');
            
            // Hilangkan setelah 3 detik
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // --- FUNGSI MODAL LOGOUT ---

        // Munculkan Modal Logout
        function handleLogout() {
            document.getElementById('logoutModal').style.display = 'flex';
        }

        // Tutup Modal Logout
        function closeLogoutModal() {
            document.getElementById('logoutModal').style.display = 'none';
        }

        // Eksekusi Keluar
        function confirmLogout() {
            // 1. Tampilkan Toast Berhasil Keluar
            showToast('success', 'Logout Berhasil', 'Sesi admin telah diakhiri.');

            // 2. Beri jeda sedikit agar animasi toast terlihat
            setTimeout(() => {
                // Balikkan UI ke Guest View
                document.getElementById('guest-view').style.display = 'block';
                document.getElementById('admin-view').style.display = 'none';
                
                // Tutup Modal
                closeLogoutModal();
            }, 800);
        }

        // Grafik Multi Sensor
        const ctx = document.getElementById('multiSensorChart').getContext('2d');

        // Data awal (Kosong)
        let labels = [];
        let datasetValues = {
            n: [], p: [], k: [], ph: [], temp: [], hum: [], ec: []
        };

        const multiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Nitrogen (N)', data: datasetValues.n, borderColor: '#2ecc71', backgroundColor: '#2ecc71', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                    { label: 'Fosfor (P)', data: datasetValues.p, borderColor: '#e67e22', backgroundColor: '#e67e22', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                    { label: 'Kalium (K)', data: datasetValues.k, borderColor: '#3498db', backgroundColor: '#3498db', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                    { label: 'pH Tanah', data: datasetValues.ph, borderColor: '#f1c40f', backgroundColor: '#f1c40f', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                    { label: 'Suhu (°C)', data: datasetValues.temp, borderColor: '#e74c3c', backgroundColor: '#e74c3c', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                    { label: 'Kelembapan (%)', data: datasetValues.hum, borderColor: '#9b59b6', backgroundColor: '#9b59b6', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                    { label: 'EC (uS/cm)', data: datasetValues.ec, borderColor: '#34495e', backgroundColor: '#34495e', tension: 0.3, borderWidth: 2, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                
                animation: {
                    x: {
                        duration: 1000,     // Samakan persis dengan delay ESP32 (500ms)
                        easing: 'linear'   // Membuat pergeseran ke kiri stabil tanpa rem
                    },
                    y: { 
                        duration: 0        // Tetap matikan animasi vertikal agar tidak nyungsep
                    }
                },

                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { 
                        beginAtZero: false, 
                        grace: '5%',
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 20, font: { size: 11 } }
                    }
                }
            }
        });

        // FUNGSI EKSPOR CSV
        function downloadCSV() {
        // 1. Siapkan Header CSV
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Waktu,Nitrogen(N),Fosfor(P),Kalium(K),pH,Suhu,Kelembapan,EC\n";

        // 2. Gabungkan data dari array datasetValues yang sudah ada
        labels.forEach((label, index) => {
            let row = [
                label,
                datasetValues.n[index],
                datasetValues.p[index],
                datasetValues.k[index],
                datasetValues.ph[index],
                datasetValues.temp[index],
                datasetValues.hum[index],
                datasetValues.ec[index]
            ].join(",");
            csvContent += row + "\n";
        });

        // 3. Proses Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        
        // Nama file berdasarkan tanggal saat ini
        const fileName = `SoilSense_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
        link.setAttribute("download", fileName);
        
        document.body.appendChild(link);
        link.click(); // Trigger klik otomatis
        document.body.removeChild(link); // Hapus elemen temporary

        // Berikan notifikasi sukses (menggunakan Toast yang sudah kita buat sebelumnya)
        showToast('success', 'Berhasil!', 'Laporan CSV telah diunduh.');
    }

    // Status Login (Default: false)
    let isLoggedIn = false;
    let dataInterval; // Untuk menampung interval pengecekan sensor

    // Hubungkan web ke esp32 melalui Firebase Realtime Database
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

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Variabel untuk melacak kapan data terakhir masuk
    let lastDataTime = 0; 
    let connectionInterval; 
    let wasOnline = true; 

    // --- VARIABEL AMBANG BATAS (THRESHOLD) DEFAULT ---
    let batasNitrogen = 50;
    let batasFosfor = 20;
    let batasKalium = 100;
    let batasPH = 5.5;

    // --- TARIK ATURAN DARI FIREBASE SECARA REAL-TIME ---
    database.ref('SoilSense/Settings/Thresholds').on('value', (snapshot) => {
        if(snapshot.exists()) {
            const rules = snapshot.val();
            if(rules.n_min !== undefined) batasNitrogen = rules.n_min;
            if(rules.p_min !== undefined) batasFosfor = rules.p_min;
            if(rules.k_min !== undefined) batasKalium = rules.k_min;
            if(rules.ph_min !== undefined) batasPH = rules.ph_min;
        }
    });

    // --- TAMBAHAN BARU: DATABASE KEBUTUHAN IDEAL TANAMAN ---
    let currentSensorData = { n: 0, p: 0, k: 0, ph: 0 };
    
    // --- HELPER MESIN KONVERSI DOSIS LUAS LAHAN ---
    function hitungDosisAktual(dosisPerHa) {
        let inputLuas = document.getElementById('luas-lahan');
        // Jika kosong atau minus, paksa pakai 1 Hektar (10.000 m2) agar tidak error
        let luasM2 = (inputLuas && inputLuas.value && inputLuas.value > 0) ? parseFloat(inputLuas.value) : 10000; 
        
        let totalKg = (dosisPerHa / 10000) * luasM2;
        
        if (totalKg < 1) {
            let totalGram = Math.round(totalKg * 1000);
            return `${totalGram} Gram`; // Jika di bawah 1 kg, ubah jadi Gram
        } else {
            return `${totalKg % 1 === 0 ? totalKg : totalKg.toFixed(1)} Kg`; // Jika di atas 1 kg
        }
    }
    
    // --- DATABASE KEBUTUHAN IDEAL TANAMAN ---
    const plantDatabase = {
        cabai: { nama: "Cabai Merah", n: 120, p: 50, k: 150, phMin: 6.0, phMax: 7.0 },
        tomat: { nama: "Tomat", n: 100, p: 60, k: 180, phMin: 5.5, phMax: 7.0 },
        bawang: { nama: "Bawang Merah", n: 80, p: 40, k: 100, phMin: 6.0, phMax: 6.8 },
        padi: { nama: "Padi Sawah", n: 90, p: 30, k: 70, phMin: 5.5, phMax: 6.5 },
        jagung: { nama: "Jagung Manis", n: 130, p: 45, k: 110, phMin: 5.8, phMax: 7.0 },
        singkong: { nama: "Singkong", n: 50, p: 20, k: 80, phMin: 4.5, phMax: 7.5 },

        // --- KOMODITAS BARU (SAYURAN DAUN) ---
        Bayam: { nama: "Bayam", n: 120, p: 40, k: 130, phMin: 6.0, phMax: 7.0, humMin: 65, humMax: 85 },
        kangkung: { nama: "Kangkung", n: 100, p: 30, k: 100, phMin: 5.5, phMax: 7.0, humMin: 70, humMax: 95 }, // Sangat toleran air
        sawi: { nama: "Sawi (Caisim)", n: 130, p: 45, k: 120, phMin: 6.0, phMax: 7.0, humMin: 60, humMax: 80 },
        selada: { nama: "Selada", n: 110, p: 40, k: 140, phMin: 6.0, phMax: 7.0, humMin: 65, humMax: 80 }, // Rentan layu jika kering
        kubis: { nama: "Kubis", n: 150, p: 60, k: 180, phMin: 6.0, phMax: 7.5, humMin: 60, humMax: 85 } // Butuh K tinggi untuk krop (kepala kubis)
    };

    // FUNGSI ANALISIS SPESIFIK KOMODITAS - PREMIUM RENDERING 
    function analyzeSpecificPlant() {
        const selected = document.getElementById('target-plant').value;
        const resultBox = document.getElementById('plant-specific-result');
        if(!resultBox) return;

        // JIKA GUEST VIEW ATAU SENSOR BELUM AKTIF
        if (!isLoggedIn || currentSensorData.n === 0) {
            resultBox.className = 'cae-result cae-empty-stateGuest';
            resultBox.innerHTML = `
                <i data-feather="lock"></i>
                <span>Fitur Analisis Pakar hanya tersedia untuk Admin. Silakan Login.</span>
            `;
            feather.replace();
            return;
        }

        // JIKA PILIH "UMUM" (DEFAULT)
        if (selected === "umum") {
            resultBox.className = 'cae-result cae-empty-state';
            resultBox.innerHTML = `
                <i data-feather="info"></i>
                <span>Pilih komoditas di atas untuk melihat kecocokan tanah secara real-time.</span>
            `;
            feather.replace();
            return;
        }

        const plant = plantDatabase[selected];
        const land = currentSensorData;
        
        let lacksCount = 0;
        let issuesFound = [];
        let actionInstructions = []; 

        // --- CEK pH ---
        if (land.ph < plant.phMin) {
            let gapPH = (plant.phMin - land.ph).toFixed(1);
            let dosisHa = gapPH * 2000; 
            issuesFound.push(`Asiditas Lahan Tinggi (pH ${land.ph})`);
            actionInstructions.push(`Ameliorasi Tanah: Aplikasikan Kapur Dolomit ±${hitungDosisAktual(dosisHa)} untuk menaikkan ${gapPH} poin pH.`);
            lacksCount++;
        } else if (land.ph > plant.phMax) {
            let gapPH = (land.ph - plant.phMax).toFixed(1);
            issuesFound.push(`Alkalinitas Lahan Tinggi (pH ${land.ph})`);
            actionInstructions.push(`Ameliorasi Tanah: Aplikasikan Sulfur pertanian untuk menurunkan ${gapPH} poin pH.`);
            lacksCount++;
        }

        // --- CEK KELEMBAPAN (HUMIDITY) ---
        if (currentSensorData.hum < plant.humMin) {
            issuesFound.push(`Kelembapan Rendah (${currentSensorData.hum}%) - Risiko Layu`);
            actionInstructions.push(`Manajemen Irigasi: Segera lakukan penyiraman/pengairan hingga kelembapan mencapai minimal ${plant.humMin}%.`);
            lacksCount++;
        } else if (currentSensorData.hum > plant.humMax) {
            issuesFound.push(`Kelembapan Terlalu Tinggi (${currentSensorData.hum}%) - Risiko Jamur`);
            actionInstructions.push(`Manajemen Drainase: Perbaiki saluran air/parit untuk membuang genangan dan menurunkan kelembapan.`);
            lacksCount++;
        }

        // --- CEK NPK ---
        if (land.n < plant.n) {
            let defisit = plant.n - land.n;
            let dosisHa = (defisit * 2) / 0.46; 
            issuesFound.push(`Defisit Nitrogen (${defisit} mg/kg)`);
            actionInstructions.push(`Pemupukan Presisi (N): Aplikasikan pupuk Urea sebanyak ±${hitungDosisAktual(dosisHa)}.`);
            lacksCount++;
        }
        if (land.p < plant.p) {
            let defisit = plant.p - land.p;
            let dosisHa = (defisit * 2) / 0.36; 
            issuesFound.push(`Defisit Fosfor (${defisit} mg/kg)`);
            actionInstructions.push(`Pemupukan Presisi (P): Aplikasikan pupuk SP-36 sebanyak ±${hitungDosisAktual(dosisHa)}.`);
            lacksCount++;
        }
        if (land.k < plant.k) {
            let defisit = plant.k - land.k;
            let dosisHa = (defisit * 2) / 0.60; 
            issuesFound.push(`Defisit Kalium (${defisit} mg/kg)`);
            actionInstructions.push(`Pemupukan Presisi (K): Aplikasikan pupuk KCl sebanyak ±${hitungDosisAktual(dosisHa)}.`);
            lacksCount++;
        }

        // KASUS SUKSES: Tanah 100% Cocok
        if (lacksCount === 0) {
            resultBox.className = 'cae-result cae-success-state';
            resultBox.innerHTML = `
                <div class="cae-r-title"><i data-feather="check-circle"></i> Lahan Siap Tanam!</div>
                <div class="cae-r-desc">Kondisi unsur hara dan pH saat ini sudah memenuhi kebutuhan ideal untuk <strong>${plant.nama}</strong>. Anda bisa langsung melakukan penanaman.</div>
            `;
        } 

        // KASUS PERINGATAN: Tanah Perlu Tindakan
        else {
            resultBox.className = 'cae-result cae-warning-state';
            resultBox.innerHTML = `
                <div class="cae-r-title"><i data-feather="alert-triangle"></i> Tanah Belum Siap untuk ${plant.nama}!</div>
                
                <div class="cae-issues-found">
                    <div class="cae-issues-title">Ditemukan Kekurangan:</div>
                    <div class="cae-issues-list">
                        ${issuesFound.map(item => `<div class="cae-issue-item"><i data-feather="x"></i> ${item}</div>`).join("")}
                    </div>
                </div>

                <div class="cae-expert-plan">
                    <div class="cae-plan-title"><i data-feather="tool"></i> Langkah Perbaikan (Urutan Prioritas):</div>
                    <ul class="cae-plan-steps">
                        ${actionInstructions.map((step, index) => `<li>Langkah ${index + 1}: ${step}</li>`).join("")}
                    </ul>
                </div>
            `;
        }
        
        feather.replace(); 
    }

    // Fungsi untuk mulai memindai data (Simulasi Firebase)
    function startSensorMonitoring() {
        if(!isLoggedIn) return;

        // --- TAMBAHAN BARU: MASA TENGGANG 5 DETIK AWAL ---
        const WAKTU_MULAI_PANTAU = Date.now();
        let statusAwalDiumumkan = false; 

        // 1. WATCHDOG TIMER (Memantau koneksi tiap 1 detik)
        connectionInterval = setInterval(() => {
            const sekarang = Date.now();
            
            // CEK: Apakah sudah lewat 5 detik dari awal buka web? ATAU alat mati > 5 detik?
            if (sekarang - WAKTU_MULAI_PANTAU > 5000 && sekarang - lastDataTime > 10000) {
                // Tembakkan fungsi Offline & Toast hanya 1 kali
                if (wasOnline || !statusAwalDiumumkan) {
                    resetDataToZero();
                    showToast('error', 'Koneksi Terputus!', 'Sensor tidak terdeteksi. Sistem offline.');
                    wasOnline = false;
                    statusAwalDiumumkan = true; // Tandai agar toast offline tidak nyepam
                }
            }
        }, 1000);

        // 2. MENDENGARKAN DATA DARI FIREBASE
        database.ref('SoilSense/SensorData').on('value', (snapshot) => {
            const data = snapshot.val();
            if(data && isLoggedIn) {

                // --- 1. PERBAIKAN GERBANG WAKTU (ANTI JAM MINUS) ---
                let waktuData = 0;
                if (data.lastUpdate) {
                    waktuData = parseInt(data.lastUpdate);
                    if (waktuData > 0 && waktuData < 2000000000) waktuData = waktuData * 1000; 
                }

                const waktuSekarang = Date.now();
                // KUNCI: Gunakan Math.abs() agar selisih waktu tidak pernah minus!
                const selisihWaktu = Math.abs(waktuSekarang - waktuData);

                // JIKA DATA LEBIH TUA DARI 10 DETIK
                if (selisihWaktu > 15000 || isNaN(waktuData) || waktuData === 0) {
                    return; // BLOKIR DATA HANTU SECARA SILENT! Layar tetap abu-abu "Menunggu..."
                }
                
                lastDataTime = Date.now(); 
                statusAwalDiumumkan = true;

                if (!wasOnline) {
                    showToast('success', 'ESP32 Terhubung!', 'Menerima transmisi data...');
                    wasOnline = true;
                }

                // Update teks di pojok kanan atas jadi Online
                const textEl = document.getElementById('connection-text');
                const dotEl = document.getElementById('connection-dot');
                if(textEl) { textEl.innerText = "ESP32 Online"; textEl.style.color = "#2ecc71"; }
                if(dotEl) dotEl.className = "dot pulse";

                // --- 2. PERBAIKAN KONFLIK CSS BACKGROUND ---
                const heroBanner = document.querySelector('.hero-score');
                if (heroBanner) {
                    if (data.score > 80) heroBanner.style.background = "#2ecc71"; // Hijau Subur
                    else if (data.score > 50) heroBanner.style.background = "#f39c12"; // Oranye Sedang
                    else heroBanner.style.background = "#e74c3c"; // Merah Kritis
                }

                // Update Angka pH
                const phVal = document.getElementById('val-ph');
                const phLabel = document.getElementById('ph-status-label');
                phVal.innerText = data.ph;
                phLabel.innerText = data.ph_status;

                if(data.ph_status === "ASAM") { phLabel.style.background = "#ffecec"; phLabel.style.color = "#e74c3c"; } 
                else if(data.ph_status === "NETRAL") { phLabel.style.background = "#eefdf3"; phLabel.style.color = "#27ae60"; } 
                else { phLabel.style.background = "#e8f4fd"; phLabel.style.color = "#3498db"; }

                document.getElementById('web-score-val').textContent = data.score;
                document.getElementById('web-score-label').textContent = data.score > 80 ? "Sangat Baik" : (data.score > 50 ? "Cukup" : "Kurang");
                document.getElementById('web-status-title').innerText = data.status;
                document.getElementById('web-status-desc').innerText = data.desc;

                const circle = document.getElementById('score-progress');
                if(circle) {
                    circle.setAttribute('stroke-dasharray', `${data.score}, 100`);
                    circle.style.stroke = "white"; 
                    circle.style.transition = "stroke-dasharray 1s ease-out, stroke 0.5s ease-in";
                }

                document.getElementById('val-n').innerText = data.nitrogen;
                document.getElementById('val-p').innerText = data.fosfor;
                document.getElementById('val-k').innerText = data.kalium;
                document.getElementById('val-temp').innerText = data.temp;
                document.getElementById('val-hum').innerText = data.hum;
                document.getElementById('val-ec').innerText = data.ec;

                // --- UPDATE VARIABEL GLOBAL UNTUK FITUR KOMODITAS BARU ---
                currentSensorData.n = data.nitrogen;
                currentSensorData.p = data.fosfor;
                currentSensorData.k = data.kalium;
                currentSensorData.ph = data.ph;
                currentSensorData.hum = data.kelembapan;
                
                if(document.getElementById('target-plant')) analyzeSpecificPlant();

                // --- KALKULASI STATUS NPK (RENDAH / NORMAL / TINGGI) ---
                const maksNitrogen = batasNitrogen + 100; 
                const maksFosfor = batasFosfor + 50;
                const maksKalium = batasKalium + 100;

                let statusN = data.nitrogen < batasNitrogen ? "RENDAH" : (data.nitrogen > maksNitrogen ? "TINGGI" : "NORMAL");
                let statusP = data.fosfor < batasFosfor ? "RENDAH" : (data.fosfor > maksFosfor ? "TINGGI" : "NORMAL");
                let statusK = data.kalium < batasKalium ? "RENDAH" : (data.kalium > maksKalium ? "TINGGI" : "NORMAL");

                updateNutrientLabel('n-status-label', statusN);
                updateNutrientLabel('p-status-label', statusP);
                updateNutrientLabel('k-status-label', statusK);

                const nFill = document.querySelector('.n-fill');
                const pFill = document.querySelector('.p-fill');
                const kFill = document.querySelector('.k-fill');

                if(nFill) nFill.style.width = Math.min((data.nitrogen / 200) * 100, 100) + "%";
                if(pFill) pFill.style.width = Math.min((data.fosfor / 100) * 100, 100) + "%";
                if(kFill) kFill.style.width = Math.min((data.kalium / 250) * 100, 100) + "%";

                // --- GRAFIK MULTI SENSOR ---
                const timeLabel = new Date().toLocaleTimeString('id-ID', {hour12: false});
                if (labels.length > 60) { labels.shift(); Object.values(datasetValues).forEach(arr => arr.shift()); }
                labels.push(timeLabel);
                datasetValues.n.push(data.nitrogen); datasetValues.p.push(data.fosfor); datasetValues.k.push(data.kalium);
                datasetValues.ph.push(data.ph); datasetValues.temp.push(data.temp); datasetValues.hum.push(data.hum); datasetValues.ec.push(data.ec);
                multiChart.update();

                // --- DATABASE KEBUTUHAN KOMODITAS ---
                // masih pakai data dummy
                const cropDatabase = [
                    { name: "Padi Sawah", phMin: 5.5, phMax: 6.5, n: 45, p: 20, k: 30 },
                    { name: "Bawang Merah", phMin: 5.6, phMax: 7.0, n: 80, p: 40, k: 40 },
                    { name: "Cabai Merah", phMin: 6.0, phMax: 7.0, n: 100, p: 50, k: 50 },
                    { name: "Jagung Manis", phMin: 5.8, phMax: 7.0, n: 60, p: 30, k: 40 },
                    { name: "Singkong (Tangguh)", phMin: 4.5, phMax: 8.0, n: 30, p: 10, k: 20 }
                ];

                // --- REKOMENDASI AI CERDAS BERBASIS PARAMETER SPESIFIK ---
                let generalStatus = "";
                
                // 1. Kesimpulan Skor Umum (Tetap dipertahankan untuk status lahan)
                if (data.score > 80) generalStatus = "Kondisi <strong>lahan secara umum sangat subur.</strong>";
                else if (data.score > 50) generalStatus = "Kondisi <strong>lahan secara umum cukup baik.</strong>";
                else generalStatus = "Kondisi <strong>lahan secara umum kritis/kurang nutrisi.</strong>";

                let highlyRecommended = [];
                let conditionalRecommended = [];

                // 2. Mesin AI Mengevaluasi Kecocokan Setiap Tanaman
                cropDatabase.forEach(crop => {
                    // Cek apakah data sensor saat ini memenuhi syarat tanaman
                    let isPhOk = (data.ph >= crop.phMin && data.ph <= crop.phMax);
                    let isNOk = (data.nitrogen >= crop.n);
                    let isPOk = (data.fosfor >= crop.p);
                    let isKOk = (data.kalium >= crop.k);

                    if (isPhOk && isNOk && isPOk && isKOk) {
                        // Jika pH dan SEMUA NPK memenuhi syarat -> Sangat Direkomendasikan
                        highlyRecommended.push(crop.name);
                    } else if (isPhOk && (data.nitrogen >= crop.n * 0.6)) {
                        // Jika pH cocok, tapi NPK agak kurang sedikit -> Bisa ditanam tapi butuh pupuk
                        conditionalRecommended.push(crop.name);
                    }
                });

                // 3. Merakit Teks Output untuk Dashboard
                let commodityText = `${generalStatus}<br><br>`;

                if (highlyRecommended.length > 0) {
                    commodityText += `🌱 <strong>Sangat Cocok:</strong> ${highlyRecommended.join(", ")}.<br>`;
                }

                if (conditionalRecommended.length > 0) {
                    commodityText += `⚠️ <strong>Bisa Ditanam (Perlu Pupuk):</strong> ${conditionalRecommended.join(", ")}.<br>`;
                }

                if (highlyRecommended.length === 0 && conditionalRecommended.length === 0) {
                    commodityText += `🚨 <strong>Belum ada yang cocok:</strong> Perbaiki pH atau unsur hara lahan Anda terlebih dahulu berdasarkan rekomendasi sistem.`;
                }

                let soilActions = [];  // KHUSUS untuk penanganan pH (Pembenah Tanah)
                let waterActions = []; // KHUSUS untuk instruksi air
                let fertActions = [];  // KHUSUS untuk daftar pupuk NPK
                let warnings = [];
                let excesses = []; 

                // 1. Kalkulasi pH (PEMBENAH TANAH)
                if (data.ph < batasPH) { 
                    let gapPH = (batasPH - data.ph).toFixed(1);
                    let dosisHa = gapPH * 2000; 
                    soilActions.push(`Kapur Dolomit (±${hitungDosisAktual(dosisHa)})`); 
                    warnings.push(`Asiditas Lahan Tinggi / Sangat Asam (pH ${data.ph})`); 
                } else if (data.ph > batasPH + 1.5) { 
                    soilActions.push(`Taburkan Belerang (Sulfur) / Pupuk Kandang`);
                    warnings.push(`Lahan Terlalu Basa (pH ${data.ph})`);
                }

                // 2. Kalkulasi Kelembapan (MANAJEMEN AIR)
                if (data.hum < 40) { 
                    waterActions.push(`Segera nyalakan pompa irigasi / lakukan penyiraman lahan.`); 
                    warnings.push(`Kekeringan / Kelembapan Rendah (${data.hum}%)`); 
                } else if (data.hum > 80) { 
                    excesses.push(`Genangan / Kelembapan Tinggi (${data.hum}%)`);
                }

                // 3. Kalkulasi Nitrogen (PUPUK)
                if (data.nitrogen < batasNitrogen) { 
                    let defisitN = batasNitrogen - data.nitrogen;
                    let dosisHa = (defisitN * 2) / 0.46;
                    fertActions.push(`Urea (±${hitungDosisAktual(dosisHa)})`); 
                    warnings.push(`Defisit Nitrogen (-${defisitN} mg/kg)`); 
                } else if (data.nitrogen > maksNitrogen) {
                    excesses.push(`Nitrogen Berlebih`);
                }

                // 4. Kalkulasi Fosfor (PUPUK)
                if (data.fosfor < batasFosfor) { 
                    let defisitP = batasFosfor - data.fosfor;
                    let dosisHa = (defisitP * 2) / 0.36;
                    fertActions.push(`SP-36 (±${hitungDosisAktual(dosisHa)})`); 
                    warnings.push(`Defisit Fosfor (-${defisitP} mg/kg)`); 
                } else if (data.fosfor > maksFosfor) {
                    excesses.push(`Fosfor Berlebih`);
                }

                // 5. Kalkulasi Kalium (PUPUK)
                if (data.kalium < batasKalium) { 
                    let defisitK = batasKalium - data.kalium;
                    let dosisHa = (defisitK * 2) / 0.60;
                    fertActions.push(`KCl (±${hitungDosisAktual(dosisHa)})`); 
                    warnings.push(`Defisit Kalium (-${defisitK} mg/kg)`); 
                } else if (data.kalium > maksKalium) {
                    excesses.push(`Kalium Berlebih`);
                }

                const analysisList = document.getElementById('ai-analysis-list');
                const recomText = document.getElementById('ai-recom-text');
                if (analysisList) analysisList.className = 'ai-list'; 

                // SKENARIO 1: TERDAPAT KEKURANGAN ATAU MASALAH pH / AIR
                if (soilActions.length > 0 || fertActions.length > 0 || waterActions.length > 0) { 
                    
                    let finalRecomHTML = "";
                    
                    // Tampilkan Pembenah Tanah (pH) jika ada masalah
                    if (soilActions.length > 0) {
                        finalRecomHTML += `<div style="margin-bottom:15px;">🪨 <strong style="color:#94a3b8;">Pembenah Tanah (Koreksi pH):</strong><br> <span style="color:#d97706; font-weight:600;">${soilActions.join("<br>")}</span></div>`;
                    }
                    // Tampilkan Manajemen Air jika ada masalah
                    if (waterActions.length > 0) {
                        finalRecomHTML += `<div style="margin-bottom:15px;">💧 <strong style="color:#94a3b8;">Manajemen Air:</strong><br> <span style="color:#38bdf8; font-weight:600;">${waterActions.join("<br>")}</span></div>`;
                    }
                    // Tampilkan Kebutuhan Pupuk jika ada masalah
                    if (fertActions.length > 0) {
                        finalRecomHTML += `<div>🌱 <strong style="color:#94a3b8;">Kebutuhan Pupuk Dasar:</strong><br> <span class="highlight" style="display:inline-block; line-height:1.8; margin-top:8px;">+ ${fertActions.join("<br> + ")}</span></div>`;
                    }

                    analysisList.innerHTML = `
                        <li><div class="ai-icon-wrap" style="background: rgba(46,204,113,0.1); color: #2ecc71;"><i data-feather="target"></i></div><div class="ai-text"><strong>Rekomendasi Tanam:</strong><br> ${commodityText}</div></li>
                        <li><div class="ai-icon-wrap" style="background: rgba(231,76,60,0.1); color: #e74c3c;"><i data-feather="alert-triangle"></i></div><div class="ai-text"><strong>Terdeteksi Masalah:</strong><br> Lahan mengalami <strong>${warnings.join(", ")}</strong>.</div></li>
                    `;
                    recomText.innerHTML = `
                        <div class="recom-content">
                            <span class="recom-title"><i data-feather="zap"></i> Tindakan Korektif Prioritas</span>
                            <div class="recom-value" style="font-size:14.5px;">${finalRecomHTML}</div>
                        </div>
                    `;
                } 
                // SKENARIO 2: TIDAK ADA KEKURANGAN, TAPI ADA KONDISI TOKSISITAS / KEBANJIRAN
                else if (excesses.length > 0) {
                    analysisList.innerHTML = `
                        <li><div class="ai-icon-wrap" style="background: rgba(46,204,113,0.1); color: #2ecc71;"><i data-feather="target"></i></div><div class="ai-text"><strong>Rekomendasi Tanam:</strong><br> ${commodityText}</div></li>
                        <li><div class="ai-icon-wrap" style="background: rgba(243,156,18,0.1); color: #f39c12;"><i data-feather="alert-octagon"></i></div><div class="ai-text"><strong>Kondisi Kritis (Berlebih):</strong><br> Lahan kelebihan unsur/kondisi pada <strong>${excesses.join(", ")}</strong>.</div></li>
                    `;
                    recomText.innerHTML = `
                        <div class="recom-content" style="border-left-color: #f39c12;">
                            <span class="recom-title" style="color: #f39c12;"><i data-feather="alert-triangle"></i> Peringatan Kondisi Berlebih</span>
                            <div class="recom-value">Lahan mengalami kondisi berlebih pada: <strong style="color:#f1c40f;">${excesses.join(", ")}</strong>.<br><br>Hentikan pemupukan dan perbaiki tata air (drainase/leaching) untuk mencegah keracunan/pembusukan akar.</div>
                        </div>
                    `;
                } 
                // SKENARIO 3: SEMUANYA OPTIMAL (SEMPURNA)
                else {
                    analysisList.innerHTML = `
                        <li><div class="ai-icon-wrap" style="background: rgba(46,204,113,0.1); color: #2ecc71;"><i data-feather="check-circle"></i></div><div class="ai-text"><strong>Komoditas Optimal:</strong><br> ${commodityText}</div></li>
                        <li><div class="ai-icon-wrap" style="background: rgba(52,152,219,0.1); color: #3498db;"><i data-feather="thumbs-up"></i></div><div class="ai-text"><strong>Kondisi Hara:</strong><br> Keseimbangan unsur hara utama (NPK & pH) sangat terjaga.</div></li>
                    `;
                    recomText.innerHTML = `
                        <div class="recom-content" style="border-left-color: #2ecc71;">
                            <span class="recom-title" style="color: #2ecc71;"><i data-feather="shield"></i> Lahan Optimal</span>
                            <div class="recom-value">Kondisi pH, Kelembapan, dan unsur hara berada pada rentang ideal.<br><br><strong style="color:#2ecc71; font-size:18px;">Lahan Siap Tanam!</strong><br>Pertahankan kondisi ini tanpa perlu penambahan pupuk dasar maupun amelioran.</div>
                        </div>
                    `;
                }

                feather.replace();
            }
        });
    }

    // Fungsi untuk memperbarui label status nutrisi dengan warna yang sesuai
    function updateNutrientLabel(elementId, statusText) {
        const el = document.getElementById(elementId);
        if(!el) return;

        el.innerText = statusText;
        
        // Atur warna berdasarkan status 3 arah
        if(statusText === "NORMAL") {
            el.style.color = "#2ecc71"; // Hijau (Aman)
        } else if (statusText === "TINGGI") {
            el.style.color = "#f39c12"; // Oranye (Berlebih/Toksik)
        } else {
            el.style.color = "#e74c3c"; // Merah (Defisit/Rendah)
        }
    }

    // Fungsi Logout (Matikan Scan)
    function confirmLogout() {
        isLoggedIn = false;
        if (typeof connectionInterval !== 'undefined') {
        clearInterval(dataInterval); // HENTIKAN SCAN SENSOR
        clearInterval(connectionInterval); // HENTIKAN WATCHDOG TIMER 
        }
    
        localStorage.removeItem("adminLoggedIn");

        // Reset Angka Sensor & Skor
        const idsToReset = ['val-n', 'val-p', 'val-k', 'val-ph', 'val-temp', 'val-hum', 'val-ec', 'web-score-val'];
        idsToReset.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.textContent = "0";
        });

        // Reset Label Status NPK & Skor (Kembali ke abu-abu)
        const labelsToReset = ['n-status-label', 'p-status-label', 'k-status-label', 'web-score-label'];
        labelsToReset.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.textContent = "Memuat...";
                el.style.color = "#888"; 
            }
        });

        // Reset Label pH (Kembali ke hijau muda default)
        const phLabel = document.getElementById('ph-status-label');
        if(phLabel) {
            phLabel.textContent = "Memantau...";
            phLabel.style.background = "#eefaf2";
            phLabel.style.color = "#27ae60";
        }

        // --- TAMBAHKAN KODE INI UNTUK MERESET WARNA KOTAK SKOR ---
        const heroBanner = document.querySelector('.hero-score');
        if (heroBanner) {
            // Menghapus warna paksaan JS agar kembali ke warna hijau asli dari CSS
            heroBanner.style.background = ""; 
            // ATAU jika masih bandel, paksa jadi hijau dengan: heroBanner.style.background = "#2ecc71";
        }

        // Reset Judul Status Utama
        const titleEl = document.getElementById('web-status-title');
        if(titleEl) titleEl.textContent = "Menganalisis data lahan...";
        const descEl = document.getElementById('web-status-desc');
        if(descEl) descEl.textContent = "Menunggu data dari sensor";

        // Reset Progress Bar NPK ke 0%
        const nFill = document.querySelector('.n-fill'); if(nFill) nFill.style.width = "0%";
        const pFill = document.querySelector('.p-fill'); if(pFill) pFill.style.width = "0%";
        const kFill = document.querySelector('.k-fill'); if(kFill) kFill.style.width = "0%";

        // Reset Lingkaran Skor ke 0 dan warnanya ke putih
        const circle = document.getElementById('score-progress');
        if(circle) {
            circle.setAttribute('stroke-dasharray', '0, 100');
            circle.style.stroke = "white"; 
        }

        // Reset Status Koneksi ke posisi menunggu
        const textEl = document.getElementById('connection-text');
        const dotEl = document.getElementById('connection-dot');
        if(textEl && dotEl) {
            textEl.innerText = "Menunggu Alat...";
            textEl.style.color = "#666";
            dotEl.className = "dot"; 
        }

        // Reset Kotak AI dan Rekomendasi
        const analysisList = document.getElementById('ai-analysis-list');
        if(analysisList) analysisList.innerHTML = '<li>Memuat analisis lahan...</li>';
        
        const recomText = document.getElementById('ai-recom-text');
        if(recomText) recomText.textContent = "Menunggu kalkulasi dari sensor...";

        // RESET GRAFIK KE KOSONG 
        labels.length = 0; // Kosongkan label waktu (sumbu X)
        datasetValues.n.length = 0;
        datasetValues.p.length = 0;
        datasetValues.k.length = 0;
        datasetValues.ph.length = 0;
        datasetValues.temp.length = 0;
        datasetValues.hum.length = 0;
        datasetValues.ec.length = 0;
        
        // Perbarui tampilan grafik agar semua garis langsung terhapus
        if(typeof multiChart !== 'undefined') {
            multiChart.update();
        }
        
        showToast('success', 'Logout Berhasil', 'Koneksi sensor diputus.');

        setTimeout(() => {
            document.getElementById('guest-view').style.display = 'block';
            document.getElementById('admin-view').style.display = 'none';
            closeLogoutModal();
        }, 800);
    }

    // --- AUTO-LOGIN & PEMULIHAN MEMORI SAAT HALAMAN DI-REFRESH ---
    document.addEventListener("DOMContentLoaded", () => {
        
        // 1. PEMULIHAN MEMORI: LUAS LAHAN
        const inputLuas = document.getElementById('luas-lahan');
        if (inputLuas) {
            // Cek apakah sebelumnya pengguna pernah menyimpan angka luas lahan
            const savedLuas = localStorage.getItem("luasLahanTersimpan");
            if (savedLuas) {
                inputLuas.value = savedLuas; // Kembalikan angka terakhir yang diketik
            }

            // Pasang pendeteksi: Setiap kali angka diubah, langsung simpan ke memori browser!
            inputLuas.addEventListener('input', function() {
                localStorage.setItem("luasLahanTersimpan", this.value);
            });
        }

        // 2. PEMULIHAN MEMORI: STATUS LOGIN ADMIN
        if (localStorage.getItem("adminLoggedIn") === "true") {
            isLoggedIn = true;
            
            // Langsung sembunyikan tampilan tamu dan munculkan dashboard admin
            document.getElementById('guest-view').style.display = 'none';
            document.getElementById('admin-view').style.display = 'block';      
            
            // Langsung jalankan penarikan data sensor tanpa perlu login ulang
            startSensorMonitoring(); 
        }
    });

// FUNGSI UNTUK MERESET DATA SAAT ESP32 OFFLINE / DATA USANG
function resetDataToZero() {
    // 1. Matikan Teks Indikator Atas
    const textEl = document.getElementById('connection-text');
    const dotEl = document.getElementById('connection-dot');
    if(textEl) { textEl.innerText = "ESP32 Offline"; textEl.style.color = "#e74c3c"; }
    if(dotEl) dotEl.className = "dot offline pulse-offline";

    // 2. MATIKAN WARNA KOTAK BANNER UTAMA (JADI ABU-ABU)
    const heroBanner = document.querySelector('.hero-score');
    if (heroBanner) heroBanner.style.background = "#94a3b8"; 

    // 3. Nol-kan Semua Angka Sensor
    const idsToReset = ['val-n', 'val-p', 'val-k', 'val-ph', 'val-temp', 'val-hum', 'val-ec', 'web-score-val'];
    idsToReset.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.textContent = "0";
    });

    // 4. Reset Label Status NPK & Skor jadi Abu-abu
    const labelsToReset = ['n-status-label', 'p-status-label', 'k-status-label', 'web-score-label'];
    labelsToReset.forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.textContent = "Offline"; el.style.color = "#888"; }
    });         

    const phLabel = document.getElementById('ph-status-label');
    if(phLabel) { phLabel.textContent = "Offline"; phLabel.style.background = "#f0f0f0"; phLabel.style.color = "#888"; }

    // 5. Kosongkan Progress Bar NPK & Lingkaran Skor
    const nFill = document.querySelector('.n-fill'); if(nFill) nFill.style.width = "0%";
    const pFill = document.querySelector('.p-fill'); if(pFill) pFill.style.width = "0%";
    const kFill = document.querySelector('.k-fill'); if(kFill) kFill.style.width = "0%";
    const circle = document.getElementById('score-progress');
    if(circle) { circle.setAttribute('stroke-dasharray', '0, 100'); circle.style.stroke = "#eee"; }

    // 6. Reset Judul Banner Utama & Kotak Analisis AI
    const titleEl = document.getElementById('web-status-title');
    if(titleEl) titleEl.textContent = "Sensor Terputus";
    const descEl = document.getElementById('web-status-desc');
    if(descEl) descEl.textContent = "Menunggu alat dinyalakan...";

    const analysisList = document.getElementById('ai-analysis-list');
    if(analysisList) analysisList.innerHTML = '<li style="background:transparent; border:none;"><div class="ai-text" style="color:#888;">Menunggu transmisi data...</div></li>';
    const recomText = document.getElementById('ai-recom-text');
    if(recomText) recomText.innerHTML = '<div class="recom-content" style="border-left-color:#888;"><span class="recom-title">Status: Offline</span><div class="recom-value" style="color:#888;">Menunggu kalkulasi...</div></div>';
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

// ==========================================
// MESIN ALARM NOTIFIKASI LAHAN KRITIS (ANTI-NOISE)
// ==========================================

let isNotifKritisAktif = false;
let currentScore = null; // Ubah jadi null (kosong) agar tidak memicu alarm 0
let hasAlertedKritis = false;
let isDataLoaded = false; // Bendera pengaman

// 1. PUSAT EVALUASI ALARM
function evaluasiAlarm() {
    // PENGAMAN 1: Jangan bunyi kalau belum login (Tunggu admin masuk)
    if (typeof isLoggedIn !== 'undefined' && isLoggedIn === false) return; 

    // PENGAMAN 2: Jangan bunyi kalau data asli belum datang dari ESP32
    if (isDataLoaded === false || currentScore === null) return;

    // Jika skor kritis (asli dari alat) DAN saklar di Settings menyala
    if (currentScore < 50 && isNotifKritisAktif === true) {
        
        // Cek agar tidak spam (muncul berkali-kali)
        if (hasAlertedKritis === false) {
            showToast('error', '⚠️ PERINGATAN LAHAN KRITIS', 'Skor kesuburan anjlok ke ' + currentScore + '! Segera cek rekomendasi AI.');
            hasAlertedKritis = true; 
        }
        
    } 
    // Jika lahan kembali normal
    else if (currentScore >= 50) {
        hasAlertedKritis = false; 
    }
}

// 2. Pantau "Saklar" Notifikasi dari halaman Settings
database.ref('SoilSense/Settings/Notifications/kritis').on('value', (snapshot) => {
    isNotifKritisAktif = snapshot.val() || false;
    evaluasiAlarm(); 
});

// 3. Pantau "Skor" dari ESP32
database.ref('SoilSense/SensorData/score').on('value', (snapshot) => {
    if (snapshot.exists()) {
        currentScore = snapshot.val();
        isDataLoaded = true; // Tandai bahwa ini adalah data ASLI dari alat
        evaluasiAlarm(); 
    }
});

// 1. Jalankan saat halaman pertama kali dibuka
window.addEventListener('load', handleProfilePosition);

// 2. Jalankan secara REAL-TIME setiap kali ukuran layar ditarik/diubah (resize)
window.addEventListener('resize', handleProfilePosition);