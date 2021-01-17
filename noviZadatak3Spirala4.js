var ajax = new XMLHttpRequest();
var predmeti;
var aktivnosti;
var div = document.getElementById('container');
const greskaBoja = "#ff726f";
const uspjesnoBoja = "#64e764";

function getData(){
    let selectDan = document.getElementById('dan');
    let selectTip = document.getElementById('tip');
    let selectGrupa = document.getElementById('grupa');

    while(div.firstChild) {
        div.removeChild(div.lastChild);                                                                                                 //Izbrisi sve prethodne predmete i aktivnosti
    }
    for(let i = 0; i < selectDan.length; i++) {
        selectDan.remove(i);
    }

    ajax.open('GET', 'http://localhost:3000/v2/predmeti', true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            predmeti = (JSON.parse(this.responseText));
            let p = document.createElement('p');
            p.append(document.createTextNode("Predmeti:"), document.createElement('br'));
            predmeti.forEach(item => p.append(document.createTextNode("Naziv: " + item.naziv), document.createElement('br')));          //Unosi predmet pa novi red
            div.appendChild(p);
        }
    }
    ajax.send()

    ajax = new XMLHttpRequest();
    ajax.open('GET', "http://localhost:3000/v2/aktivnosti", true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            aktivnosti = JSON.parse(this.responseText);
            let p = document.createElement('p');
            p.append(document.createTextNode("Aktivnosti: "), document.createElement('br'));
            aktivnosti.forEach(item => p.append(document.createTextNode("Naziv: " + item.naziv + " Tip: " + item.tip.naziv + " Pocetak: " +   //Unosi aktivnost pa novi red
                                item.pocetak + " Kraj: " + item.kraj + " Dan: " + item.dan.naziv),document.createElement('br')));
            div.appendChild(p);
        }
    }
    ajax.send();

    ajax = new XMLHttpRequest();
    ajax.open('GET', "http://localhost:3000/v2/dani", true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            let dani = JSON.parse(this.responseText);
            dani.forEach(dan => {
                let option = document.createElement('option');
                option.value = dan.naziv;
                option.text = dan.naziv;
                selectDan.appendChild(option);
            });
        }
    }
    ajax.send();

    ajax = new XMLHttpRequest();
    ajax.open('GET', "http://localhost:3000/v2/tipovi", true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            let tipovi = JSON.parse(this.responseText);
            tipovi.forEach(tip => {
                let option = document.createElement('option');
                option.value = tip.naziv;
                option.text = tip.naziv;
                selectTip.appendChild(option);
            });
        }
    }
    ajax.send();

    ajax = new XMLHttpRequest();
    ajax.open('GET', "http://localhost:3000/v2/grupe", true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            let grupe = JSON.parse(this.responseText);
            grupe.forEach(grupa => {
                let option = document.createElement('option');
                option.value = grupa.naziv;
                option.text = grupa.naziv;
                selectGrupa.appendChild(option);
            });
        }
    }
    ajax.send();
}

function sendData() {
    var responseDiv = document.getElementById("response");                                                                              //Div za cuvanje odgovora
    var form = document.getElementById("forma");
    var formData = new FormData(form);
    var naziv = formData.get('naziv');
    var nazivPredmeta = formData.get('predmet');
    var grupa = formData.get('grupa');
    var tip = formData.get('tip');
    var pocetak = rijesiVrijeme(formData.get('pocetak'));                                                                               //Input time vraca format sat:minuta
    var kraj = rijesiVrijeme(formData.get('kraj'));
    var dan = formData.get('dan');

    while(responseDiv.firstChild) {
        responseDiv.removeChild(responseDiv.lastChild);                                                                                 //Obrisi sve prethodne odgovore
    }

    if(!pocetak || !kraj) {
        console.log("Ovdje udje prije iceg");
        //Nije napravljena aktivnost
        responseDiv.style.background=greskaBoja;
        responseDiv.appendChild(document.createTextNode("Aktivnost nije validna!"));
        form.reset();
        return;
    }
    obradaPredmeta(nazivPredmeta, function(response) {
        if(response == "Naziv predmeta postoji!" || response == "Uspješno dodan predmet!") {
            obradaAktivnost(naziv, tip, pocetak, kraj, dan, nazivPredmeta, grupa, function(responseAktivnost) {
                if(responseAktivnost == "Uspješno dodana aktivnost!") {
                    //Refresuj podatke
                    getData();
                    //Uspjesno napravljena aktivnost
                    responseDiv.style.background=uspjesnoBoja;
                    responseDiv.appendChild(document.createTextNode("Uspješno dodana aktivnost!"));
                }
                else {
                    //Obrisi predmet ako je napravljen
                    if(response == "Uspješno dodan predmet!") {
                        ajax = new XMLHttpRequest();
                        ajax.open('DELETE',"http://localhost:3000/v2/predmet/" + naziv, true);                   
                        ajax.send();
                    }
                    responseDiv.style.background=greskaBoja;
                    console.log("Ovdje udje jer ne valja predmet");
                    responseDiv.appendChild(document.createTextNode("Aktivnost nije validna!"));
                }
            });
        }
    });
    form.reset();
}

function obradaPredmeta(nazivPredmeta, callbackPredmet) {
    //Da li postoji predmet
    if(predmeti.filter(item => (item.naziv == nazivPredmeta)).length == 1) {
       callbackPredmet("Naziv predmeta postoji!");
    }
    else {
        ajax = new XMLHttpRequest();
        ajax.open('POST', "http://localhost:3000/v2/predmet", true);
        ajax.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                callbackPredmet(JSON.parse(this.responseText).message);
            }
            if(this.readyState == 4 && this.status != 200) {
                callbackPredmet("Ne moze se napraviti predmet");
            }
        }
        ajax.send("{\"naziv\":\"" + nazivPredmeta + "\"}");
    }
}

function obradaAktivnost(naziv, tip, pocetak, kraj, dan, callbackAktivnost) {
    ajax = new XMLHttpRequest();
    ajax.open('POST', "http://localhost:3000/v2/aktivnost", true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            callbackAktivnost(JSON.parse(this.response).message);
        }
    }
    ajax.send("{\"naziv\":\"" + naziv + "\",\"tip\":{\"naziv\":\"" + tip + "\"},\"pocetak\":" + parseFloat(pocetak) + ",\"kraj\":" + parseFloat(kraj) + ",\"dan\":{\"naziv:\"\"" + dan + "\"}, \"grupa\":{\"naziv\": " + grupa + "\"}}");
}

//Pretvaranje input time u vrijeme oblika sat.polaSata ili sat
function rijesiVrijeme(vrijeme) {
    let result = parseFloat(vrijeme.toString().substr(0,2));
    if(vrijeme.toString().substr(3) == "30") {
        result += 0.5
    }
    else if(vrijeme.toString().substr(3) != "00") {
        result = false;
    }
    return result;
}