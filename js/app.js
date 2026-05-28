// Podrazumijevane početne postavke (ukoliko je lokalna memorija prazna)
let kategorije = [
    { id: "kat_1", naziv: "Tombola 5 KM", od: 10, do: 19, izvuceni: [] },
    { id: "kat_2", naziv: "Tombola 10 KM", od: 30, do: 36, izvuceni: [] }
];

let selektovanaKategorijaId = null;

// Inicijalizacija aplikacije nakon što se prozor učita
window.onload = function() {
    if(localStorage.getItem('fleksibilna_tombola_podaci')) {
        kategorije = JSON.parse(localStorage.getItem('fleksibilna_tombola_podaci'));
    }
    generisiKlijentskiInterfejs();
};

// Generisanje dugmića za klijentski dio aplikacije
function generisiKlijentskiInterfejs() {
    const kontejner = document.getElementById('dinamicki-dugmiti');
    kontejner.innerHTML = '';
    
    kategorije.forEach(kat => {
        const btn = document.createElement('button');
        btn.className = 'btn-grupa';
        btn.id = 'btn-' + kat.id;
        btn.innerText = kat.naziv;
        btn.onclick = function() { izaberiKategoriju(kat.id); };
        kontejner.appendChild(btn);
    });

    // Resetovanje stanja ekrana
    selektovanaKategorijaId = null;
    document.getElementById('broj-okvir').innerText = '?';
    document.getElementById('broj-okvir').classList.remove('slavlje');
    document.getElementById('btn-izvuci').disabled = true;
    document.getElementById('poruka').innerText = "Molimo odaberite tombolu iznad.";
}

// Odabir aktivne kategorije tombole
function izaberiKategoriju(id) {
    selektovanaKategorijaId = id;
    
    kategorije.forEach(kat => {
        const btn = document.getElementById('btn-' + kat.id);
        if(btn) btn.classList.remove('active');
    });
    
    const aktivniBtn = document.getElementById('btn-' + id);
    if(aktivniBtn) aktivniBtn.classList.add('active');
    
    document.getElementById('broj-okvir').innerText = '?';
    document.getElementById('broj-okvir').classList.remove('slavlje');
    
    prikaziPreostaloPaketica();
}

// Osvježavanje ispisa preostalih tiketa
function prikaziPreostaloPaketica() {
    const kat = kategorije.find(k => k.id === selektovanaKategorijaId);
    const btnIzvuci = document.getElementById('btn-izvuci');
    
    if(!kat) return;

    const preostali = vratiPreostaleBrojeve(kat);
    
    if(preostali.length === 0) {
        document.getElementById('poruka').innerText = `Svi brojevi za "${kat.naziv}" su potrošeni! 🎁`;
        btnIzvuci.disabled = true;
    } else {
        document.getElementById('poruka').innerText = `Preostalo paketića u ovoj kategoriji: ${preostali.length}`;
        btnIzvuci.disabled = false;
    }
}

// Pomoćna funkcija koja generiše niz dostupnih brojeva
function vratiPreostaleBrojeve(kat) {
    let svi = [];
    for(let i = kat.od; i <= kat.do; i++) {
        svi.push(i);
    }
    return svi.filter(b => !kat.izvuceni.includes(b));
}

/* --- ANIMACIJA I POKRETANJE TOMBOLE --- */
function pokreniKonfete() {
    var duration = 2.5 * 1000;
    var end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } });
        if (Date.now() < end) { requestAnimationFrame(frame); }
    }());
}

function izvuciBroj() {
    if(!selektovanaKategorijaId) return;
    
    const kat = kategorije.find(k => k.id === selektovanaKategorijaId);
    const btn = document.getElementById('btn-izvuci');
    const okvir = document.getElementById('broj-okvir');
    const poruka = document.getElementById('poruka');
    
    const preostali = vratiPreostaleBrojeve(kat);
    okvir.classList.remove('slavlje');

    if (preostali.length === 0) {
        poruka.innerText = "Nema više dostupnih brojeva u ovoj kategoriji!";
        btn.disabled = true;
        return;
    }

    btn.disabled = true;
    poruka.innerText = "Miješanje...";
    
    let brojac = 0;
    let interval = setInterval(() => {
        okvir.innerText = Math.floor(Math.random() * (kat.do - kat.od + 1)) + kat.od;
        brojac++;
        
        if (brojac > 15) {
            clearInterval(interval);
            
            const randomIndex = Math.floor(Math.random() * preostali.length);
            const konacniBroj = preostali[randomIndex];
            
            // Čuvanje rezultata izvlačenja
            kat.izvuceni.push(konacniBroj);
            localStorage.setItem('fleksibilna_tombola_podaci', JSON.stringify(kategorije));
            
            okvir.innerText = konacniBroj;
            okvir.classList.add('slavlje');
            pokreniKonfete();
            
            prikaziPreostaloPaketica();
        }
    }, 70);
}