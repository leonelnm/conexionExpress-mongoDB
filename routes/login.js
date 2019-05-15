var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');

// Google lib
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// AutenticaciónGoogle

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}


app.post('/google', async (req, res) => {

    var token = req.body.token;

    if (!token) {
        return res.status(403).json({
            ok: false,
            mensaje: 'No hay insertado un token'
        });
    }

    await verify(token)
        .then(googleUser => {

            User.findOne({ email: googleUser.email }, (err, userDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuarios',
                        errors: err
                    });
                }

                if (userDB) {
                    if (!userDB.google) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Debe usar su autenticación normal'
                        });
                    } else {
                        var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 });

                        res.status(200).json({
                            ok: true,
                            usuario: user,
                            id: user.id,
                            token: token
                        });

                    }
                } else {
                    // El usuario no existe
                    var userNew = new User();

                    userNew.nombre = googleUser.nombre;
                    userNew.email = googleUser.email;
                    userNew.img = googleUser.img;
                    userNew.google = true;
                    userNew.password = ':)';

                    userNew.save( (err, userDB) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al guardar usuarios',
                                errors: err
                            });
                        }

                        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 });

                        res.status(200).json({
                            ok: true,
                            usuario: userDB,
                            id: userDB.id,
                            token: token
                        });

                    });
                }

            });

            // res.status(200).json({
            //     ok: true,
            //     mensaje: 'OK!',
            //     googleUser: googleUser
            // });
        })

        .catch(() => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no válido',
            });
        });



});


// Autenticación normal
app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
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

