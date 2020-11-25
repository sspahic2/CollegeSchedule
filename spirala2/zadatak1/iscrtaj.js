const vremena = [0, 2, 4, 6, 8, 10, 12, 15, 17, 19, 21, 23];

function iscrtajRaspored(div, dani, satPocetak, satKraj) {

    if(div == undefined) {
        alert("Greška. Div nije kreiran!");
        return;
    }

    if(satPocetak >= satKraj || provjeriCjelobrojnost(satPocetak, satKraj)) {
        let text = document.createTextNode("Greška");
        div.appendChild(text);
        return;
    }
    var prviRed;

    var table = document.createElement("table");
    table.setAttribute("id", "tabela");
    var headerVrijemeNiz = [];

    //Koja sve vremena se trebaju nalaziti u prvom redu
    for(let i = 0; i < vremena.length; i++) {
        if(satPocetak <= vremena[i] && vremena[i] < satKraj) {
            headerVrijemeNiz.push(vremena[i]);
        }
    }
    
    //Ogranicenje da svaka druga kolona ima isprekidan border
    let grupa = document.createElement("colgroup");

    for(let i = 0; i < (satKraj-satPocetak)*2+1; i++) {
        let kolona = document.createElement("col");
        if(i == 0 || i % 2 == 0 || i == (satKraj-satPocetak)*2) {
            kolona.style.borderRight="solid 1px black";

        }
        else if(i % 2 == 1) {
            kolona.style.borderRight="dashed 1px black";
        }
        grupa.appendChild(kolona);
    }
    table.appendChild(grupa);

    //Dodavanje vremena
    let red = document.createElement("tr");
    for(let i = satPocetak; i < satKraj; i+=0.5) {
        let headerSat = document.createElement("th");
        if(headerVrijemeNiz.includes(i)) {
            headerSat.setAttribute("colspan", "2");
            headerSat.style.paddingRight = "4px";
            let text;
            if(i < 10) {text = document.createTextNode("0" + i + ":00");}
            else {text = document.createTextNode(i + ":00");}
            headerSat.appendChild(text);
            i+=0.5;
        }
        red.appendChild(headerSat);
    }
    red.setAttribute("class", "first");
    table.appendChild(red);

    //Dodavanje dana i celija
    for(let i = 0; i < dani.length; i++) {
        let red = document.createElement("tr");
        let headerDan = document.createElement("th");
        let headerDanText = document.createTextNode(dani[i]);
        headerDan.classList.add("dan");
        headerDan.appendChild(headerDanText);
        red.appendChild(headerDan);

        for(let j = 0; j < (satKraj-satPocetak)*2; j++) {
            let celija = document.createElement("td");
            red.appendChild(celija);
        }
        table.appendChild(red);
    }
    div.appendChild(table);

    //Postavljanje da prvi red nema bordere
    prviRed = document.querySelectorAll(".first th:nth-child(n)");
    for(let i = 0; i < prviRed.length; i++) {
        prviRed[i].style.borderRight="hidden";
    }
}

function dodajAktivnost(raspored, naziv, tip, vrijemePocetak, vrijemeKraj, dan) {
    if(raspored == null || raspored.firstChild == null ) {
        alert("Greška - raspored nije kreiran");
        return;
    }
    var tabela = document.getElementById(raspored.getAttribute("id")).firstChild.nextSibling;

    let x = indeksReda(dan, tabela);
    //Provjera da li je unesen validan dan
    if(x < 0) {
        alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
        return;
    }

    let duz = skontajDuzinu(x, tabela);

    //Test predstavlja kranje vrijeme u prvom redu
    let test = skontajPocetak(tabela) + duz*0.5;
    if(!Number.isInteger(vrijemePocetak/0.5)
        || !Number.isInteger(vrijemeKraj/0.5) 
            || vrijemePocetak >= vrijemeKraj 
            //Provjere da li vrijeme obaveze se nalazi u tabeli
                || skontajPocetak(tabela)>vrijemePocetak
                    || test < vrijemeKraj) {
        alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
        return;
    }

    let pocetakSati = skontajPocetak(tabela);
    let temp = pocetakSati;
    let red = tabela.rows[x].cells;
    let duzina = red.length;

    //Provjer da li se preklapa vrijeme obaveze sa vec postojecom obavezom
    let greska = false;
    for(let i = 1; i <= duzina; i++) {
        if(pocetakSati == vrijemePocetak) {
            let celija = red[i];
            if(celija.className != "") {
                alert("Greška - već postoji termin u rasporedu u zadanom vremenu");
                greska = true;
                break;
            }
            let j = i;
            while(pocetakSati < vrijemeKraj) {
                celija = red[j];
                if(celija.className != "") {
                    alert("Greška - već postoji termin u rasporedu u zadanom vremenu");
                    greska = true;
                    break;
                }
                //Povecanje indeks za 1 je ekvivalentno kao povecanje vremena za pola sata
                pocetakSati += 0.5;
                j++;
            }
            break;
        }
        //Treba uvecati sat za polovinu duzine obaveze ili za pola sata
        pocetakSati +=  red[i].getAttribute("colspan") != null ? red[i].getAttribute("colspan")/2 : 0.5;
    }

    pocetakSati = temp;
    //Ako greska postoji onda ne trebamo obavezu unositi u tabelu
    if(!greska) {
        ubaciAktivnost(pocetakSati, vrijemePocetak, tip, naziv, vrijemeKraj, red, duz);
    }
}

