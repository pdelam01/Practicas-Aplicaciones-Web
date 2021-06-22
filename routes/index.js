var express = require('express');
const cookieParser = require('cookie-parser');

var app = express()
app.use(cookieParser());

var router = express.Router();
var path = require('path');

const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../tokenConfig')
const multer = require('multer');

const { body } = require('express-validator');
const helpers = require('../lib/helpers');
const pool = require('../database');
const { request } = require('http');
const publicDirectory = path.join(__dirname, '../public');
const rootDirectory = path.join(__dirname, '../')
const fetch = require('node-fetch');
const fs = require("fs");

var newCollectionID = undefined;
var auxiliarDeVuelo = 1;
var auxiliarDeEnfermería = 1;

app.set('TOKEN_SECRET', config.TOKEN_SECRET);
function validateToken(req, res, next) {
  console.log('Se intenta acceder a un area que requiere validacion de Token.')
  var token = req.cookies.token;

  if (token) {
    jwt.verify(token, app.get('TOKEN_SECRET'), (err, user) => {
      if (err) {
        console.log('El token no es valido, eliminando y redirigiendo al login.');
        res.clearCookie('token');
        res.redirect('/')
      } else {
        console.log('Token valido, se genera otro para mantener los 30 minutos de persistencia.')
        req.user = user;
        res.clearCookie('token');
        if (req.user.iat) delete req.user.iat
        if (req.user.exp) delete req.user.exp
        const token = jwt.sign(Object.assign({}, req.user), app.get('TOKEN_SECRET'), { expiresIn: 1800 });
        res.cookie('token', token, { httpOnly: true });
        next()
      }
    });
  } else {
    console.log('No hay token, redirigiendo al Login.')
    res.redirect('/login')
  }
}

function generateToken(req, res, next) {
  console.log('Generando token para ' + req.user.username + '.')
  if (req.user.iat) delete req.user.iat
  if (req.user.exp) delete req.user.exp
  const token = jwt.sign(Object.assign({}, req.user), app.get('TOKEN_SECRET'), { expiresIn: 1800 });
  res.cookie('token', token, { httpOnly: true });
  next()
}

async function updateNewCollectionID(req, res, next) {
  if (newCollectionID === undefined) {
    try {
      var query = "SELECT idcollections from collections";
      queryUpdateState = await pool.query(query);
      newCollectionID = queryUpdateState.length + 1;
      console.log('Se actualiza el ID de la nueva coleccion a ' + newCollectionID + '.')
    } catch (error) {
      console.log(error);
      return done(null, false, req.flash('message', 'Error while trying to edit remaining units cards to DB'));
    }
  }

  next();
}

/* GET home page. */
router.get('/', validateToken, function (req, res, next) {
  console.log('Se redirige al usuario ' + req.user.username + ' a la ventana de ' + req.user.rol + '.')
  if (req.user.rol === 'Administrador') {
    res.sendFile('index.html', { root: publicDirectory + '/landingPageAdmin' });
    console.log("Se inicia sesion como admin.");
  } else {
    res.sendFile('index.html', { root: publicDirectory + '/landingPageUser' });
    console.log("Se inicia sesion como socio.");
  }
});


