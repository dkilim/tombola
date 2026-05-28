/* --- ADMIN PANEL MODAL LOGIKA --- */
function otvoriAdmin() {
    document.getElementById('adminModal').style.display = 'block';
    osvjeziAdminTabelu();
    osvjeziAdminCekiranje();
}

function zatvoriAdmin() {
    document.getElementById('adminModal').style.display = 'none';
    generisiKlijentskiInterfejs(); // Poziv funkcije iz app.js da osvježi glavne dugmiće
}

// Sinhronizacija tabele u admin panelu sa stanjem u JS-u
function osvjeziAdminTabelu() {
    const tbody = document.getElementById('tabela-body');
    tbody.innerHTML = '';
    
    kategorije.forEach((kat, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" id="naziv-${index}" value="${kat.naziv}"></td>
            <td><input type="number" id="od-${index}" value="${kat.od}"></td>
            <td><input type="number" id="do-${index}" value="${kat.do}"></td>
            <td><button class="btn-akcija btn-obrisi" onclick="obrisiKategorijuRed(${index})">Briši</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function dodajNoviRed() {
    snimiTrenutnoStanjeIzTabele();
    const noviId = "kat_" + Date.now();
    kategorije.push({
        id: noviId,
        naziv: `Tombola ${kategorije.length * 5 + 5} KM`,
        od: 1,
        do: 10,
        izvuceni: []
    });
    osvjeziAdminTabelu();
}

function obrisiKategorijuRed(index) {
    if(confirm("Da li ste sigurni da želite obrisati ovu kategoriju?")) {
        snimiTrenutnoStanjeIzTabele();
        kategorije.splice(index, 1);
        osvjeziAdminTabelu();
        osvjeziAdminCekiranje();
    }
}

// Privremeno čitanje iz input polja (prije konačnog spašavanja)
function snimiTrenutnoStanjeIzTabele() {
    kategorije.forEach((kat, index) => {
        const nazivInput = document.getElementById(`naziv-${index}`);
        const odInput = document.getElementById(`od-${index}`);
        const doInput = document.getElementById(`do-${index}`);
        
        if(nazivInput && odInput && doInput) {
            kat.naziv = nazivInput.value;
            kat.od = parseInt(odInput.value) || 1;
            kat.do = parseInt(doInput.value) || 10;
        }
    });
}

// Zvanično upisivanje konfiguracije u localStorage
function spasiSveKategorije() {
    snimiTrenutnoStanjeIzTabele();
    
    kategorije.forEach(kat => {
        if(kat.od > kat.do) {
            let privremena = kat.od;
            kat.od = kat.do;
            kat.do = privremena;
        }
        // Čišćenje brojeva koji su eventualno ispali iz novog opsega
        kat.izvuceni = kat.izvuceni.filter(b => b >= kat.od && b <= kat.do);
    });

    localStorage.setItem('fleksibilna_tombola_podaci', JSON.stringify(kategorije));
    osvjeziAdminCekiranje();
    alert("Sve izmjene su uspješno spremljene na sistem!");
}

// Generisanje kockica za ručno čekiranje brojeva
function osvjeziAdminCekiranje() {
    const kontejner = document.getElementById('admin-cekiranje-kontejner');
    kontejner.innerHTML = '';

    kategorije.forEach(kat => {
        const sekcija = document.createElement('div');
        sekcija.className = 'kat-admin-sekcija';
        
        const naslov = document.createElement('div');
        naslov.className = 'kat-admin-naslov';
        naslov.innerText = kat.naziv + ` (Raspon: ${kat.od} - ${kat.do})`;
        sekcija.appendChild(naslov);

        const grid = document.createElement('div');
        grid.className = 'brojevi-grid';

        for(let i = kat.od; i <= kat.do; i++) {
            const kockica = document.createElement('div');
            kockica.className = 'broj-cek';
            kockica.innerText = i;
            
            if(kat.izvuceni.includes(i)) {
                kockica.classList.add('potrosen');
            }

            kockica.onclick = function() {
                if(kat.izvuceni.includes(i)) {
                    kat.izvuceni = kat.izvuceni.filter(b => b !== i);
                } else {
                    kat.izvuceni.push(i);
                }
                localStorage.setItem('fleksibilna_tombola_podaci', JSON.stringify(kategorije));
                osvjeziAdminCekiranje();
            };
            grid.appendChild(kockica);
        }

        sekcija.appendChild(grid);
        kontejner.appendChild(sekcija);
    });
}