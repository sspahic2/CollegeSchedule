const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const db = require('./spirala4/db.js')
const { Op } = require('sequelize');

//Prima se samo json input, svi ostali izbacuju error html
app.use(bodyParser.json({
    type: function() {
        return true;
    }
}));
//Zbog meni elemenata
app.use(express.static(path.join(__dirname, 'spirala1/zadatak1')));
app.use(express.static(path.join(__dirname, 'spirala1/zadatak2')));
app.use(express.static(path.join(__dirname, 'spirala1/zadatak3')));
app.use(express.static(path.join(__dirname, 'spirala1/zadatak4')));
app.use(express.static(path.join(__dirname, 'spirala2/zadatak1')));
app.use(express.static(path.join(__dirname, 'spirala2/zadatak2')));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

//**
    //GET
//**
app.get('/v1/raspored.html', function(req, res) {
    res.sendFile('./spirala1/zadatak1/raspored.html', {root: __dirname});
});
app.get('/v1/aktivnost.html', function(req, res) {
    res.sendFile('./spirala1/zadatak2/aktivnost.html', {root: __dirname});
});
app.get('/v1/planiranjeNastavnik.html', function(req, res) {
    res.sendFile('./spirala1/zadatak3/planiranjeNastavnik.html', {root: __dirname});
});
app.get('/v1/podaciStudent.html', function(req, res) {
    res.sendFile('./spirala1/zadatak4/podaciStudent.html', {root: __dirname});
});
app.get('/v1/spirala2raspored.html', function(req, res) {
    res.sendFile('./spirala2/zadatak1/spirala2rasporedi.html', {root: __dirname});
});
app.get('/v1/test.html', function(req, res) {
    res.sendFile('./spirala2/zadatak2/test.html', {root: __dirname});
});
app.get('/v1/unosRasporeda.html', function(req, res) {
    res.sendFile('unosRasporeda.html', {root: __dirname});
});

app.get('/v1/predmeti', function(req, res) {
    fs.readFile( __dirname + '/predmeti.txt', function(err, data) {
        if(err) throw err;
        let JSONtext = toJSONPredmet(data.toString('utf8'));
        res.json(JSONtext);
    });
});

app.get('/v1/aktivnosti', function(req, res) {
    fs.readFile(__dirname + '/aktivnosti.txt', function(err, data) {
        if(err) throw err;

        let JSONtext = toJSONAktivnost(data.toString('utf8'));
        res.json(JSONtext);
    });
});

app.get('/v1/predmet/:naziv/aktivnost', function(req, res) {
    fs.readFile(__dirname + '/aktivnosti.txt', function(err, data) {
        if(err) throw err;

        let JSONtext = toJSONAktivnost(data.toString('utf8'), req.params.naziv);
        res.json(JSONtext);
    });
});

app.get('/v2/predmeti', function(req, res) {
    var returnData = [];
    db.predmet.findAll().then(function(elements){
        (elements).forEach(element => {
            returnData.push(element.dataValues); 
        });
        res.json(returnData);
        return;
    });
});

app.get('/v2/predmet/:naziv', function(req, res) {
    let naziv = req.params.naziv;
    db.predmet.findOne({where:{naziv:naziv}}).then(function(data) {
        if(data) {
            res.json(data.dataValues);
        }
        else {
            res.json({});
        }
    });
});

app.get('/v2/predmet/:naziv/aktivnosti', function(req, res) {
    db.predmet.findOne({where:{naziv:req.params.naziv}}).then(function(data) {
        let resultData = [];
        data.getAktivnostiIzPredmeta().then(function(aktivnosti) {
            aktivnosti.forEach(element => {
                resultData.push(element.dataValues);
            });
            res.json(resultData);
        });
    });
});

app.get('/v2/predmet/:naziv/grupe', function(req, res) {
    db.predmet.findOne({where:{naziv:req.params.naziv}}).then(function(data) {
        let resultData = [];
        data.getGrupeNaPredmetu().then(function(grupe) {
            grupe.forEach(element => {
                resultData.push(element.dataValues);
            });
            res.json(resultData);
        });
    });
});

