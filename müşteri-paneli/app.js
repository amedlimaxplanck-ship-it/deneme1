import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

// Şimdilik sistemde tek bayi var gibi ID atadık. İleride giriş yapıldığında değişecek.
const aktifBayiID = "BAYI_001"; 

const ilanTablosu = document.getElementById('ilanTablosu');
const siparisTablosu = document.getElementById('siparisTablosu');

async function ilanlariGetir() {
    try {
        const q = query(collection(db, "ilanlar"), where("sahip_id", "==", aktifBayiID));
        const querySnapshot = await getDocs(q);
        ilanTablosu.innerHTML = ""; 
        if (querySnapshot.empty) { ilanTablosu.innerHTML = "<li>İlan bulunamadı.</li>"; return; }
        querySnapshot.forEach((docSnap) => {
            const ilan = docSnap.data();
            ilanTablosu.innerHTML += `<li><div><strong>${ilan.baslik}</strong> <br><small>Link ID: ${docSnap.id}</small></div><div class="ilan-fiyat">${ilan.fiyat} ₺</div></li>`;
        });
    } catch (error) { ilanTablosu.innerHTML = "<li>Hata oluştu.</li>"; }
}

document.getElementById('btnIlanYarat').addEventListener('click', async () => {
    const baslik = document.getElementById('ilanBaslik').value.trim();
    const fiyat = document.getElementById('ilanFiyat').value.trim();
    const satici = document.getElementById('saticiAdi').value.trim() || "Bireysel Satıcı";
    const aciklama = document.getElementById('ilanAciklama').value.trim() || "Açıklama girilmedi.";
    
    if (baslik === "" || fiyat === "") return alert("Başlık ve fiyat zorunludur!");

    document.getElementById('btnIlanYarat').innerText = "Oluşturuluyor...";
    try {
        await addDoc(collection(db, "ilanlar"), { 
            sahip_id: aktifBayiID, 
            baslik: baslik, 
            fiyat: Number(fiyat), 
            satici: satici,
            aciklama: aciklama,
            tarih: new Date().toISOString() 
        });
        
        document.getElementById('ilanBaslik').value = ''; 
        document.getElementById('ilanFiyat').value = '';
        document.getElementById('saticiAdi').value = '';
        document.getElementById('ilanAciklama').value = '';
        ilanlariGetir();
    } catch (error) { alert("Hata: " + error.message); } 
    finally { document.getElementById('btnIlanYarat').innerText = "Hemen Link Oluştur"; }
});

async function siparisleriGetir() {
    try {
        const q = query(collection(db, "siparisler"), where("bayi_id", "==", aktifBayiID));
        const querySnapshot = await getDocs(q);
        siparisTablosu.innerHTML = ""; 
        if (querySnapshot.empty) { siparisTablosu.innerHTML = "<tr><td colspan='5'>Sipariş yok.</td></tr>"; return; }
        querySnapshot.forEach((docSnap) => {
            const sip = docSnap.data();
            const secenekler = ["Aşama 1: Ödeme Bekleniyor", "Aşama 2: Ödeme Onaylandı", "Aşama 3: Kargolandı"];
            let opts = secenekler.map(s => `<option value="${s}" ${sip.durum === s ? "selected" : ""}>${s}</option>`).join("");
            siparisTablosu.innerHTML += `<tr><td><strong>${sip.alici_isim}</strong><br><small>${sip.alici_telefon}</small></td><td>${sip.ilan_baslik}</td><td><small>${sip.tarih}</small></td><td><button class="dekont-btn" onclick="alert('Dekont Açılacak')">Görüntüle</button></td><td><select class="durum-secici" onchange="durumGuncelle('${docSnap.id}', this.value)">${opts}</select></td></tr>`;
        });
    } catch (error) { siparisTablosu.innerHTML = "<tr><td colspan='5'>Hata oluştu.</td></tr>"; }
}

window.durumGuncelle = async (siparisId, yeniDurum) => {
    try { 
        await updateDoc(doc(db, "siparisler", siparisId), { durum: yeniDurum }); 
        alert("Evre güncellendi!"); 
    } 
    catch (error) { alert("Hata: " + error.message); }
};

window.onload = () => { ilanlariGetir(); siparisleriGetir(); };

