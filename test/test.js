var assert = require('assert');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var fs = require('fs');
var path = require('path');
describe('API', function() {
    let podaci = fs.readFileSync(path.resolve("testniPodaci.txt"));
    let text = podaci.toString("utf8");
            let lines = text.split('\n');
            lines.forEach(function(test) {
                var dvaBloka = test.split(/\[(.*?)\]/);
                console.log(dvaBloka);
                dvaBloka = dvaBloka.filter(item => !(item == '\r'));
                console.log(dvaBloka);
                let operacija;
                let ruta;
                let ulaz;
                let izlaz;
                if(dvaBloka.length == 1) {
                    let data = dvaBloka[0].split(/{([^}]+)}/);
                    data = data.filter(item => !(item == "," || item == ""));
                    data = data.filter(item => !(item == '\r'));
                    if(data.length == 2) {
                        let operacijaRutaUlaz = data[0].split(",");
                        operacija = operacijaRutaUlaz[0];
                        ruta = operacijaRutaUlaz[1];
                        ulaz = operacijaRutaUlaz[2];
                        izlaz = "{" + data[1] + "}";
                    }
                    else if(data.length == 3) {
                        let operacijaRuta = data[0].split(",");
                        operacija = operacijaRuta[0];
                        ruta = operacijaRuta[1];
                        ulaz = "{" + data[1] + "}";
                        izlaz = "{" + data[2] + "}";
                    }
                }
                else {
                    let data = dvaBloka[0].split(/{([^}]+)}/);
                    data = data.filter(item => !(item == "," || item == ""));
                    data = data.filter(item => !(item == '\r'));
                    if(data.length == 1) {
                        let operacijaRutaUlaz = data[0].split(",");
                        operacija = operacijaRutaUlaz[0];
                        ruta = operacijaRutaUlaz[1];
                        ulaz = operacijaRutaUlaz[2];
                    }
                    else if(data.length == 2) {
                        let operacijaRuta = data[0].split(",");
                        operacija = operacijaRuta[0];
                        ruta = operacijaRuta[1];
                        ulaz = "{" + data[1] + "}";
                    }
                    izlaz = "[" + dvaBloka[1] + "]";
                }
                describe(operacija + " "  + ruta , function() {
                    this.timeout(5000);
                    it("Testiranje " + ruta + " " + ulaz, function() {
                        var ajax = new XMLHttpRequest();
                        ajax.open(operacija, "http://localhost:3000"+ruta, false);
                        ajax.onreadystatechange = function() {
                            if(ajax.readyState == 4 && ajax.status == 200) {
                                assert.strictEqual(JSON.stringify(JSON.parse(this.responseText)), izlaz);
                            }
                        }
                        if(ulaz != "null") {
                            ajax.send(ulaz);
                        }
                        else {
                            ajax.send();
                        }
                    });
                });
            });
    });