app.get('/v2/grupe', function(req, res) {
    db.grupa.findAll({include:[{model:db.predmet}]}).then(function(elements) {
        let returnData = [];
        elements.forEach(element => {
            returnData.push({id:element.dataValues.id, naziv:element.dataValues.naziv, predmet:element.dataValues.predmet});
        });
        res.json(returnData);
    });
});

app.get('/v2/grupa/:naziv', function(req, res) {
    db.grupa.findOne({where:{naziv:req.params.naziv}, include:[{model:db.predmet}]}).then(function(data) {
        if(data) {
            res.json(data.dataValues);
        }
        else {
            res.json({});
        }
    });
});

app.get('/v2/grupa/:naziv/aktivnosti', function(req, res) {
    db.grupa.findOne({where:{naziv:req.params.naziv}}).then(function(data) {
        data.getAktivnostiGrupe().then(function(elements) {
            let returnData = [];
            elements.forEach(element => {
                returnData.push(element.dataValues);
            });
            res.json(returnData);
        });
    });
});

app.get('/v2/grupe/studenti', function(req, res) {
    studentiIGrupe(res)
});

async function studentiIGrupe(res) {
    res.json(await db.grupa.findAll({include:[{model:db.student, as:"studenti"}]}));
}

app.get('/v2/dani', function(req, res) {
    db.dan.findAll().then(function(elements) {
        let returnData = [];
        elements.forEach(dan => {
            returnData.push(dan.dataValues);
        });
        res.json(returnData);
    });
});

app.get('/v2/dan/:naziv', function(req, res) {
    db.dan.findOne({where:{naziv:req.params.naziv}}).then(function(data) {
        if(data) {
            res.json(data.dataValues);
        }
        else {
            res.json({});
        }
    });
});

app.get('/v2/dan/:naziv/aktivnosti', function(req, res) {
    db.dan.findOne({where:{naziv:req.params.naziv}}).then(function(data) {
        let returnData = [];
        data.getAktivnostiUDanu().then(function(elements) {
            elements.forEach(aktivnost => {
                returnData.push(aktivnost.dataValues);
            });
            res.json(returnData);
        });
    });
});

app.get('/v2/tipovi', function(req, res) {
    db.tip.findAll().then(function(elements) {
        let returnData = [];
        elements.forEach(tip => {
            returnData.push(tip.dataValues);
        });
        res.json(returnData);
    });
});

app.get('/v2/tip/:naziv', function(req, res) {
    db.tip.findOne({where:{naziv:req.params.naziv}}).then(function(data) {
        if(data) {
            res.json(data.dataValues);
        }
        else {
            res.json({});
        }
    });
});

app.get('/v2/tip/:naziv/aktivnosti', function(req, res) {
    db.tip.findOne({where:{naziv:req.params.naziv}}).then(function(data) {
        let returnData = [];
        data.getAktivnostiUDanu().then(function(elements) {
            elements.forEach(aktivnost => {
                returnData.push(aktivnost.dataValues);
            });
            res.json(returnData);
        });
    });
});

app.get('/v2/aktivnosti', function(req, res) {
    db.aktivnost.findAll({include:[{model:db.predmet}, {model:db.tip}, {model:db.dan}, {model:db.grupa}]}).then(function(elements) {
        let returnData = [];

        elements.forEach(aktivnost => {
            returnData.push({id:aktivnost.dataValues.id, naziv:aktivnost.dataValues.naziv, 
            pocetak:aktivnost.dataValues.pocetak, kraj:aktivnost.dataValues.kraj, predmet:aktivnost.dataValues.predmet, 
            grupa:aktivnost.dataValues.grupa, dan:aktivnost.dataValues.dan, tip:aktivnost.dataValues.tip});
        });
        res.json(returnData);
    });
});

app.get('/v2/studenti', function(req, res) {

    db.student.findAll({include:[{model:db.grupa, as:"grupe"}]}).then(function(elements) {
        let studenti = [];
        elements.forEach(student => {
            let grupe = [];
            student.dataValues.grupe.forEach(grupa => {
                grupe.push({id:grupa.id, naziv:grupa.naziv, predmetId:grupa.predmetId});
            });
            studenti.push({id:student.dataValues.id, naziv:student.dataValues.naziv, index:student.dataValues.index, grupe:grupe});
        });
        res.json(studenti);
    });
});

