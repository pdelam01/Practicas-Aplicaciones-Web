const mysql = require('mysql');
const { promisify }= require('util'); 
const { database } = require('./config');
const pool = mysql.createPool(database);

//Creamos la conexión con la base de datos
pool.getConnection((err, connection) => {
    if (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.');
      }

      if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database has to many connections');
      }

      if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused');
      }
    }
  
    if (connection) connection.release();
    console.log('OnkisDB is Connected');
  
    return;
});

//Hacemos modulo sql acepte promesas
pool.query = promisify(pool.query);

module.exports = pool;