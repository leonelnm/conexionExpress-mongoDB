var express = require('express');
var fileUpload = require('express-fileupload');

var fs = require('fs');

var app = express();

// Modelos
var User = require('../models/user');
var Medico = require('../models/medicoModel');
var Hospital = require('../models/hospitalModel');


// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Colección no válida',
            errors: { message: 'Colección no válida' }
        });
    }

    validaId(tipo, id)
        .then((id) => {

            if (!req.files) {
                return res.status(400).json({
                    ok: false,
                    message: 'No ha seleccionado nada',
                    errors: { message: 'Debe validar la imagen' }
                });
            }

            // Obtener nombre de archivo
            var archivo = req.files.imagen;
            var nombreCortado = archivo.name.split('.');
            var extensionArchivo = nombreCortado[nombreCortado.length - 1];

            // Extensiones permitidas
            var extensiones = ['png', 'jpg', 'jpeg'];

            if (extensiones.indexOf(extensionArchivo) < 0) {
                return res.status(400).json({
                    ok: false,
                    message: 'Extensión no válida',
                    errors: { message: `Las extensiones permitidas son: ${extensiones.join(', ')}` }
                });
            }

            // Crear nombre de archivo personalizado
            var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

            // Mover el archivo temporal a un path
            var path = `./uploads/${tipo}/${nombreArchivo}`;

            archivo.mv(path, err => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al mover archivo',
                        errors: err
                    });
                }

                uploadByType(tipo, id, nombreArchivo, res);

            });

        })
        .catch(err => {
            res.status(404).json({
                ok: false,
                [tipo]: 'No encontrado',
                errors: err
            });
        });



});

function validaId(tipo, id) {
    var typeModel;

    switch (tipo) {
        case 'usuarios':
            typeModel = User;
            break;
        case 'medicos':
            typeModel = Medico;
            break;
        case 'hospitales':
            typeModel = Hospital;
            break;

    }

    return new Promise((resolve, reject) => {

        typeModel.findById(id, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(id);
            }
        });
    });
}

function uploadByType(tipo, id, nombreArchivo, res) {

    var typeModel;

    switch (tipo) {
        case 'usuarios':
            typeModel = User;
            break;
        case 'medicos':
            typeModel = Medico;
            break;
        case 'hospitales':
            typeModel = Hospital;
            break;

    }

    typeModel.findById(id, (err, dataDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Información no encontrado',
                errors: err
            });

        }

        if (!dataDB) {
            return res.status(404).json({
                ok: false,
                message: `${tipo} no existe`,
                errors: err
            });

        }

        var pathOld = `./uploads/${tipo}/${dataDB.img}`;

        // si existe elimina la imagen
        if (fs.existsSync(pathOld)) {
            fs.unlinkSync(pathOld);
        }

        dataDB.img = nombreArchivo;

        dataDB.save((err, dataUpdated) => {
            return res.status(200).json({
                ok: true,
                message: 'Imagen actualizada',
                [tipo]: dataUpdated
            });
        });

    });

}

module.exports = app;