//**
    //POST
//**

app.post('/v1/predmet', function(req, res) {
    let body = req.body;
        fs.readFile(__dirname + '/predmeti.txt', function(err, data) {
            if(err) throw err;
            let noviRed = "";
            let JSONtext = toJSONPredmet(data.toString('utf8'));
            if(body.length > 1) {
                for(let i =  0; i < body.length; i++) {
                    noviRed += body[i]['naziv'] + "\n";
                }
            }
            else {noviRed = body['naziv'] + "\n";}
            

            (includes(JSONtext, body)) ? res.json({"message":"Naziv predmeta postoji!"}) : 
                fs.appendFile(__dirname + '/predmeti.txt', noviRed, function(err) {
                    if(err) throw err; 
                    res.json({message:"Uspješno dodan predmet!"});
                }); 
        });
});

app.post('/v1/aktivnost', function(req, res) {
    let body = req.body;
    let ok = true;

    if(body.pocetak >= body.kraj || !Number.isInteger(body.pocetak*2) || !Number.isInteger(body.kraj*2)) {
        res.json({message:"Aktivnost nije validna!"});
        ok = false;
        return;
    }
    fs.readFile(__dirname + "/aktivnosti.txt", function(err, data) {
        if(err) throw err;

        let JSONtext = toJSONAktivnost(data.toString('utf8'));
        for(let i = 0; i < JSONtext.length; i++) {
            let aktivnost = JSONtext[i];
            if(aktivnost.dan == body.dan) {
                if(aktivnost.pocetak <= body.pocetak && body.pocetak < aktivnost.kraj ||            //Ako se pocetak nove aktivnosti nalazi izmedju pocetka i kraja druge aktivnosti
                    body.kraj > aktivnost.pocetak && body.kraj <= aktivnost.kraj ||                 //Ako se kraj nove aktivnosti nalazi izmedju pocetka i kraja druge aktivnosti
                    body.pocetak <= aktivnost.pocetak && aktivnost.pocetak < body.kraj ||           //Ako se pocetak druge aktivnosti nalazi izmedju pocetka i kraja nove aktivnosti
                    !(body.pocetak > 0  && body.pocetak < 24) || !(body.kraj > 0  && body.kraj < 24)) {                                                                             
                        res.json({message:"Aktivnost nije validna!"});
                        ok = false
                        return;
                    }
            }
        }
        if(ok) {
            let noviRed = body.naziv + "," + body.tip + "," + body.pocetak + "," + body.kraj + "," + body.dan + "\n";
            fs.appendFile(__dirname + "/aktivnosti.txt", noviRed, function(err) {
                if(err) throw err;
                res.json({message : "Uspješno dodana aktivnost!"});
            });
        }
    });
});

app.post('/v2/predmet', function(req, res) {
    let body = req.body;

    db.predmet.findOne({where:{naziv:body.naziv}}).then(function(data) {
        if(data) {
            res.json({message:"Predmet već postoji!"});
            return;
        }
        else {
            db.predmet.create({naziv: body.naziv}).then(function(){res.json({message:"Predmet uspješno kreiran!"})});
        }
    });
});

app.post('/v2/dan', function(req, res) {
    let body = req.body;

    db.dan.findOne({where:{naziv:body.naziv}}).then(function(data) {
        if(data) {
            res.json({message:"Dan već postoji!"});
            return;
        }
        else {
            db.dan.create({naziv: body.naziv}).then(function(){res.json({message:"Dan uspješno kreiran!"})});
        }
    });
});

app.post('/v2/tip', function(req, res) {
    let body = req.body;

    db.tip.findOne({where:{naziv:body.naziv}}).then(function(data) {
        if(data) {
            res.json({message:"Tip već postoji!"});
            return;
        }
        else {
            db.tip.create({naziv: body.naziv}).then(function(){res.json({message:"Tip uspješno kreiran!"})});
        }
    });
});

