var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospitalModel');
var User = require('../models/user');

// Obtener todos los hospitales 
app.get('/', (req, res) => {


    Hospital.find({}, (err, hospitals) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al cargar hospitales',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospitals: hospitals
        });
    });


});

// Crear hospital
app.post('/', mdAutenticacion.verifyToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.user._id
    });


    hospital.save((err, hospitalSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            message: `Hospital: '${body.nombre}' ha sido creado`,
            hospital: hospitalSaved,

        });
    });


});

// Actualizar hospital
app.put('/:id', mdAutenticacion.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con id: ${id} no existe`,
                errors: { message: `Id: ${id} no existe` }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.user._id;

        hospital.save((err, hospitalSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalSaved
            });

        });
    });
});

// Borrar hospital

app.delete('/:id', mdAutenticacion.verifyToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalDeleted) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con id: ${id} no existe`,
                errors: { message: `Id: ${id} no existe` }
            });
        }

        res.status(200).json({
            ok: true,
            user: hospitalDeleted,
            mensaje: 'Hospital borrado'
        });
    });
});


module.exports = app;