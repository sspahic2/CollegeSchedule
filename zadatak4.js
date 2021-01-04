var ajax = new XMLHttpRequest();
var predmeti;
var aktivnosti;
var div = document.getElementById('container');

function getData(){

    while(div.firstChild) {
        div.removeChild(div.lastChild);
    }

    ajax.open('GET', 'http://localhost:3000/predmeti', true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            predmeti = (JSON.parse(this.responseText));
            let p = document.createElement('p');
            p.append(document.createTextNode("Predmeti:"), document.createElement('br'));
            predmeti.forEach(item => p.append(document.createTextNode("Naziv: " + item.naziv), document.createElement('br')));
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
            aktivnosti.forEach(item => p.append(document.createTextNode("Naziv: " + item.naziv + " Tip: " + item.tip + " Pocetak: " + 
                                item.pocetak + " Kraj: " + item.kraj + " Dan: " + item.dan),document.createElement('br')));
            div.appendChild(p);
        }
    }
    ajax.send();
}

function sendData() {
    var responseDiv = document.getElementById("response");
    var form = document.getElementById("forma");
    var formData = new FormData(form);
    var naziv = formData.get('naziv');
    var tip = formData.get('tip');
    var pocetak = rijesiVrijeme(formData.get('pocetak'));
    var kraj = rijesiVrijeme(formData.get('kraj'));
    var dan = formData.get('dan');

    while(responseDiv.firstChild) {
        responseDiv.removeChild(responseDiv.lastChild);
    }

    if(!pocetak || !kraj) {
        //Nije napravljena aktivnost
        responseDiv.style.background="#ff726f";
        responseDiv.appendChild(document.createTextNode("Nije unesena aktivnost!"));
        form.reset();
        return;
    }
    obradaPredmeta(naziv, function(response) {
        if(response == "Nije napravljen predmet" || response == "Jeste napravljen predmet") {
            obradaAktivnost(naziv, tip, pocetak, kraj, dan, function(responseAktivnost) {
                if(responseAktivnost == "Jeste napravljen") {
                    //Refresuj podatke
                    getData();
                    //Uspjesno napravljena aktivnost
                    responseDiv.style.background="#64e764";
                    responseDiv.appendChild(document.createTextNode("Uspjesno unesena aktivnost!"));
                }
                else {
                    //Obrisi predmet ako je napravljen
                    if(response == "Jeste napravljen") {
                        ajax = new XMLHttpRequest();
                        ajax.open('DELETE',"http://localhost:3000/predmet/" + naziv, true);
                        ajax.onreadystatechange = function() {
                            if(this.readyState == 4 && this.status == 200) {
                                //Nije napravljena aktivnost
                                responseDiv.style.background="#ff726f";
                                responseDiv.appendChild(document.createTextNode("Nije unesena aktivnost!"));
                            }
                        }
                        ajax.send();
                    }
                }
            });
        }
    });
    form.reset();
}

function obradaPredmeta(nazivPredmeta, callbackPredmet) {
    //Da li postoji predmet
    if(predmeti.filter(item => (item.naziv == nazivPredmeta)).length == 1) {

       callbackPredmet("Nije napravljen predmet");
    }
    else {
        ajax = new XMLHttpRequest();
        ajax.open('POST', "http://localhost:3000/predmet", true);
         ajax.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                callbackPredmet("Jeste napravljen predmet");
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
            if(JSON.stringify(JSON.parse(this.response)) == "{\"message\":\"Uspješno dodana aktivnost!\"}") {
                console.log(this.responseText + " To je odavdje true aktivnost");
                callbackAktivnost("Jeste napravljen");
            }
            else {
                console.log(this.responseText + " To je odavdje false aktivnost");
                callbackAktivnost("Nije napravljen");
            }
        }
    }
    ajax.send("{\"naziv\":\"" + naziv + "\",\"tip\":\"" + tip + "\",\"pocetak\":" + parseFloat(pocetak) + ",\"kraj\":" + parseFloat(kraj) + ",\"dan\":\"" + dan + "\"}");
}

function rijesiVrijeme(vrijeme) {
    let result;
    let trebaRazdvojiti = vrijeme.split(':');
    result = parseFloat(trebaRazdvojiti[0]);
    if(trebaRazdvojiti[1] == 30) {
        pocetak += 0.5;
    }
    else if(trebaRazdvojiti[1] != 00) {
        result = false;
    }
    return result;
}