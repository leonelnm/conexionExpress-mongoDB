var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medicoModel');

// Obtener todos los medicos 
app.get('/', (req, res) => {


    Medico.find({}, (err, medicos) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al cargar medicos',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medicos: medicos
        });
    });


});

// Crear medico
app.post('/', mdAutenticacion.verifyToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.user._id,
        hospital: body.hospital
    });


    medico.save((err, medicoSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un meédico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            message: `Médico: '${body.nombre}' ha sido creado`,
            medico: medicoSaved,

        });
    });


});

// Actualizar medico
app.put('/:id', mdAutenticacion.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El médico con id: ${id} no existe`,
                errors: { message: `Id: ${id} no existe` }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.user._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                medico: medicoSaved
            });

        });
    });
});

// Borrar medico

app.delete('/:id', mdAutenticacion.verifyToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }

        if (!medicoDeleted) {
            return res.status(400).json({
                ok: false,
                mensaje: `El médico con id: ${id} no existe`,
                errors: { message: `Id: ${id} no existe` }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoDeleted,
            mensaje: 'Médico borrado'
        });
    });
});


module.exports = app;