app.post('/v2/grupa', function(req, res) {
    db.grupa.findOne({where:{naziv:req.body.naziv}}).then(function(data) {
        if(!data) {
                db.predmet.findOne({where:{naziv:req.body.predmet.naziv}}).then(function(predmet) {
                    if(predmet) {
                        db.grupa.create({naziv:req.body.naziv}).then(function(grupa){
                            predmet.addGrupeNaPredmetu([grupa]).then(function(element) {
                                res.json({message:"Grupa uspješno kreirana!"});
                            });
                        });
                    }
                    else {
                    res.json({message:"Predmet ne postoji!"});
                    return;
                }
            });
        }
        else {
            res.json({message:"Grupa već postoji!"});
            return;
        }
    });
});

app.post('/v2/student', function(req, res) {

    db.student.findOne({where:{naziv:req.body.naziv}}).then(function(data) {
        if(data) {
            res.json({message:"Student sa tim imenom već postoji!"});
            return;
        }
        else {
            db.student.findOne({where:{index:req.body.index}}).then(function(element){
                if(element) {
                    res.json({message:"Student " + req.body.naziv + " nije kreiran jer postoji student " + element.naziv + " sa istim indeksom " + element.index});
                    return;
                }
                else {
                    db.grupa.findOne({where:{naziv:req.body.grupa.naziv}}).then(function(grupa) {
                        if(grupa) {
                            db.student.create({naziv:req.body.naziv, index:req.body.index}).then(function(output) {
                                output.addGrupe([grupa]);
                                res.json({message:"Student uspješno kreiran!"});
                                return;
                            });
                        }
                    });
                }
            });
        }
    });
});

app.post('/v2/aktivnost', function(req, res) {

    db.aktivnost.findAll({where:{[Op.or]:[{naziv:req.body.naziv}, {pocetak:req.body.pocetak}, {kraj:req.body.kraj}]}, include:[{model:db.dan}, {model:db.grupa}]}).then(function(aktivnosti) {
        if(provjeraValidacijeAktivnosti(aktivnosti, req.body.pocetak, req.body.kraj, req.body.dan.naziv, req.body.grupa.naziv)) {
            db.predmet.findOne({where:{naziv:req.body.predmet.naziv}}).then(function(predmet) {
                if(predmet) {
                    db.grupa.findOne({where:{naziv:req.body.grupa.naziv}}).then(function(grupa) {
                        if(grupa) {
                            db.dan.findOne({where:{naziv:req.body.dan.naziv}}).then(function(dan) {
                                if(dan) {
                                    db.tip.findOne({where:{naziv:req.body.tip.naziv}}).then(function(tip) {
                                        if(tip) {
                                            db.aktivnost.create({naziv:req.body.naziv, pocetak:req.body.pocetak, kraj:req.body.kraj}).then(function(output) {
                                                predmet.addAktivnostiIzPredmeta([output]);
                                                grupa.addAktivnostiGrupe([output]);
                                                dan.addAktivnostiUDanu([output]);
                                                tip.addAktivnostiTipa([output]);
                                                res.json({message:"Uspješno kreirana aktivnost!"});
                                                return;
                                            });
                                        }
                                        else {
                                            res.json({message:"Tip nije validan!"});
                                            return;
                                        }
                                    });
                                }
                                else {
                                    res.json({message:"Dan nije validan!"});
                                    return;
                                }
                            });
                        }
                        else {
                            res.json({message:"Grupa nije validna!"});
                            return;
                        }
                    });
                }
                else {
                    res.json({message:"Predmet nije validan!"});
                    return;
                }
            });
        }
        else {
            res.json({message:"Aktivnost već postoji ili nije unesena validna aktivnost!"});
            return;
        }
    });
});

//**
    //DELETE
//**

