var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var User = require('../models/user');

// Obtener todos los usuarios
app.get('/', (req, res, next) => {

    User.find({}, 'nombre email img role')
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: users
            });

        });
});



// Actualizar usuario
app.put('/:id', mdAutenticacion.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    User.findById(id, (err, user) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario ${id} no existe`,
                errors: { mensaje: 'No existe usario con ese ID' }
            });
        }

        user.nombre = body.nombre;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userSaved) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            userSaved.password = ":)";

            res.status(201).json({
                ok: true,
                user: userSaved
            });


        });

    });

});

// Crear un nuevo usuario
app.post('/', mdAutenticacion.verifyToken, (req, res) => {
    var body = req.body;

    var user = new User({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, userSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: userSaved,
            userToken: req.user
        });

    });

});



// Eliminar usuario
app.delete('/:id', mdAutenticacion.verifyToken, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, userDeleted) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if ( !userDeleted ) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario ${ id } no existe`,
                errors: { message: `El usuario ${id} no existe`}
            });
            
        }

        res.status(200).json({
            ok: true,
            user: userDeleted,
            mensaje: 'Usuario borrado'
        });


    });

});


module.exports = app;