/* POST sign in */
router.post('/signin', function (req, res, next) {
  passport.authenticate('local.signin', {
    successRedirect: '/getToken',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

/* POST sign up */
router.post('/signup', function (req, res, next) {
  passport.authenticate('local.signup', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

router.get('/login', function (req, res) {
  res.sendFile('/login.html', { root: publicDirectory + '/login' })
});

router.get('/getToken', generateToken, (req, res) => {
  res.redirect('/')
});

router.get('/closeSession', function (req, res) {
  console.log("Cerrando sesion...");
  res.clearCookie('token');
  res.redirect('/');
});

/* POST get info from database */
router.post('/userInfo', validateToken, async function (req, res, next) {
  console.log("Buscando informacion del usuario en la base de datos...");
  let user = req.user.username;
  var answer;
  try {
    answer = await pool.query('SELECT * FROM users WHERE username = ?', [user]);
  } catch (error) {
    return done(null, false, req.flash('message', 'The Username does not exists.'));
  }

  res.end(JSON.stringify(answer[0]));
});


/* POST get info from database collections*/
router.post('/userAlbums', validateToken, async function (req, res) {
  console.log("Buscando informacion de los albums en la base de datos...");
  let iduser = req.user.idusers, output = [];
  var answerNumCol, answerNumColUser, percentage;
  try {
    answerNumCol = await pool.query('SELECT * FROM collections');
    answerNumColUser = await pool.query('SELECT * FROM albums WHERE iduser = ?', [iduser]);
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'The collection does not exist.'));
  }
  percentage = Math.round((answerNumColUser.length / answerNumCol.length) * 100) / 100;
  output.push(percentage);

  var answerIdAlb, numCol = [], queryAux;
  try {
    answerIdAlb = await pool.query('SELECT idalbums, idcollection FROM albums WHERE iduser = ?', [iduser]);
    for (let i = 0; i < answerIdAlb.length; i++) {
      queryAux = await pool.query('SELECT * FROM albumcards WHERE idalbum = ?', [answerIdAlb[i].idalbums]);
      numCol.push(queryAux.length);
    }
  } catch (error) {
    return done(null, false, req.flash('message', 'The albumcards table does not exist.'));
  }
  output.push(answerIdAlb);
  output.push(numCol);
  res.end(JSON.stringify(output));
});

/* POST get three random questions from db table. */
router.post('/newQuestions', validateToken, async function (req, res) {
  var user = req.user.username;
  console.log('Buscando 3 preguntas al azar en la base de datos para ' + user + '.');

  var queryResult;
  try {
    queryResult = await pool.query('SELECT question, answer FROM questions ORDER BY RAND() LIMIT 3;');
  } catch (error) {
    return done(null, false, req.flash('message', 'Questions tables fails while getting questions.'));
  }

  console.log('No te chives pero las preguntas son:')
  console.log(queryResult[0].question + ' -> ' + queryResult[0].answer)
  console.log(queryResult[1].question + ' -> ' + queryResult[1].answer)
  console.log(queryResult[2].question + ' -> ' + queryResult[2].answer)

  res.end(JSON.stringify(queryResult));
});

router.post('/cardsIdAlbums', validateToken, async function (req, res) {
  console.log('Buscando informacion de los kromos en la base de datos...');
  var ids = req.body.id.split(",");

  var queryResult, output = [];
  try {
    for (let i = 0; i < ids.length; i++) {
      queryResult = await pool.query('SELECT * FROM albumcards where idalbum = ?;', ids[i]);
      output.push(queryResult.length);
    }
  } catch (error) {
    return done(null, false, req.flash('message', 'Questions tables fails while getting questions.'));
  }
  res.end(JSON.stringify(output));

});

router.post('/idlbumsUser', validateToken, async function (req, res) {
  console.log('Buscando informacion de los albumes del usuario...');
  var ids = req.body.id;
  var queryResult;
  try {
    queryResult = await pool.query('SELECT idalbums FROM albums where iduser = ?;', ids);
  } catch (error) {
    return done(null, false, req.flash('message', 'Questions tables fails while getting questions.'));
  }
  res.end(JSON.stringify(queryResult));

});

/* POST get info from database collections*/
router.post('/collections', validateToken, async function (req, res) {
  console.log('Buscando informacion de las colecciones en la base de datos...');
  var queryResult;
  try {
    queryResult = await pool.query('SELECT * FROM collections;');
  } catch (error) {
    return done(null, false, req.flash('message', 'Collections not found.'));
  }
  res.end(JSON.stringify(queryResult));

});

/* POST get info from database cards*/
router.post('/cards', validateToken, async function (req, res) {
  console.log('Buscando informacion de los kromos en la base de datos...');
  var queryResult;
  try {
    queryResult = await pool.query('SELECT * FROM cards;');
  } catch (error) {
    return done(null, false, req.flash('message', 'Cards not found.'));
  }
  res.end(JSON.stringify(queryResult));

});

/* POST get info from database name collections */
router.post('/nameCollection', validateToken, async function (req, res) {
  console.log('Buscando informacion de los nombres de las colecciones en la base de datos...');

  var queryResult;
  try {
    queryResult = await pool.query('SELECT * FROM cards;');
  } catch (error) {
    return done(null, false, req.flash('message', 'Collection not found.'));
  }
  res.end(JSON.stringify(queryResult));

});

/* POST get info from database name collections */
router.post('/nameCollectionId', validateToken, async function (req, res) {
  console.log('Buscando informacion de los nombres de las colecciones en la base de datos...');
  var id = req.body.id;
  var queryResult;

  try {
    queryResult = await pool.query('SELECT name FROM collections where idcollections = ?;', id);
  } catch (error) {
    return done(null, false, req.flash('message', 'Collection not found.'));
  }
  res.end(JSON.stringify(queryResult[0].name));
});

/* POST get info from database name collections */
router.post('/activatedCollectionId', validateToken, async function (req, res) {
  console.log('Buscando informacion del estado de las colecciones en la base de datos...');
  var id = req.body.id;
  var queryResult;

  try {
    queryResult = await pool.query('SELECT activated FROM collections INNER JOIN albums ON collections.idcollections = albums.idcollection where albums.idalbums = ?;', id);
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Collection not found.'));
  }
  res.end(JSON.stringify(queryResult[0]));
});

/* POST get info from database name collections */
router.post('/cardsByUser', validateToken, async function (req, res) {
  console.log('Buscando informacion del numero de cartas del usuario en la base de datos...');
  var id = req.body.id;
  var user = req.user.idusers;
  var query = "SELECT idcards FROM albumcards INNER JOIN albums ON albumcards.idalbum = albums.idalbums where albums.idcollection = " + id + " AND albums.iduser = " + user + ";";
  var queryResult;

  try {
    console.log("EL ID ES ESTE: ", id);
    queryResult = await pool.query(query);
    console.log("ME CAGO EN TU:", queryResult);
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Collection not found.'));
  }
  res.end(JSON.stringify(queryResult.length));
});

/* POST get info from database name collections */
router.post('/stateCollectionId', validateToken, async function (req, res) {
  console.log('Buscando informacion de los nombres de las colecciones en la base de datos...');
  var id = req.body.id;
  var queryResult;

  try {
    queryResult = await pool.query('SELECT activated FROM collections where idcollections = ?;', id);
  } catch (error) {
    return done(null, false, req.flash('message', 'Collection not found.'));
  }
  res.end(JSON.stringify(queryResult[0].activated));

});

/* POST get info from database collections */
router.post('/collectionsId', validateToken, async function (req, res) {
  console.log('Buscando informacion de las colecciones en la base de datos...');
  var ids = req.body.id.split(",");

  var queryResult, output = [];
  try {
    for (let i = 0; i < ids.length; i++) {
      queryResult = await pool.query('SELECT * FROM collections where idcollections = ?;', ids[i]);
      output.push(queryResult);
    }
  } catch (error) {
    return done(null, false, req.flash('message', 'Collection not found.'));
  }

  res.end(JSON.stringify(output));

});

/* POST get info from database collections cards*/
router.post('/cardsCollections', validateToken, async function (req, res) {
  console.log('Buscando informacion de los kromos en la base de datos...');
  var ids = req.body.id.split(",");

  var queryResult, output = [];
  try {
    for (let i = 0; i < ids.length; i++) {
      queryResult = await pool.query('SELECT sum(remainingUnits) FROM cards where idcollections = ?;', ids[i]);
      var aux = JSON.stringify(queryResult);
      var number = aux.split(":")[1].split("}")[0]
      output.push({ "id": ids[i], "result": number });
    }
  } catch (error) {
    return done(null, false, req.flash('message', 'Card not found.'));
  }

  res.end(JSON.stringify(output));

});

/* POST get info from database cards*/
router.post('/cardsAlbum', validateToken, async function (req, res) {
  console.log('Buscando informacion de los kromos en la base de datos...');
  var id = req.body.id;

  var queryResult, card, output = [];
  try {
    queryResult = await pool.query('SELECT idcards FROM albumcards where idalbum = ?;', id);
    for (let i = 0; i < queryResult.length; i++) {
      card = await pool.query('SELECT * FROM cards where idcards = ?;', queryResult[i].idcards);
      output.push(card);
    }
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Card not found.'));
  }

  res.end(JSON.stringify(output));

});

/* POST get info from database album cards*/
router.post('/idCard', validateToken, async function (req, res) {
  console.log('Buscando informacion del id kromos en la base de datos...');
  var name = req.body.name;

  var queryResult;
  try {
    queryResult = await pool.query('SELECT idcards FROM cards where name = ?;', name);
  } catch (error) {
    return done(null, false, req.flash('message', 'Card not found.'));
  }
  res.end(JSON.stringify(queryResult[0].idcards));

});

/* POST get info from captcha*/
router.post('/submit', validateToken, async function (req, res) {
  //captcha verify
  console.log("Se va a comprobar el captcha");
  const secretKey = '6Ldn_CsbAAAAAKVB9QJq2PYULMsYZ1mMaD_1dn8b';
  const userKey = req.body.captcha;
  const remoteIp = req.socket.remoteAddress;
  var captchaVerified;

  try {
    captchaVerified = await fetch('https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + userKey + '&remoteip=' + remoteIp, {
      method: "POST"
    })
      .then(_res => _res.json());
  } catch (error) {
    console.log(error);
  }
  var solucion = false;

  if (captchaVerified.success === true) {
    //Add coins
    solucion = true;

  } else {
    solucion = false;
    console.log("Ha habido un error, intentalo de nuevo");
  }
  console.log('Solucion del servidor al captcha: ' + JSON.stringify(solucion))
  res.end(JSON.stringify(solucion));

});

/* POST points to user */
router.post('/addPoints', validateToken, async (req, res) => {
  console.log('Se procede a sumar puntos al usuario.');
  var points = req.body.points;
  let user = req.user.username;
  console.log('Se deberian dar ' + points + ' al usuario ' + user)
  var query = "UPDATE users SET points = points + " + points + ",pointsGameWin = pointsGameWin + " + points + " where username = '" + user + "'";
  try {
    queryResult = await pool.query(query);
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Error adding points.'));
  }
});

/* POST subtract cards */
router.post('/subtractCards', validateToken, async (req, res) => {
  console.log('Se procede a restar el numero de unidades restantes.');
  var id = req.body.id;
  var query = "UPDATE cards SET remainingUnits = remainingUnits - 1 where idcards = " + id;
  try {
    queryResult = await pool.query(query);
  } catch (error) {
    return done(null, false, req.flash('message', 'Error substracting cards.'));
  }
});

/* POST subtract points to user */
router.post('/subtractPoints', validateToken, async (req, res) => {
  console.log('Se procede a restar puntos al usuario');
  var points = req.body.points;
  var user = req.body.id;
  var query = "UPDATE users SET points = points - " + points + " where idusers = " + user;
  try {
    queryResult = await pool.query(query);
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Error substracting points.'));
  }
  res.end();
});

/* POST get info of collections from database albums*/
router.post('/albumsCollections', validateToken, async function (req, res) {
  console.log('Buscando informacion de los albums en la base de datos...');
  var ids = req.body.id.split(",");

  var queryResult, output = [];
  try {
    for (let i = 0; i < ids.length; i++) {
      queryResult = await pool.query('SELECT idcollection FROM albums where idalbums = ?;', ids[i]);
      output.push(queryResult[0].idcollection);
    }
  } catch (error) {
    return done(null, false, req.flash('message', 'Error album not found.'));
  }

  res.end(JSON.stringify(output));

});

/* POST get info from database collections cards*/
router.post('/albumsCollection', validateToken, async function (req, res) {
  console.log('Buscando informacion de los albums en la base de datos...');
  var ids = req.body.id;

  var queryResult, output = [];
  try {
    queryResult = await pool.query('SELECT idcollection FROM albums where idalbums = ?;', ids);

  } catch (error) {
    return done(null, false, req.flash('message', 'Error album not found.'));
  }

  res.end(JSON.stringify(queryResult[0].idcollection));

});

/* POST insert info in database albums*/
router.post('/insertAlbums', validateToken, async function (req, res) {
  console.log('Se procedera a fabricar nuevos albums...');
  var idCol = req.body.idCollection;
  var idUs = req.body.idUser;
  var aux = 'No iniciada';
  var queryResult;
  var query = "INSERT INTO albums (status, idcollection, iduser) VALUES ('" + aux + "', " + idCol + ", " + idUs + ")";
  try {
    queryResult = await pool.query(query);
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Insert fail.'));
  }

  res.end();

});

/* POST insert info in database albums*/
router.post('/obtainIdNewKromo', validateToken, async function (req, res) {
  var queryResult, queryResultId;
  var queryId = "SELECT idcards from cards ORDER BY idcards desc LIMIT 1";
  var query = "SELECT imagePath FROM cards WHERE idcards=";
  try {
    queryResultId = await pool.query(queryId);
    queryResult = await pool.query('SELECT imagePath FROM cards WHERE idcards=?', queryResultId[0].idcards);
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Insert fail.'));
  }

  res.end(queryResult[0].imagePath);

});

/* POST get info from database collections cards*/
router.post('/albumsWithCards', validateToken, async function (req, res) {
  console.log('Pegando kromos en el album...');
  console.log(req.body);
  var idAlbum = req.body.idAlbum;
  var idCard = req.body.idCard;
  var query = "SELECT idalbum FROM albumcards WHERE idcards = " + idCard + " and idalbum = " + idAlbum + ";";
  var conditionalQuery;
  var queryResult;
  try {
    conditionalQuery = await pool.query(query);
    if (conditionalQuery.length == 0) {
      queryResult = await pool.query('INSERT INTO albumcards (idalbum, idcards) VALUES (' + idAlbum + ', ' + idCard + ')');
    } else {
      res.end("Error")
    }
  } catch (error) {
    return done(null, false, req.flash('message', 'Error inserting values.'));
  }

  res.end("Ok");

});

async function storeCards(kromosSplitted, queryAddCollections, queryAddKromos) {
  for (let i = 0; i < kromosSplitted.length; i++) {
    var queryKromos = "INSERT INTO cards (name, price, maxUnits, remainingUnits, imagePath, idcollections) VALUES ('" + kromosSplitted[i][0]
      + "'," + kromosSplitted[i][1] + "," + kromosSplitted[i][2] + "," + kromosSplitted[i][2]
      + ",'" + 'Kromo' + (i + 1) + '_NewCollection' + queryAddCollections.insertId + "'," + queryAddCollections.insertId + ")";
    queryAddKromos = await pool.query(queryKromos);
  }
}

/* POST info collections to DB */
router.post('/collectionAdd', validateToken, async (req, res) => {
  var kromos = req.body.kromos.split(',');
  var collection = req.body.collection.split('-');
  var numCol = req.body.numCol;
  var kromosSplitted = [];
  for (let i = 0; i < kromos.length; i++) {
    kromosSplitted.push(kromos[i].split('-'));
  }

  var queryAddCollections, queryAddKromos;
  console.log("La data de kromos: " + kromos + " y la de collection: " + collection);
  try {
    /* Query to store the collections */
    var query = "INSERT INTO collections (name, activated, price) VALUES ('" + collection[0] + "'," + collection[2] + "," + collection[1] + ")";
    queryAddCollections = await pool.query(query);
    console.log(queryAddCollections.insertId);

    /* Query to store the cards */
    await storeCards(kromosSplitted, queryAddCollections, queryAddKromos)
    res.end();
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Error while trying to add collections to DB'));
  }
});

/* POST edit info collections to DB */
router.post('/collectionEdit', validateToken, async (req, res) => {
  var collection = req.body.collection.split('-');
  var idCol = req.body.idCol;
  var queryAddCollections;
  console.log("collection: " + collection);

  try {
    var query = "UPDATE collections SET name = '" + collection[0] + "',activated = " + collection[2] + ",price = " + collection[1] + " WHERE idcollections = '" + idCol + "'";
    queryAddCollections = await pool.query(query);
    res.end();
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Error while trying to edit collections to DB'));
  }
});

/* POST update state album */
router.post('/updateStateAlbum', validateToken, async (req, res) => {
  var idAlbum = req.body.idAlbum;
  var stateAlbum = req.body.stateAlbum;

  try {
    var query = "UPDATE albums SET status = '" + stateAlbum + "' WHERE idalbums = " + idAlbum + "";
    queryUpdateState = await pool.query(query);

    res.end();
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Error while trying to edit state albums to DB'));
  }
});

/* POST update remaining units cards */
router.post('/updateRemainingUnits', validateToken, async (req, res) => {
  console.log('Se actualizan las unidades que quedan del kromo.')
  var idCards = req.body.idCards;

  try {
    var query = "UPDATE cards SET remainingUnits = remainingUnits + 1, maxUnits = maxUnits + 1 WHERE idcards = " + idCards + "";
    queryUpdateState = await pool.query(query);
    console.log(queryUpdateState);
  } catch (error) {
    console.log(error);
    return done(null, false, req.flash('message', 'Error while trying to edit remaining units cards to DB'));
  }
  res.end();
});

/* POST store images */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/resources/kromos')
  },
  filename: (req, file, cb) => {
    var fileName = 'Kromo' + (auxiliarDeVuelo++) + '_NewCollection' + newCollectionID + ".png";
    cb(null, fileName)
  }
});

const subida = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).array('image', 10);