app.delete('/v1/aktivnost/:naziv', function(req, res) {
    var JSONtext;
    let naziv = req.params.naziv
    fs.readFile(__dirname + "/aktivnosti.txt", function(err, data) {
        JSONtext = toJSONAktivnost(data.toString("utf8"));
        let temp = [];
        for(let i=0; i<JSONtext.length; i++) {
            if(JSONtext[i].naziv != naziv) {
                temp.push(JSONtext[i]);
            }
        }
        if(temp.length != JSONtext.length) {
            let tekst = "";
            for(let i = 0; i < temp.length; i++) {
                tekst += temp[i].naziv + "," + temp[i].tip + "," + temp[i].pocetak + "," + temp[i].kraj + "," + temp[i].dan + "\n";
            }
            res.json({message:"Uspješno obrisana aktivnost!"});
            fs.writeFile(__dirname + "/aktivnosti.txt", tekst, function(err) {
                if(err) throw err;
            });
        }
        else {
            res.json({message:"Greška - aktivnost nije obrisana!"});
        }
    });

});

app.delete('/v1/predmet/:naziv', function(req, res) {
    var JSONtext;
    let naziv = req.params.naziv
    fs.readFile(__dirname + "/predmeti.txt", function(err, data) {
        JSONtext = toJSONPredmet(data.toString("utf8"));
        let temp = [];
        for(let i=0; i<JSONtext.length; i++) {
            if(JSONtext[i].naziv != naziv) {
                temp.push(JSONtext[i]);
            }
        }
        if(temp.length != JSONtext.length) {
            let tekst = "";
            for(let i = 0; i < temp.length; i++) {
                tekst += temp[i].naziv + "\n";
            }
            res.json({message:"Uspješno obrisan predmet!"});
            fs.writeFile(__dirname + "/predmeti.txt", tekst, function(err) {
                if(err) throw err;
            });
        }
        else {
            res.json({message:"Greška - predmet nije obrisan!"});
        }
    });
});

app.delete('/v1/all', function(req, res) {
    fs.readFile(__dirname + "/aktivnosti.txt", function(err, data) {
        if(err) {
            res.json({message: "Greška - sadržaj datoteka nije moguće obrisati!"});
            return;
        }
        fs.readFile(__dirname + "/predmeti.txt", function(err, data) {
            if(err) {
                res.json({message: "Greška - sadržaj datoteka nije moguće obrisati!"});
                return;
            }
        });
    });
        fs.writeFile(__dirname + "/aktivnosti.txt", '', function(err) {
            if(err) {
                throw err;
            }
        });

        fs.writeFile(__dirname + "/predmeti.txt", '', function(err) {
            if(err) {
                throw err;
            }
        });

    res.json({message: "Uspješno obrisan sadržaj datoteka!"});
});

app.delete('/v2/predmet/:id', function(req, res) {
    db.predmet.findOne({where:{id:req.params.id}}).then(function(predmet) {
        if(predmet) {
            predmet.destroy();
            res.json({message:"Uspješno obrisan predmet!"});
            return;
        }
        res.json({message:"Predmet nije validan!"});
    });
});

app.delete('/v2/predmet/:naziv', function(req, res) {
    db.predmet.findOne({where:{naziv:req.params.naziv}}).then(function(predmet) {
        if(predmet) {
            predmet.destroy();
            res.json({message:"Uspješno obrisan predmet!"});
            return;
        }
        res.json({message:"Predmet nije validan!"});
    });
});

app.delete('/v2/dan/:id', function(req, res) {
    db.dan.findOne({where:{id:req.params.id}}).then(function(dan) {
        if(dan) {
            dan.destroy();
            res.json({message:"Uspješno obrisan dan!"});
            return;
        }
        res.json({message:"Dan nije validan!"});
    });
});

app.delete('/v2/tip/:id', function(req, res) {
    db.tip.findOne({where:{id:req.params.id}}).then(function(tip) {
        if(tip) {
            tip.destroy();
            res.json({message:"Uspješno obrisan tip!"});
            return;
        }
        res.json({message:"Tip nije validan!"});
    });
});

app.delete('/v2/student/:id', function(req, res) {
    db.student.findOne({where:{id:req.params.id}}).then(function(student) {
        if(student) {
            student.destroy();
            res.json({message:"Uspješno obrisan student!"});
            return;
        }
        res.json({message:"Student nije validan!"});
    });
});

app.delete('/v2/grupa/:id', function(req, res) {
    db.grupa.findOne({where:{id:req.params.id}}).then(function(grupa) {
        if(grupa) {
            grupa.destroy();
            res.json({message:"Uspješno obrisana grupa!"});
            return;
        }
        res.json({message:"Grupa nije validan!"});
    });
});

