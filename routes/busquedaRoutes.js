var express = require('express');

var app = express();

var Hospital = require('../models/hospitalModel');
var Medico = require('../models/medicoModel');
var User = require('../models/user');


// Búsqueda por colección
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsers(busqueda, regEx);
            break;
        case 'medico':
            promesa = buscarMedicos(busqueda, regEx);
            break;
        case 'hospital':
            promesa = buscarHospitales(busqueda, regEx);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: "La busqueda no ha sido realizada, utilizar las colecciones válidas",
                colecciones: ['usuario', 'medico', 'hospital']
            });
    }

    promesa.then(resp => {
        res.status(200).json({
            ok: true,
            [tabla]: resp
        });
    });
});

// Busqueda general
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regEx),
        buscarMedicos(busqueda, regEx),
        buscarUsers(busqueda, regEx)
    ])
        .then(resp => {

            res.status(200).json({
                ok: true,
                hospitales: resp[0],
                medicos: resp[1],
                usuarios: resp[2]
            });

        });

});

function buscarHospitales(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regExp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regExp })
            .populate('usuario', 'nombre email', User)
            .populate('hospital')
            .exec(
                (err, medicos) => {

                    if (err) {
                        reject('Error al cargar hospitales', err);
                    } else {
                        resolve(medicos);
                    }
                });
    });
}

function buscarUsers(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        User.find({}, 'nombre email role')
            .or([
                { 'nombre': regExp },
                { 'email': regExp }
            ])
            .exec((err, users) => {
                if (err) {
                    reject('Error al cargar users', err);
                } else {
                    resolve(users);
                }
            });
    });
}


module.exports = app;