//Obavlja ubacivanje obaveze u tabelu
function ubaciAktivnost(pocetakSati, vrijemePocetak, tip, naziv, vrijemeKraj, red, duz) {
    for(let i = 1; i < duz; i++) {
        if(pocetakSati == vrijemePocetak) {
            let celija = red[i];
            celija.classList.add("zauzeto");
        
            celija.setAttribute("colspan", ((vrijemeKraj - vrijemePocetak)*2).toString());
            let text = document.createTextNode(naziv);
            celija.appendChild(text);

            let pomocniDiv = document.createElement("div");
            pomocniDiv.setAttribute("class", "tekst");
            text = document.createTextNode(tip);
            pomocniDiv.appendChild(text);
            celija.appendChild(pomocniDiv);

            //Brise celije nakon obaveze
            //Broj koliko obrise je zaObrisati varijabla
            let zaObrisati = (vrijemeKraj - vrijemePocetak)*2-1;
            //Vracamo se unazad dok ne dodjemo do novounesene obaveze
            i += zaObrisati;
            while(zaObrisati > 0) {
                let c = red[i];
                c.remove();
                zaObrisati--;
                i--;
            }
            break;
        }
        pocetakSati +=  red[i].getAttribute("colspan") != null ? red[i].getAttribute("colspan")/2 : 0.5;
    }
}

function provjeriCjelobrojnost(broj1, broj2) {
    return !(Number.isInteger(broj1) && Number.isInteger(broj2))
}

function skontajDuzinu(red, tabela) {
    let velicina = 0;
    for(let i = 0; i < tabela.rows[red].cells.length; i++) {
        let celija = tabela.rows[red].cells[i];
        velicina++;
        if(celija.className !="" && celija.className !="dan") {
            velicina += celija.getAttribute("colspan")-1;
        }
    }
    return velicina;
}

//Na osnovu vrijednosti iz prvog reda pronalazi pocetno vrijeme tabele
function skontajPocetak(tabela) {
    let pocetak = -1;

    let prviRed = tabela.rows[0].cells;

    for(let i = 0; i < prviRed.length; i++) {
        if(prviRed[i].getAttribute("colspan") != null) {
            let text = prviRed[i].innerHTML;
            pocetak = parseInt(text.substr(0,2)[0] == "0" ? text.substr(0,2)[1] : text.substr(0,2));
            //Vazno je samo prvo vrijeme koje se prikazuje u prvom redu
            if(i > 0) {
                //Trebamo umanjiti za pola predjenih indeksa i
                //Npr ako su unesena vremena od 9 do 15
                //Prvo vrijeme ce biti 10
                //Ono se nalazi na indeksu 2 prvog reda
                pocetak-= i*0.5;
            }
            break; 
        }
    }
    //U slucaju da je unesena obaveza za vrijeme izmedju 13 i 14
    if( pocetak < 0) {
        pocetak = 13;
    }

    return pocetak;
}

function indeksReda(dan, tabela) {
    var indeks = -1;

    for(let i = 0; i < tabela.rows.length; i++) {
        if(tabela.rows[i].cells[0].innerHTML == dan) {
            indeks = i;
            break;
        }
    }
    return indeks;
}