app.delete('/v2/aktivnost/:id', function(req, res) {
    db.aktivnost.findOne({where:{id:req.params.id}}).then(function(aktivnost) {
        if(aktivnost) {
            aktivnost.destroy();
            res.json({message:"Uspješno obrisana aktivnost!"});
            return;
        }
        res.json({message:"Predmet nije validan!"});
    });
});

//**
    //PUT
//**
app.put('/v2/student/:id', function(req, res) {
    db.student.findOne({where:{index:req.body.index}}).then(function(student) {
        if(student) {
            if(student.dataValues.id == req.params.id) {
                db.student.update(req.body, {where:{id:req.params.id}}).then(function(output) {
                    if(output[0]) {
                        res.json({message:"Uspješno ažuriran student!"});
                        return;
                    }
                    res.json({message:"Student nije validan!"});
                });
            }
            else {
                res.json({message:"Student sa tim indeksom već postoji!"});
            }
        }
        else {
            db.student.update(req.body, {where:{id:req.params.id}}).then(function(output) {
                if(output[0]) {
                    console.log(output);
                    res.json({message:"Uspješno ažuriran student!"});
                    return;
                }
                res.json({message:"Student nije validan!"});
            });
        }
    });
});

app.put('/v2/predmet/:id', function(req, res) {
    db.predmet.findOne({where:{naziv:req.body.naziv}}).then(function(predmet) {
        if(predmet) {
            if(predmet.dataValues.id == req.params.id) {
                db.predmet.update(req.body, {where:{id:req.params.id}}).then(function(output) {
                    if(output[0]) {
                        res.json({message:"Uspješno ažuriran predmet!"});
                        return;
                    }
                    res.json({message:"Predmet nije validan!"});
                });
            }
            else {
                res.json({message:"Predmet sa tim nazivom već postoji!"});
                return;
            }
        }
        else {
            db.predmet.update(req.body, {where:{id:req.params.id}}).then(function(output) {
                if(output[0]) {
                    res.json({message:"Uspješno ažuriran predmet!"});
                    return;
                }
                res.json({message:"Predmet nije validan!"});
            });
        }
    });
});

app.put('/v2/grupa/:id', function(req, res) {
    db.grupa.findOne({where:{naziv:req.body.naziv}}).then(function(grupa) {
        if(grupa) {
            if(grupa.dataValues.id == req.params.id) {
                    db.grupa.update(req.body, {where:{id:req.params.id}}).then(function(azuriranaGrupa) {
                        if(azuriranaGrupa[0]) {
                            res.json({message:"Uspješno ažurirana grupa!"});
                            return;
                        }
                        else {
                            res.json({message:"Grupa nije validna!"});
                        }
                    }).catch(function(err) {res.json({message:"Unesen je nevalidan id za predmet i/ili grupu!"})});
            }
            else {
                res.json({message:"Postoji grupa sa nazivom " + req.body.naziv + ", a sa drugim id-em!"});
                return;
            }
        }
        else {
            db.grupa.update(req.body, {where:{id:req.params.id}}).then(function(azuriranaGrupa) {
                if(azuriranaGrupa[0]) {
                    res.json({message:"Uspješno ažurirana grupa!"});
                    return;
                }
                else {
                    res.json({message:"Grupa nije validna!"});
                }
            }).catch(function(err) {res.json({message:"Unesen je nevalidan id za predmet i/ili grupu!"})});
        }
    });
});

app.put('/v2/tip/:id', function(req, res) {
    db.tip.update(req.body, {where:{id:req.params.id}}).then(function(output) {
        if(output[0]) {
            res.json({message:"Uspješno ažuriran tip!"});
        }
        else {
            res.json({message:"Tip nije validan!"});
        }
    });
});

app.put('/v2/dan/:id', function(req, res) {
    db.dan.update(req.body, {where:{id:req.params.id}}).then(function(output) {
        if(output[0]) {
            res.json({message:"Uspješnp ažuriran dan!"});
        }
        else {
            res.json({message:"Dan nije validan!"});
        }
    });
});

