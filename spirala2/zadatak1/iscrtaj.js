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
    if(raspored == null || raspored.firstChild == null ) {
        alert("Greška - raspored nije kreiran");
        return;
    }
    var tabela = document.getElementById(raspored.getAttribute("id")).firstChild.nextSibling;
    let x = indeksReda(dan, tabela);
    let duz = skontajDuzinu(x, tabela);

    let test = skontajPocetak(tabela) + duz*0.5;
    if(!Number.isInteger(vrijemePocetak/0.5) || x < 0
        || !Number.isInteger(vrijemeKraj/0.5) || vrijemePocetak >= vrijemeKraj || skontajPocetak(tabela)>vrijemePocetak
        || test < vrijemeKraj) {
        alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
        return;
    }

    let pocetakSati = skontajPocetak(tabela);
    let red = tabela.rows[x].cells;

    for(let i = 1; i < duz; i++) {
        if(pocetakSati == vrijemePocetak) {
            let celija = red[i];
            if(celija.className != "") {
                alert("Greška - već postoji termin u rasporedu u zadanom vremenu");
                    return;
                }
        
            celija.classList.add("zauzeto");
        
            celija.setAttribute("colspan", ((vrijemeKraj - vrijemePocetak)*2).toString());
            let text = document.createTextNode(naziv);
            celija.appendChild(text);

            let pomocniDiv = document.createElement("div");
            pomocniDiv.setAttribute("class", "tekst");
            text = document.createTextNode(tip);
            pomocniDiv.appendChild(text);
            celija.appendChild(pomocniDiv);

            let duzina = red.length;
            let zaObrisati = (vrijemeKraj - vrijemePocetak)*2-1;
            // if(i == duzina-zaObrisati-1) {
                i += zaObrisati;
                while(zaObrisati > 0) {
                    let c = red[i];
                    
                    if(c.className == "") {
                        c.remove();
                        zaObrisati--;
                    }
                    i--;
                }
                break;
            // }
            // i++;
            // while(zaObrisati > 0) {
            //     let ce = red[i];
            //     if(ce.className == "") {
            //         ce.remove();
            //         zaObrisati--;
            //     }
            //     i++;
            // }
            // break;

            // for(let j = duzina-1; j > duzina - (vrijemeKraj - vrijemePocetak)*2;j--){
            //     tabela.rows[x].cells[j].remove();
            // }
            // break;
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
        if(celija.className !="" 
        && celija.className !="dan") {
            velicina += celija.getAttribute("colspan")-1;
        }
    }
    return velicina;
}

function skontajPocetak(tabela) {
    let pocetak = -1;

    let prviRed = tabela.rows[0].cells;

    for(let i = 0; i < prviRed.length; i++) {
        if(prviRed[i].getAttribute("colspan") != null) {
            let text = prviRed[i].innerHTML;
            pocetak = parseInt(text.substr(0,2)[0] == "0" ? text.substr(0,2)[1] : text.substr(0,2));
            if(i > 0) {
                pocetak--;
            }
            break; 
        }
    }

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