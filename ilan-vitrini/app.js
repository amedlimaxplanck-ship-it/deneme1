import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

let suAnkiIlanId = "", ilanSahibiId = ""; 
let gercekFiyat = 0;

// URL'den ID'yi Yakala
const urlParams = new URLSearchParams(window.location.search);
const linktekiId = urlParams.get('id');

// BÜYÜ BURADA: Linkte ID yoksa sistemi kilitliyoruz.
if (linktekiId) {
    ilaniEkranaBas(linktekiId);
} else {
    document.body.innerHTML = `
        <div style="text-align:center; padding: 50px 20px; font-family: Arial;">
            <h2 style="color: #d32f2f;">⚠️ Geçersiz İlan Bağlantısı</h2>
            <p style="color: #666; margin-top:10px;">Aradığınız ilan yayından kaldırılmış veya link hatalı olabilir.</p>
        </div>
    `;
}

window.sekmeDegistir = function(sekmeId, tiklananButon) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('sekme-' + sekmeId).classList.add('active');
    tiklananButon.classList.add('active');
};

async function ilaniEkranaBas(ilanId) {
    try {
        const ilanSnap = await getDoc(doc(db, "ilanlar", ilanId));
        if (ilanSnap.exists()) {
            const data = ilanSnap.data();
            
            document.getElementById('lblBaslik').innerText = data.baslik;
            gercekFiyat = data.fiyat;
            document.getElementById('lblFiyat').innerText = gercekFiyat.toLocaleString('tr-TR') + " TL";
            document.getElementById('lblIlanNo').innerText = ilanSnap.id.substring(0, 8).toUpperCase();
            
            const saticiAdi = data.satici || "Bireysel Satıcı";
            document.getElementById('lblSaticiAdi').innerText = saticiAdi;
            document.getElementById('lblSaticiHarf').innerText = saticiAdi.charAt(0).toUpperCase();
            document.getElementById('lblAciklama').innerText = data.aciklama || "Açıklama girilmemiş.";

            suAnkiIlanId = ilanSnap.id; 
            ilanSahibiId = data.sahip_id; 
            
            document.getElementById('anaKonteyner').style.display = "block";
            document.getElementById('ekran-vitrin').style.display = "block";
        } else { 
            document.body.innerHTML = `
                <div style="text-align:center; padding: 50px 20px; font-family: Arial;">
                    <h2 style="color: #d32f2f;">❌ İlan Bulunamadı</h2>
                    <p style="color: #666; margin-top:10px;">Bu ilan yayından kaldırılmış.</p>
                </div>
            `;
        }
    } catch (error) { 
        alert("Bağlantı Hatası: " + error.message); 
    }
}

document.getElementById('btnSatinAlAdim1').addEventListener('click', () => {
    const komisyonBedeli = Math.round(gercekFiyat * 0.05);
    const toplamTutar = gercekFiyat + komisyonBedeli;

    document.getElementById('ozetUrunFiyat').innerText = gercekFiyat.toLocaleString('tr-TR') + " TL";
    document.getElementById('ozetKomisyon').innerText = komisyonBedeli.toLocaleString('tr-TR') + " TL";
    document.getElementById('ozetToplam').innerText = toplamTutar.toLocaleString('tr-TR') + " TL";

    document.getElementById('ekran-vitrin').style.display = "none";
    document.getElementById('ekran-ozet').style.display = "block";
    
    document.getElementById('headerBaslik').innerText = "sipariş özeti";
    document.getElementById('btnGeri').style.display = "inline";
});

document.getElementById('btnOdemeyeGec').addEventListener('click', () => {
    document.getElementById('ekran-ozet').style.display = "none";
    document.getElementById('ekran-odeme').style.display = "block";
    document.getElementById('headerBaslik').innerText = "ödeme ve teslimat";
});

document.getElementById('btnGeri').addEventListener('click', () => {
    if (document.getElementById('ekran-ozet').style.display === "block") {
        document.getElementById('ekran-ozet').style.display = "none";
        document.getElementById('ekran-vitrin').style.display = "block";
        document.getElementById('headerBaslik').innerText = "ilan detayları";
        document.getElementById('btnGeri').style.display = "none";
    } else if (document.getElementById('ekran-odeme').style.display === "block") {
        document.getElementById('ekran-odeme').style.display = "none";
        document.getElementById('ekran-ozet').style.display = "block";
        document.getElementById('headerBaslik').innerText = "sipariş özeti";
    }
});

document.getElementById('btnSiparisTamamla').addEventListener('click', async () => {
    const isim = document.getElementById('aliciIsim').value.trim();
    const tel = document.getElementById('aliciTel').value.trim();
    const btn = document.getElementById('btnSiparisTamamla');
    
    if(isim === "" || tel === "") return alert("Lütfen iletişim bilgilerinizi girin.");

    btn.innerText = "İşleminiz Yapılıyor..."; 
    btn.disabled = true;
    
    try {
        const toplamTutar = gercekFiyat + Math.round(gercekFiyat * 0.05);

        await addDoc(collection(db, "siparisler"), {
            ilan_id: suAnkiIlanId, bayi_id: ilanSahibiId, 
            ilan_baslik: document.getElementById('lblBaslik').innerText,
            odenen_tutar: toplamTutar, 
            alici_isim: isim, alici_telefon: tel, 
            durum: "Aşama 1: Ödeme Bekleniyor", tarih: new Date().toLocaleString('tr-TR')
        });
        
        document.getElementById('ekran-odeme').style.display = "none";
        document.getElementById('ekran-basarili').style.display = "block";
        document.getElementById('headerBaslik').innerText = "işlem başarılı";
        document.getElementById('btnGeri').style.display = "none";
    } catch (error) { 
        alert("Hata: " + error.message); 
        btn.innerText = "Siparişi Tamamla"; 
        btn.disabled = false; 
    }
});
