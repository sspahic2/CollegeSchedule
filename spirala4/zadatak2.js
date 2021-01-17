var ajax = new XMLHttpRequest();
var div = document.getElementsByTagName('div')[0];
var grupe = [];

function loadGrupe() {
    let select = document.getElementById('select');
    for(let i = 0; i < select.length; i++) {
        select.remove(i);
    }
    ajax = new XMLHttpRequest();
    ajax.open('GET', 'http://localhost:3000/v2/grupe', true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            grupe = JSON.parse(this.responseText);
            grupe.forEach(grupa => {
                let option = document.createElement('option');
                option.value = grupa.naziv + "/" + grupa.predmet.naziv;
                option.innerHTML = grupa.naziv + "/" + grupa.predmet.naziv;
                select.appendChild(option);
            });
        }
    }
    ajax.send();
}

function sendData() {
    let novaGrupa = document.getElementById('textGrupa');
    let novaGrupaText = novaGrupa.value;
    let noviStudenti = document.getElementById('area');
    let noviPredmet = document.getElementById('textPredmet');
    let noviPredmetText = noviPredmet.value;
    let lines = noviStudenti.value.split('\n');
    noviStudenti.value = "";
    lines.forEach(student => {
        let temp = student.split(",");
        let naziv = temp[0];
        let index = temp[1];
        if(naziv != "" && index != undefined && index != "") {
            if(novaGrupaText != "" && noviPredmetText != "") {
                dodajGrupu(novaGrupaText, noviPredmetText, function(response) {
                    if(response.message == "Grupa uspješno kreirana!") {
                        loadGrupe();
                        
                        dodajStudenta(naziv, index, novaGrupaText, function(res) {
                            if(res.message != "Student uspješno kreiran!") {
                                noviStudenti.value += res.message + "\n";
                            }
                        });
                    }
                    else {
                        noviStudenti.value += response.message + "\n";
                    }
                });
            }
            else {
                let selektovanaGrupa = document.getElementById('select').value.split('/');
                dodajStudenta(naziv, index, selektovanaGrupa[0], function(response) {
                    console.log(response.message);
                    if(response.message != "Student uspješno kreiran!") {
                        noviStudenti.value += response.message + "\n";
                    }
                });
            }
        }
    });
    return false;
}

function dodajGrupu(grupa, predmetNaziv, callback) {
    ajax = new XMLHttpRequest();
    ajax.open('POST', 'http://localhost:3000/v2/grupa', true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            callback(JSON.parse(this.responseText));
        }
    }
    ajax.send("{\"naziv\":\"" + grupa + "\", \"predmet\":{\"naziv\":\"" + predmetNaziv + "\"} }");
}

function dodajStudenta(naziv, index, grupa, callback) {
    ajax = new XMLHttpRequest();
    ajax.open('POST', 'http://localhost:3000/v2/student', true);
    ajax.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            callback(JSON.parse(this.responseText));
        }
    }
    ajax.send("{\"naziv\":\"" + naziv + "\", \"index\":\"" + index + "\", \"grupa\":{\"naziv\":\"" + grupa + "\"}}");
}

