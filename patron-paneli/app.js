import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAQ_AVGuAYShAvFjipmXzV3k3sfp2dbBUE",
    authDomain: "grandproject-6692e.firebaseapp.com",
    projectId: "grandproject-6692e",
    storageBucket: "grandproject-6692e.firebasestorage.app",
    messagingSenderId: "486382284214",
    appId: "1:486382284214:web:6552ef16b927a09f3b6517"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const musteriTablosu = document.getElementById('musteriTablosu');
const modal = document.getElementById('musteriModal');
const inputIsim = document.getElementById('yeniIsim');

// 1. Müşterileri Tabloya Çek
async function musterileriGetir() {
    try {
        const querySnapshot = await getDocs(collection(db, "lisanslar"));
        musteriTablosu.innerHTML = ""; 

        if (querySnapshot.empty) {
            musteriTablosu.innerHTML = "<tr><td colspan='5'>Henüz hiç bayi eklenmemiş.</td></tr>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const musteri = docSnap.data();
            const id = docSnap.id;
            
            const durumClass = musteri.durum === "aktif" ? "aktif" : "pasif";
            const durumYazi = musteri.durum === "aktif" ? "Aktif" : "Askıda";
            const btnClass = musteri.durum === "aktif" ? "pasif-yap" : "aktif-yap";
            const btnYazi = musteri.durum === "aktif" ? "Pasif Yap" : "Aktif Yap";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${id}</strong></td>
                <td>${musteri.isim || 'İsimsiz'}</td>
                <td>${musteri.kayitTarihi || 'Bilinmiyor'}</td>
                <td><span class="badge ${durumClass}">${durumYazi}</span></td>
                <td>
                    <button class="btn-toggle ${btnClass}" onclick="durumDegistir('${id}', '${musteri.durum}')">
                        ${btnYazi}
                    </button>
                </td>
            `;
            musteriTablosu.appendChild(tr);
        });
    } catch (error) {
        alert("Firebase Hatası: " + error.message);
        musteriTablosu.innerHTML = "<tr><td colspan='5'>Bağlantı hatası: " + error.message + "</td></tr>";
    }
}

// 2. Şalter (Aktif/Pasif) Fonksiyonu
window.durumDegistir = async (id, mevcutDurum) => {
    const yeniDurum = mevcutDurum === "aktif" ? "pasif" : "aktif";
    const onay = confirm("Bu müşteriyi '" + yeniDurum + "' yapmak istediğine emin misin?");
    
    if (onay) {
        try {
            const musteriRef = doc(db, "lisanslar", id);
            await updateDoc(musteriRef, { durum: yeniDurum });
            musterileriGetir(); 
        } catch (error) {
            alert("Şalter indirilirken hata: " + error.message);
        }
    }
};

// 3. Modal Kontrolleri
document.getElementById('btnYeniMusteri').addEventListener('click', () => {
    modal.style.display = 'flex';
    inputIsim.focus();
});

document.getElementById('btnIptal').addEventListener('click', () => {
    modal.style.display = 'none';
    inputIsim.value = ''; 
});

// 4. Veritabanına Yeni Bayi Kaydet
document.getElementById('btnKaydet').addEventListener('click', async () => {
    const isimDegeri = inputIsim.value.trim();
    
    if (isimDegeri === "") {
        alert("Lütfen bir isim girin!");
        return;
    }

    const tarih = new Date().toLocaleDateString('tr-TR');

    try {
        await addDoc(collection(db, "lisanslar"), {
            isim: isimDegeri,
            durum: "aktif",
            kayitTarihi: tarih
        });
        
        inputIsim.value = '';
        modal.style.display = 'none';
        musterileriGetir();
        alert("Müşteri başarıyla eklendi kanka!");
        
    } catch (error) {
        alert("Kaydederken hata oluştu: " + error.message);
    }
});

// Sayfa yüklendiğinde listeyi getir
window.onload = musterileriGetir;

