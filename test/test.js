var assert = require('assert');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var fs = require('fs');
var path = require('path');
describe('API', function() {
    let podaci = fs.readFileSync(path.resolve("testniPodaci.txt"));
    let text = podaci.toString("utf8");
            let lines = text.split('\n');
            lines.forEach(function(test) {
                var dvaBloka = test.split(/\[(.*?)\]/);                                                        //Regex za razdvajanje svega sto se nalazi izmedju []
                dvaBloka = dvaBloka.filter(item => !(item == '\r'));
                let operacija;
                let ruta;
                let ulaz;
                let izlaz;
                if(dvaBloka.length == 1) {                                                                     //U slucaju da izlaz nije array
                    let data = dvaBloka[0].split(/{([^}]+)}/);                                                 //Regex za razdvajanje svega sto se nalazi izmedju {}
                    data = data.filter(item => !(item == ","));
                    data = data.filter(item => !(item == '\r'));
                    if(data.length == 2) {                                                                     //Slucaj kada je ulaz null
                        let operacijaRutaUlaz = data[0].split(",");
                        operacija = operacijaRutaUlaz[0];
                        ruta = operacijaRutaUlaz[1];
                        ulaz = operacijaRutaUlaz[2];
                        izlaz = "{" + data[1] + "}";
                    }
                    else if(data.length >= 3) {                                                                //Slucaj kada je ulaz aktivnost ili predmet
                        let operacijaRuta = data[0].split(",");                                                //data[0] sadrzi samo operaciju i rutu
                        operacija = operacijaRuta[0];
                        ruta = operacijaRuta[1];
                        ulaz = "{" + data[1] + "}";                                                            //Dodaju se {} jer ih je regex izbacio
                        izlaz = "{" + data[2] + "}";
                    }
                }
                else {                                                                                         //Slucaj kada izlaz jeste array
                    let data = dvaBloka[0].split(/{([^}]+)}/);
                    data = data.filter(item => !(item == ","));
                    data = data.filter(item => !(item == '\r'));
                    if(data.length == 1) {                                                                     //Ulaz je null
                        let operacijaRutaUlaz = data[0].split(",");
                        operacija = operacijaRutaUlaz[0];
                        ruta = operacijaRutaUlaz[1];
                        ulaz = operacijaRutaUlaz[2];
                    }
                    else if(data.length == 2) {                                                                //Ulaz je aktivnost ili predmet
                        let operacijaRuta = data[0].split(",");
                        operacija = operacijaRuta[0];
                        ruta = operacijaRuta[1];
                        ulaz = "{" + data[1] + "}";
                    }
                    izlaz = "[" + dvaBloka[1] + "]";
                }
                describe(operacija + " "  + ruta , function() {
                    this.timeout(5000);                                                                        //Zbog prirode testova povecan timeout
                    it("Testiranje " + ruta + " " + ulaz, function() {
                        var ajax = new XMLHttpRequest();
                        ajax.open(operacija, "http://localhost:3000"+ruta, false);
                        ajax.onreadystatechange = function() {
                            if(ajax.readyState == 4 && ajax.status == 200) {
                                assert.strictEqual(JSON.stringify(JSON.parse(this.responseText)), izlaz);      //Na ovaj nacin se rjesavamo \" u this.responseText
                            }
                        }
                        if(ulaz != "null") {                                                                   //null je string nakon citanja testniPodaci
                            ajax.send(ulaz);
                        }
                        else {
                            ajax.send();
                        }
                    });
                });
            });
    });