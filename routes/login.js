var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');


app.post('/', (req, res) => {

    var body = req.body;

    User.findOne( { email: body.email}, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if ( !user ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if ( !bcrypt.compareSync( body.password, user.password) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token!!
        user.password = ':)';
        var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: user,
            id: user.id,
            token: token
        });

    });
    
    

});

module.exports = app;

