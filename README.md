




# Indor - Dasbor Kerentanan & Perangkat OT/ICS



> Sebuah dasbor web modern untuk mengelola, melacak, dan menganalisis perangkat Teknologi Operasi (OT) / Sistem Kontrol Industri (ICS) beserta kerentanan terkait, dilengkapi dengan penjelasan berbasis AI.
## Project info

**URL**: https://indor-fgvwjoltf-azzeals-orgs-projects.vercel.app

![Tampilan Aplikasi Indor](httpsd://user-images.githubusercontent.com/18204593/254421677-943e6b34-8b63-47a3-b5b6-76495679942a.png)
*(**Catatan**: Anda bisa mengganti URL di atas dengan link ke screenshot Anda sendiri setelah mengunggahnya ke GitHub)*

---

## 📖 Tentang Proyek

**Indor** adalah sebuah platform terpusat yang dirancang untuk membantu para profesional keamanan siber, analis, dan peneliti dalam menginventarisasi dan memahami lanskap keamanan sistem industri. Proyek ini mengatasi tantangan dalam melacak perangkat OT/ICS yang tersebar dan kerentanan (CVE) yang terkait dengannya dengan menyediakan satu antarmuka yang bersih, cepat, dan fungsional.

Fitur unggulan dari proyek ini adalah integrasi dengan AI untuk memberikan penjelasan kontekstual terhadap kode kerentanan (CVE), sehingga mempercepat proses analisis dan pengambilan keputusan.

---

## ✨ Fitur Utama

* **📊 Dasbor Interaktif:** Tampilan ringkasan data dengan kartu statistik untuk "Total Perangkat", "Perangkat dengan Link", dan "Hasil Pencarian".
* **➕ Manajemen Perangkat:** Antarmuka untuk menambah (`+ Add Device`), melihat, mengubah, dan menghapus data perangkat (CRUD).
* **🔍 Pencarian Cepat:** Fungsi pencarian yang komprehensif untuk memfilter perangkat berdasarkan vendor, produk, tipe, atau deskripsi.
* **🤖 Penjelasan Kerentanan Berbasis AI:** Fitur inovatif "AI Explain Vulnerability" untuk mendapatkan penjelasan ringkas dan mudah dipahami mengenai kode CVE yang terkait.
* **🔗 Pelacakan CVE & Referensi:** Setiap entri dapat ditautkan dengan kode CVE spesifik dan link eksternal untuk referensi lebih lanjut.
* **🔐 Autentikasi Pengguna:** Sistem login dan logout untuk administrator, memastikan data hanya dapat dikelola oleh pengguna yang berwenang.

---

## 🛠️ Dibangun Dengan

Aplikasi ini dibangun menggunakan tumpukan teknologi modern yang berfokus pada kecepatan dan pengalaman pengguna:

* **Frontend:** **React.js** (atau **Next.js**)
* **Backend & Database:** **Supabase** (PostgreSQL, Authentication, Auto-generated APIs)
* **Styling:** **Tailwind CSS**
* **AI Integration:** API dari Large Language Model Gemini API

---

## 🚀 Panduan Instalasi

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut.

### Prasyarat

* **Node.js** (versi 18.x atau lebih baru)
* **npm** atau **yarn**
* Akun **Supabase** gratis



## 🎛️ Penggunaan

* Akses halaman utama untuk melihat dasbor.
* Gunakan tombol "Logout" untuk keluar dari sesi admin.
* Gunakan tombol "+ Add Device" untuk menambahkan data perangkat baru (memerlukan login).
* Klik "AI Explain Vulnerability" untuk memicu permintaan penjelasan ke model AI.

---

## 🤝 Kontribusi

Kontribusi membuat komunitas sumber terbuka menjadi tempat yang luar biasa untuk belajar, menginspirasi, dan berkreasi. Setiap kontribusi yang Anda buat sangat **dihargai**.

Jika Anda memiliki saran untuk membuatnya lebih baik, silakan *fork* repo ini dan buat *pull request*. Anda juga bisa membuka *issue* dengan tag "enhancement". Jangan lupa beri bintang pada proyek ini! Terima kasih!

---

## 📜 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE.txt` untuk informasi lebih lanjut.
