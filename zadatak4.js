var ajax = new XMLHttpRequest();
var predmeti;
var aktivnosti;
var div = document.getElementById('container');

function getData(){

    while(div.firstChild) {
        div.removeChild(div.lastChild);                                                                                                 //Izbrisi sve prethodne predmete i aktivnosti
    }

    ajax.open('GET', 'http://localhost:3000/predmeti', true);
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
    ajax.open('GET', "http://localhost:3000/aktivnosti", true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            aktivnosti = JSON.parse(this.responseText);
            let p = document.createElement('p');
            p.append(document.createTextNode("Aktivnosti: "), document.createElement('br'));
            aktivnosti.forEach(item => p.append(document.createTextNode("Naziv: " + item.naziv + " Tip: " + item.tip + " Pocetak: " +   //Unosi aktivnost pa novi red
                                item.pocetak + " Kraj: " + item.kraj + " Dan: " + item.dan),document.createElement('br')));
            div.appendChild(p);
        }
    }
    ajax.send();
}

function sendData() {
    var responseDiv = document.getElementById("response");                                                                              //Div za cuvanje odgovora
    var form = document.getElementById("forma");
    var formData = new FormData(form);
    var naziv = formData.get('naziv');
    var tip = formData.get('tip');
    var pocetak = rijesiVrijeme(formData.get('pocetak'));                                                                               //Input time vraca format sat:minuta
    var kraj = rijesiVrijeme(formData.get('kraj'));
    var dan = formData.get('dan');

    while(responseDiv.firstChild) {
        responseDiv.removeChild(responseDiv.lastChild);                                                                                 //Obrisi sve prethodne odgovore
    }

    if(!pocetak || !kraj) {
        //Nije napravljena aktivnost
        responseDiv.style.background="#ff726f";
        responseDiv.appendChild(document.createTextNode("Aktivnost nije validna!"));
        form.reset();
        return;
    }
    obradaPredmeta(naziv, function(response) {
        if(response == "Naziv predmeta postoji!" || response == "Uspješno dodan predmet!") {
            obradaAktivnost(naziv, tip, pocetak, kraj, dan, function(responseAktivnost) {
                if(responseAktivnost == "Uspješno dodana aktivnost!") {
                    //Refresuj podatke
                    getData();
                    //Uspjesno napravljena aktivnost
                    responseDiv.style.background="#64e764";
                    responseDiv.appendChild(document.createTextNode("Uspješno dodana aktivnost!"));
                }
                else {
                    //Obrisi predmet ako je napravljen
                    if(response == "Uspješno dodan predmet!") {
                        ajax = new XMLHttpRequest();
                        ajax.open('DELETE',"http://localhost:3000/predmet/" + naziv, true);
                        ajax.onreadystatechange = function() {
                            if(this.readyState == 4 && this.status == 200) {
                                //Nije napravljena aktivnost
                            }
                        }
                        ajax.send();
                    }
                    responseDiv.style.background="#ff726f";
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
        ajax.open('POST', "http://localhost:3000/predmet", true);
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
    ajax.open('POST', "http://localhost:3000/aktivnost", true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            callbackAktivnost(JSON.parse(this.response).message);
        }
    }
    ajax.send("{\"naziv\":\"" + naziv + "\",\"tip\":\"" + tip + "\",\"pocetak\":" + parseFloat(pocetak) + ",\"kraj\":" + parseFloat(kraj) + ",\"dan\":\"" + dan + "\"}");
}

//Pretvaranje input time u vrijeme oblika sat.polaSata ili sat
function rijesiVrijeme(vrijeme) {
    let result;
    let trebaRazdvojiti = vrijeme.split(':');
    result = parseFloat(trebaRazdvojiti[0]);
    if(trebaRazdvojiti[1] == 30) {
        pocetak += 0.5;
    }
    else if(trebaRazdvojiti[1] != 00) {         //Pogresno unesen format vremena
        result = false;
    }
    return result;
}