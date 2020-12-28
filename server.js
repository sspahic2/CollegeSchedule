const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'spirala1/zadatak1')));
app.use(express.static(path.join(__dirname, 'spirala1/zadatak2')));
app.use(express.static(path.join(__dirname, 'spirala1/zadatak3')));
app.use(express.static(path.join(__dirname, 'spirala1/zadatak4')));
app.use(express.static(path.join(__dirname, 'spirala2/zadatak1')));
app.use(express.static(path.join(__dirname, 'spirala2/zadatak2')));
app.use(express.static(__dirname));
//app.use(express.static(path.join(__dirname, '/css')));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/raspored.html', function(req, res) {
    res.sendFile('./spirala1/zadatak1/raspored.html', {root: __dirname});
});
app.get('/aktivnost.html', function(req, res) {
    res.sendFile('./spirala1/zadatak2/aktivnost.html', {root: __dirname});
});
app.get('/planiranjeNastavnik.html', function(req, res) {
    res.sendFile('./spirala1/zadatak3/planiranjeNastavnik.html', {root: __dirname});
});
app.get('/podaciStudent.html', function(req, res) {
    res.sendFile('./spirala1/zadatak4/podaciStudent.html', {root: __dirname});
});
app.get('/spirala2raspored.html', function(req, res) {
    res.sendFile('./spirala2/zadatak1/spirala2rasporedi.html', {root: __dirname});
});
app.get('/test.html', function(req, res) {
    res.sendFile('./spirala2/zadatak2/test.html', {root: __dirname});
});

app.get('/predmeti', function(req, res) {
    fs.readFile( __dirname + '/predmeti.txt', function(err, data) {
        if(err) throw err;
        let JSONtext = toJSONPredmet(data.toString('utf8'));
        res.json(JSONtext);
    });
});
app.listen(3000);

app.get('/aktivnosti', function(req, res) {
    fs.readFile(__dirname + '/aktivnosti.txt', function(err, data) {
        if(err) throw err;

        let JSONtext = toJSONAktivnost(data.toString('utf8'));
        res.json(JSONtext);
    });
});

app.get('/predmet/:naziv/aktivnost', function(req, res) {
    fs.readFile(__dirname + '/aktivnosti.txt', function(err, data) {
        if(err) throw err;

        let JSONtext = toJSONAktivnost(data.toString('utf8'), req.params.naziv);
        res.json(JSONtext);
    });
});

function toJSONAktivnost(text = "", naziv="") {
    const lines = text.split('\n');
    var array = [];

    for(let i in lines) {
        var aktivnosti = lines[i].split(',');
        let obj = {};
        obj["naziv"] = aktivnosti[0].trim();
        obj["tip"] = aktivnosti[1].trim();
        obj["pocetak"] = parseFloat(aktivnosti[2].trim());
        obj["kraj"] = parseFloat(aktivnosti[3].trim());
        obj["dan"] = aktivnosti[4].trim();

        array.push(obj);
    }

    array = (naziv) ? array.filter(object => object.naziv.toLowerCase() === naziv.toLowerCase()) : array;
    return array;
}

function toJSONPredmet(text = "") {
    const lines = text.split('\n');
    var array = [];

    for(let i in lines) {
        let ociscen = lines[i].trim();
        let obj = {"naziv":ociscen};
        array.push(obj);
    }
    return (array);
}