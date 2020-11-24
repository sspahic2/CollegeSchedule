const vremena = [0, 2, 4, 6, 8, 10, 12, 15, 17, 19, 21, 23];
var spaseniDani = [];

function iscrtajRaspored(div, dani, satPocetak, satKraj) {

    var prviRed;

    if(satPocetak >= satKraj || provjeriCjelobrojnost(satPocetak, satKraj)) {
        let text = document.createTextNode("Greška");
        div.appendChild(text);
        return;
    }

    spaseniDani = dani;

    var table = document.createElement("table");
    table.setAttribute("id", "tabela");
    var headerVrijemeNiz = [];

    for(let i = 0; i < vremena.length; i++) {
        if(satPocetak <= vremena[i] && vremena[i] < satKraj) {
            headerVrijemeNiz.push(vremena[i]);
        }
    }
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

    let red = document.createElement("tr");
    for(let i = satPocetak; i < (satKraj-satPocetak)*2; i+=0.5) {
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

    prviRed = document.querySelectorAll(".first th:nth-child(n)");
    for(let i = 0; i < prviRed.length; i++) {
        prviRed[i].style.borderRight="hidden";
    }
}

function dodajAktivnost(raspored, naziv, tip, vrijemePocetak, vrijemeKraj, dan) {
    if(raspored == null || raspored.firstChild == null) {
        alert("Greška - raspored nije kreiran");
        return;
    }

    if(!Number.isInteger(vrijemePocetak/0.5) || !spaseniDani.includes(dan) 
        || !Number.isInteger(vrijemeKraj/0.5) || vrijemePocetak >= vrijemeKraj) {
        alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
    }
    let x = spaseniDani.indexOf(dan)+1;
    let duz = skontajDuzinu(x);
    let pocetakSati = skontajPocetak();
    let pocetakIndeks = skontajPocetakIndeks();
    if(pocetakIndeks != 0) {
        pocetakSati--;
    }
    let red = document.getElementById("tabela").rows[x].cells;
    for(let i = 1; i < duz; i++) {
        if(pocetakSati == vrijemePocetak) {
            let celija = red[i];
            console.log(i);
            if(celija.className != "") {
                alert("Greška - već postoji termin u rasporedu u zadanom vremenu");
                    return;
                }
        
            celija.classList.add("zauzeto");
        
            celija.setAttribute("colspan", ((vrijemeKraj - vrijemePocetak)*2).toString());
            let text = document.createTextNode(naziv + " \n " + tip);
            celija.appendChild(text);
            let duzina = red.length;
            for(let j = duzina-1; j > duzina - (vrijemeKraj - vrijemePocetak)*2;j--){
                console.log(j);
                document.getElementById("tabela").rows[x].cells[j].remove();
            }
            break;
        }
        //i += red[i].getAttribute("colspan") != null ? red[i].getAttribute("colspan") - 1 : 0;
        pocetakSati +=  red[i].getAttribute("colspan") != null ? red[i].getAttribute("colspan")/2 : 0.5;
    }
}

function provjeriCjelobrojnost(broj1, broj2) {
    return !(Number.isInteger(broj1) && Number.isInteger(broj2))
}

function skontajDuzinu(red) {
    let velicina = 0;
    for(let i = 0; i < document.getElementById("tabela").rows[red].cells.length; i++) {
        let celija = document.getElementById("tabela").rows[red].cells[i];
        velicina++;
        if(celija.className !="" 
        && celija.className !="dan") {
            velicina += celija.getAttribute("colspan")-1;
        }
    }
    return velicina;
}

function skontajPocetak() {
    let pocetak = -1;

    let prviRed = document.getElementById("tabela").rows[0].cells;

    for(let i = 0; i < prviRed.length; i++) {
        if(prviRed[i].getAttribute("colspan") != null) {
            let text = prviRed[i].innerHTML;
            pocetak = parseInt(text.substr(0,2)[0] == "0" ? text.substr(0,2)[1] : text.substr(0,2));
            break; 
        }
    }

    if( pocetak < 0) {
        pocetak = 13;
    }

    return pocetak;
}

function skontajPocetakIndeks() {
    let indeks = -1;

    let prviRed = document.getElementById("tabela").rows[0].cells;

    for(let i = 0; i < prviRed.length; i++) {
        if(prviRed[i].getAttribute("colspan") != null) {
            indeks=i;
            break; 
        }
    }

    if( indeks < 0) {
        indeks = 0;
    }

    return indeks;
}