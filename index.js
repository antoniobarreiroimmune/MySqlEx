require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const app = express();
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(express.static('public')); 

const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost'
    ,
    user: 'root'
    ,
    password: ''
    
    , 
    
    database: 'restaurante'
    });

connection.connect(err => {
    if (err) {
        console.error('Error de conexión: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa con el ID: ' + connection.threadId);
});

app.get('/api/menus', (req, res) => {
    connection.query('SELECT * FROM menus', (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Ocurrió un error en el servidor.');
        }
        res.status(200).send(results);
    });
});

app.post('/api/nuevoMenu', (req, res) => {
    const menu = req.body;
    if (!menu) {
        return res.status(400).send('La solicitud debe contener un cuerpo con el menú a añadir.');
    }
    connection.query('INSERT INTO menus SET ?', menu, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Ocurrió un error al intentar añadir el menú.');
        }
        res.status(201).send(`Menú añadido con número: ${results.insertId}`);
    });
});

app.put('/api/editarMenu', (req, res) => {
    const { numero, primerPlato, segundoPlato, postre, precio } = req.body;
    if (!numero) {
        return res.status(400).send('La solicitud debe contener un número de menú para actualizar.');
    }
    connection.query(
        'UPDATE menus SET primerPlato = ?, segundoPlato = ?, postre = ?, precio = ? WHERE numero = ?',
        [primerPlato, segundoPlato, postre, precio, numero],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Ocurrió un error al intentar actualizar el menú.');
            }
            if (results.affectedRows === 0) {
                return res.status(404).send('Menú no encontrado.');
            }
            res.status(200).send(`Menú con número ${numero} actualizado.`);
        }
    );
});

app.delete('/api/borrarMenu/:numero', (req, res) => {
    const { numero } = req.params;
    if (!numero) {
        return res.status(400).send('La solicitud debe contener un número de menú para borrar.');
    }
    connection.query('DELETE FROM menus WHERE numero = ?', [numero], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Ocurrió un error al intentar borrar el menú.');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Menú no encontrado.');
        }
        res.status(200).send(`Menú con número ${numero} borrado.`);
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
