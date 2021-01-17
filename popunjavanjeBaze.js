const db = require('./spirala4/db.js');

db.sequelize.sync({force:true}).then(function(){
    inicijaliziraj().then(function(){
        console.log("Uspjesno kreirane tabele!");
        process.exit();
    });
});

function inicijaliziraj() {
    return new Promise(function(resolve, reject) {


        let aktivnosti = [];
            aktivnosti.push(db.aktivnost.create({naziv:"WT predavanje", pocetak:9, kraj:12}));
            aktivnosti.push(db.aktivnost.create({naziv:"WT vjezba", pocetak:10.5, kraj:12}));
        Promise.all(aktivnosti).then(function(aktivnost) {
            let wtPredavanje = aktivnost[0];
            let wtVjezba = aktivnost[1];
            db.predmet.create({naziv:"WT"}).then(function(data) {
                data.setAktivnostiIzPredmeta([wtPredavanje, wtVjezba]);
                return new Promise(function(resolve, reject){resolve(data);});
            });
        }).catch(function(err){console.log("Greska u aktivnostima: " + err);});

    }).catch(function(err){console.log("Greska povratka podataka: " + err)});
}