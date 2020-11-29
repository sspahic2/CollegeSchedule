let assert = chai.assert;

describe('Tabela', function() {
    describe('iscrtajRaspored()', function() {
        it('treba iscrtati raspored velicine 6, 27', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 8, 21);

            let tabela = okvir.getElementsByTagName("table")[0];
            let redovi = tabela.rows;
            let kolonaObaveza = redovi[1].cells;
            assert.equal(redovi.length, 6, "Broj redova treba biti 6");
            assert.equal(kolonaObaveza.length, 27, "Broj kolona treba biti 27");
            let kolonaSati = redovi[0].cells;
            assert.equal(kolonaSati.length, 20, "Broj kolona u prvom redu treba biti 20");
        });

        it('prvi sat treba biti 10:00, a posljednji 21:00', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 9, 23);

            let tabela = okvir.getElementsByTagName("table")[1];
            if(tabela == undefined) {
                tabela = okvir.getElementsByTagName("table")[0];
            }
            let redovi = tabela.rows;
            let prviRed = redovi[0].cells;

            let prviSat = prviRed[2];
            let posljednjiSat = prviRed[19];
            assert.equal(prviSat.innerHTML, '10:00', "Treba biti 10 sati");
            assert.equal(posljednjiSat.innerHTML, '21:00', "Treba biti 9 sati navecer");
        });

        it('treba izbaciti eror', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], -1, 12);

            let vrijednost = okvir.innerHTML;
            assert.equal(vrijednost.substr(vrijednost.length-6, 6), 'Greška', "Treba ispisati grešku");
        });

        it('treba izbaciti eror zbog netacnog vremena', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 11, 12.5);

            let vrijednost = okvir.innerHTML;
            assert.equal(vrijednost.substr(vrijednost.length-6, 6), 'Greška', "Treba ispisati grešku jer vrijeme nije cijel broj");

            Tabela.iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 15, 11);
            assert.equal(vrijednost.substr(vrijednost.length-6, 6), 'Greška', "Treba ispisati grešku jer kraj nije veci od pocetka");
        });

        it('red sa satovima treba biti prazan', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 13, 14);

            let tabela = okvir.getElementsByTagName("table")[2];
            if(tabela == undefined) {
                tabela = okvir.getElementsByTagName("table")[0];
            }
            let redovi = tabela.rows;
            let prviRed = redovi[0].cells;
            let empty = true;
            for(let celija of prviRed) {
                if(celija.className != '') {
                    empty = false;
                    break;
                }
            }

            assert.equal(empty, true, "Ne treba biti ni jedan sat");
        });

        it('treba se praviti tabela i sa razlicitim danima', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Ponedeljak","Ustorak","Wednesday","Cetvrtak","Subota"], 10, 19);

            let tabela = okvir.getElementsByTagName("table")[3];
            if(tabela == undefined) {
                tabela = okvir.getElementsByTagName("table")[0];
            }
            let redovi = tabela.rows;

            assert.equal(redovi.length, 6, "Trebalo bi biti 6 redova");
        });

        it('treba izbaciti alert ako nije pravilno unesen okvir', function() {
            let okvir = document.getElementById("moća");
            Tabela.iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 2, 7);
            //Treba brzo pritisnuti ok na alertu, tacnije brze od 2s, kako bi test funkcionisao
            let bool = false;
            assert.equal(bool, true, "Uzrokuje pad testa, jer i treba pasti");
           });

        it('tabela se treba normalno kreirati', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 0, 23);
            let tabela = okvir.getElementsByTagName("table")[4];
            if(tabela == undefined) {
                tabela = okvir.getElementsByTagName("table")[0];
            }
            let kolona = tabela.rows[1].cells;

            assert.equal(kolona.length, 47, "Treba biti 46 celija u tabeli, ukljucujuci i celiju za dan");
        });

        it('moze se napraviti tabela i sa manje od 5 dana', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Subota","Nedjelja"], 5, 17);
            let tabela = okvir.getElementsByTagName("table")[5];
            if(tabela == undefined) {
                tabela = okvir.getElementsByTagName("table")[0];
            }
            let redovi = tabela.rows;
            assert.equal(redovi.length, 3, "Dva dana i red za sate");
        });

        it('Netacna postavka', function() {
            let okvir = document.getElementById("mocha");
            Tabela.iscrtajRaspored(okvir, ["Subota","Nedjelja"], 23, 0);
            let tabela = okvir.getElementsByTagName("table")[6];
            if(tabela == undefined) {
                tabela = okvir.getElementsByTagName("table")[0];
            }
            let vrijednost = okvir.innerHTML;
            assert.equal(vrijednost.substr(vrijednost.length-6, 6), 'Greška', "Treba ispisati grešku jer bi pravilan unos bio 0,23");
        });
    });
    describe('dodajAktivnost()', function() {
        it('Normalna aktivnost', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "WT", "predavanje", 9, 9.5, "Srijeda");
        });

        it('Pogresno unesen dan', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "WT", "predavanje", 9, 9.5, "Cetvrtak");
            let bool = false;
            assert.equal(bool, true, "Uzrokuje pad testa, jer i treba pasti");
        });

        it('Popunimo citav red', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "DM", "predavanje", 8, 21, "Ponedjeljak");
        });

        it('Termin je vec zauzet', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "RA", "predavanje", 13, 16, "Ponedjeljak");
            let bool = false;
            assert.equal(bool, true, "Uzrokuje pad testa, jer i treba pasti");
        });

        it('Pogresno uneseno vrijeme', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "DM", "vjezbe", 19, 21.5, "Utorak");
            let bool = false;
            assert.equal(bool, true, "Uzrokuje pad testa, jer i treba pasti");
        });

        it('Nasumicno popunimo termine', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "RMA", "predavanje", 9, 12, "Utorak");
            Tabela.dodajAktivnost(okvir, "WT", "vjezbe", 15, 17, "Utorak");
            Tabela.dodajAktivnost(okvir, "OOI", "predavanje", 12, 15, "Srijeda");
            Tabela.dodajAktivnost(okvir, "LD", "vjezbe", 16, 17, "Srijeda");
            Tabela.dodajAktivnost(okvir, "OS", "predavanje", 9, 12, "Petak");
            Tabela.dodajAktivnost(okvir, "SP", "vjezbe", 18, 20, "Petak");
            Tabela.dodajAktivnost(okvir, "VVS", "predavanje", 14, 16, "Petak");
        });

        it('Kraj vrijeme se poklapa sa terminom', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "RMA", "vjezbe", 10, 13, "Srijeda");
            let bool = false;
            assert.equal(bool, true, "Uzrokuje pad testa, jer i treba pasti");
        });

        it('Pocetak vrijeme se poklapa sa terminom', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "OOI", "vjezbe", 19, 21, "Petak");
            let bool = false;
            assert.equal(bool, true, "Uzrokuje pad testa, jer i treba pasti");
        });

        it('Pocetak i kraj se nalaze unutar rezervisanog termina', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "LD", "predavanje", 14, 17, "Ponedjeljak");
            let bool = false;
            assert.equal(bool, true, "Uzrokuje pad testa, jer i treba pasti");
        });

        it('Negativno uneseno vrijeme', function() {
            let okvir = document.getElementById("mocha");
            Tabela.dodajAktivnost(okvir, "VVS", "vjezbe", -16, 18, "Četvrtak");
            let bool = false;
            assert.equal(bool, true, "Uzrokuje pad testa, jer i treba pasti");
        });
    });
});