app.put('/v2/aktivnost/:id',function(req, res) {
    db.aktivnost.findAll({where:{danId:req.body.danId}}).then(function(aktivnosti) {
        aktivnosti.forEach(aktivnost => {
            if(aktivnost.pocetak <= req.body.pocekta && req.body.pocetak < aktivnost.kraj ||
                req.body.kraj > aktivnost.pocetak && req.body.kraj <= aktivnost.kraj ||
                req.body.pocetak <= aktivnost.pocetak && aktivnost.pocetak < req.body.kraj ||
                aktivnost.pocetak == req.body.pocetak  && aktivnost.kraj == req.body.kraj) {
                    res.json({message:"Aktivnost nema validno početno ili krajnje vrijeme!"});
                    return;    
                }
            
        });

        db.aktivnost.update(req.body, {where:{id:req.body.id}}).then(function(output) {
            if(output[0]) {
                res.json({message:"Uspješno ažurirana aktivnost!"});
            }
            else {
                res.json({message:"Aktivnost nije validna!"});
            }
        }).catch(function(err){res.json({message:"Nepravilan id aktivnosti!"})});
    }).catch(function(err){res.json({message:"Nepravilno unesen id (ili više njih) u aktivnosti!"})});
});

app.listen(3000);

//Provjerava da li se nalazi predmet u predmetima.txt
//Takodjer prima niz predmeta
function includes(a, b) {
    if(b.length > 1) {
        for(let i in a) {
            for(let j in b) {
                if(a[i].naziv === b[j].naziv) {
                    return true;
                }
            }
        }
    }
    else {
        for(let i in a) {
            if(a[i].naziv === b.naziv) {
                return true;
            }
        }
    }
    return false;
}

function toJSONAktivnost(text = "", naziv="") {
    const lines = text.split('\n');
    var array = [];
    if(lines[0] == '') {
        return array;
    }

    for(let i in lines) {
        var aktivnosti = lines[i].split(',');
        if(aktivnosti != '') {
            let obj = {};
            obj["naziv"] = aktivnosti[0].trim();
            obj["tip"] = aktivnosti[1].trim();
            obj["pocetak"] = parseFloat(aktivnosti[2].trim());
            obj["kraj"] = parseFloat(aktivnosti[3].trim());
            obj["dan"] = aktivnosti[4].trim();
            array.push(obj);
        }
    }

    array = (naziv) ? array.filter(object => object.naziv.toLowerCase() === naziv.toLowerCase()) : array;
    return array;
}

function toJSONPredmet(text = "") {
    const lines = text.split('\n');
    var array = [];

    for(let i in lines) {
        let ociscen = lines[i].trim();
        if(ociscen != '') {
            let obj = {"naziv":ociscen};
            array.push(obj);
        }
    }
    return (array);
}

function provjeraValidacijeAktivnosti(aktivnosti, pocetakAktivnosti, krajAktivnosti, nazivDana, nazivGrupe) {

    if(!(pocetakAktivnosti > 0  && pocetakAktivnosti < 24) || !(krajAktivnosti > 0  && krajAktivnosti < 24) ||
         pocetakAktivnosti >= krajAktivnosti || !Number.isInteger(pocetakAktivnosti*2) || !Number.isInteger(krajAktivnosti*2)) {
        return false;
    }
    var ok = true;
    aktivnosti.forEach(aktivnost => {
        if(aktivnost.dataValues.dan.dataValues.naziv == nazivDana) {
            if(aktivnost.dataValues.grupa.dataValues.naziv == nazivGrupe) {
                if(aktivnost.pocetak <= pocetakAktivnosti && pocetakAktivnosti < aktivnost.kraj ||
                    krajAktivnosti > aktivnost.pocetak && krajAktivnosti <= aktivnost.kraj ||
                    pocetakAktivnosti <= aktivnost.pocetak && aktivnost.pocetak < krajAktivnosti ||
                    aktivnost.pocetak == pocetakAktivnosti  && aktivnost.kraj == krajAktivnosti) {
                        ok = false;
                    }
            }
        }
    });
    return ok;
}