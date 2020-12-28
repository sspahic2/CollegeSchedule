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

app.listen(3000);