const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const db = require('./spirala4/db.js');

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
    db.grupa.findAll().then(function(elements) {
        let returnData = [];
        elements.forEach(element => {
            returnData.push(element.dataValues);
        });
        res.json(returnData);
    });
});

app.get('/v2/grupa/:naziv', function(req, res) {
    db.grupa.findOne({where:{naziv:req.params.naziv}}).then(function(data) {
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
    db.grupa.findAll().then(function(elements) {
        let grupe = [];
        elements.forEach(grupa => {
            let studenti = [];
            grupa.getStudenti().then(function(data) {
                data.forEach(student => {
                    studenti.push(student.dataValues);
                });
                grupe.push({grupa:grupa.dataValues,studenti:studenti});
            });

        });
        res.json(grupe);
    });
});

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
    db.tip.findOne({where:{naziv:req.params.naziv}}.then(function(data) {
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
    db.aktivnost.findAll().then(function(elements) {
        let returnData = [];

        elements.forEach(aktivnost => {
            returnData.push(aktivnost.dataValues);
        });
        res.json(returnData);
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