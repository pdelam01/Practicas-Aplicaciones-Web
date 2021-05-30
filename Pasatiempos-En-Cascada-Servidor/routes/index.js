var express = require('express');
const path = require("path");
var router = express.Router();

const publicDirectory = path.join(__dirname, '../public');
const rootDirectory = path.join(__dirname,'../');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const sol1 = ["clan", "pena", "remato", "torero"];
const sol2 = ["doce", "rimo", "cámara", "abrasa"];
const sol3 = ["acto", "azar", "piraña", "aparto"];

router.post('/pasatiempo1', function (req, res, next) {
  var soluciones = req.body.arraySoluciones.split(",");
  if(soluciones[0].toString()==sol1[0] && soluciones[1].toString()==sol1[1] && soluciones[2].toString()==sol1[2] && soluciones[3].toString()==sol1[3]){
    res.end(JSON.stringify(true));
  }else{
    res.end(JSON.stringify(false));
  }
});

router.post('/pasatiempo2', function (req, res, next) {
  var soluciones = req.body.arraySoluciones.split(",");
  if(soluciones[0].toString()==sol2[0] && soluciones[1].toString()==sol2[1] && soluciones[2].toString()==sol2[2] && soluciones[3].toString()==sol2[3]){
    res.end(JSON.stringify(true));
  }else{
    res.end(JSON.stringify(false));
  }
});

router.post('/pasatiempo3', function (req, res, next) {
  var soluciones = req.body.arraySoluciones.split(",");
  if(soluciones[0].toString()==sol3[0] && soluciones[1].toString()==sol3[1] && soluciones[2].toString()==sol3[2] && soluciones[3].toString()==sol3[3]){
    res.end(JSON.stringify(true));
  }else{
    res.end(JSON.stringify(false));
  }
});

/*GET diccionario.txt */
router.get('/diccionario.txt', function(req, res) {
  res.sendFile('diccionario.txt', {root: rootDirectory});
});

/* GET no indexed page. */
router.get('*', function(req, res, next) {
  const error = new Error('Page not found');
  error.statusCode = 404;
  next(error);
});

module.exports = router;
