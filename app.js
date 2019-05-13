// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospitalRoutes');
var medicoRoutes = require('./routes/medicoRoutes');
var busquedaRoutes = require('./routes/busquedaRoutes');
var uploadRoutes = require('./routes/uploadRoutes');

// Conexión base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, resp ) => {
    if ( err ) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
} );

// Rutas
app.use('/user', userRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3001, () => {
    console.log('Express server puerto 3001: \x1b[32m%s\x1b[0m', 'online');
});