router.post("/upload", validateToken, subida, (req, res, next) => {
  console.log("Image uploaded");
  auxiliarDeEnfermería = 1;
  auxiliarDeVuelo = 1;
  newCollectionID++
  res.redirect('/landingPageAdmin/manageKromos');
});

router.get('/landingPageUser', validateToken, function (req, res) {
  res.sendFile('/landingPageUser/index.html', { root: publicDirectory })
});

router.get('/landingPageUser/index', validateToken, function (req, res) {
  res.sendFile('/landingPageUser/index.html', { root: publicDirectory })
});

router.get('/landingPageUser/table', validateToken, function (req, res) {
  res.sendFile('/landingPageUser/table.html', { root: publicDirectory })
});

router.get('/landingPageUser/buysell', validateToken, function (req, res) {
  res.sendFile('/landingPageUser/buysell.html', { root: publicDirectory })
});

router.get('/landingPageUser/games', validateToken, function (req, res) {
  res.sendFile('/landingPageUser/games.html', { root: publicDirectory })
});

router.get('/landingPageUser/captcha', validateToken, function (req, res) {
  res.sendFile('/landingPageUser/captcha.html', { root: publicDirectory })
});

router.get('/landingPageUser/apalabrados', validateToken, function (req, res) {
  res.sendFile('/landingPageUser/apalabrados.html', { root: publicDirectory })
});

router.get('/landingPageUser/hangman', validateToken, function (req, res) {
  res.sendFile('/landingPageUser/hangman.html', { root: publicDirectory })
});

router.get('/landingPageAdmin', validateToken, function (req, res) {
  res.sendFile('/landingPageAdmin/index.html', { root: publicDirectory })
});

router.get('/landingPageAdmin/index', validateToken, function (req, res) {
  res.sendFile('/landingPageAdmin/index.html', { root: publicDirectory })
});

router.get('/landingPageAdmin/table', validateToken, function (req, res) {
  res.sendFile('/landingPageAdmin/table.html', { root: publicDirectory })
});

router.get('/landingPageAdmin/manageKromos', validateToken, updateNewCollectionID, function (req, res) {
  res.sendFile('/landingPageAdmin/manageKromos.html', { root: publicDirectory })
});

router.get('/accessHTML', validateToken, function (req, res) {
  console.log('User: ' + req.user)
  if (!req.user) res.end('0')
});

module.exports = router;