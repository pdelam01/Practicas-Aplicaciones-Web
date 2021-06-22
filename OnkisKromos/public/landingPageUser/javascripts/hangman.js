const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
const MAX_ATTEMPTS = 6;
var remainingAttempts = 6;
var resp = [];
var dictionary;
var active = false;
var word;
var letters = [];

async function start(){
    var auxLoad = await loadData();

    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'hangman'
    }

    writeData(auxLoad);
    reset();
    selectImage();
    loadDictionary();
}

async function loadData() {
    return $.post(
        "/userInfo",
        {session: "session"}
    );
}

function writeData(data) {
    document.getElementById("nombre").innerHTML = data.name.concat(" "+data.surnames);
}

function reset() {
    remainingAttempts = 6;
    letters = [];
    document.getElementById("imagen").inner = "/landingPageUser/assets/img/Ahorcado-${MAX_ATTEMPTS - this.remainingAttempts}.png";
    document.getElementById("intentos").innerHTML = "Número de intentos restantes: "+remainingAttempts;
    resetInputs();
}

function resetInputs() {
    document.getElementById("0").value = "";
    document.getElementById("1").value = "";
    document.getElementById("2").value = "";
    document.getElementById("3").value = "";
    document.getElementById("4").value = "";
    document.getElementById("5").value = "";
}

function resetLetter() {
    document.getElementById("letter").value = "";
}

function selectImage() {
    document.getElementById("imagen").src = `/landingPageUser/assets/img/Ahorcado-${MAX_ATTEMPTS - this.remainingAttempts}.png`;
}

function endGame() {
    if(remainingAttempts==0){
        return true;
    }
    return false;
}

function newGame() {    
    var play;
    if(active){        
        swal({
            title: 'CUIDADO!',
            text: "Quieres sobreescribir la partida actual?",
            icon: 'warning',
            showCancelButton: true,
            buttons: ["Cancel", "Ok!"]
            })
            .then((willDelete) => {
                if(willDelete){
                    swal({title: 'Listo', text: 'Se iniciara una nueva partida!', icon: 'success'});
                    reset();
                    word = selectWord();
                    play = false;
                }else{
                    play = true;
                }
            });
                    

    }else{
        active = true;
        play = true;
    }
    if(play) {
        reset();
        active = true;
        word = selectWord();
    }
    
}

function calculatePoints() {
    return remainingAttempts*100;
}

async function newLetter() {
    if(active) {
        var letter = document.getElementById("letter").value.toLowerCase();
        if(letter.length!=0) {
            if(!checkRepet(letter)) {
                letters.push(letter);
                var num = obtainIndex(letter);
                if (num.length != 0) {
                    for (let i = 0; i < num.length; i++) {
                        document.getElementById("" + num[i]).value = letter;
                    }
                    //comprobar si esta completa
                    var wordTry = "";
                    for (let i = 0; i < 6; i++) {
                        wordTry += document.getElementById("" + i).value;
                    }
                    if (word === wordTry) {
                        active = false;

                        var points = calculatePoints();

                        swal("¡Good joob!", "Has ganado "+points+" monedas en el ahorcado!", "success", {
                            button: "¡Aceptar!",
                        });                        
                        await givePoints(points);
                    }
                } else {
                    remainingAttempts--;
                    document.getElementById("intentos").innerHTML = "Número de intentos restantes: " + remainingAttempts;
                    selectImage();
                    if (endGame()) {
                        active = false;
                        swal("Oooops!", "¡Has perdido! Vuelva a intentarlo más tarde!", "warning", {
                            button: "Aceptar",
                        });
                    }
                }
            }else{
                swal("Oooops!", "¡Ha introducida una letra repetda! Ten cuidado!", "warning", {
                    button: "Aceptar",
                });
                remainingAttempts--;
                document.getElementById("intentos").innerHTML = "Número de intentos restantes: " + remainingAttempts;
                selectImage();
                if (endGame()) {
                    active = false;
                    swal("Oooops!", "¡Has perdido! Vuelva a intentarlo más tarde!", "warning", {
                        button: "Aceptar",
                    });
                }
            }
            resetLetter();
        }else{
            swal("Error!", "¡Debe introducir una letra!", "error", {
                button: "Aceptar",
            });
        }
    }else{
        swal("Error!", "¡Primero debe iniciar partida!", "error", {
            button: "Aceptar",
        });
    }
}

function checkRepet(letter) {
    for(let i=0; i<letters.length; i++) {
        if(letter==letters[i]) {
            return true;
        }
    }
    return false;
}

function obtainIndex(letter) {
    var nums = [];
    for (let i=0; i<word.length; i++) {
        if(letter == word[i]) {
            nums.push(i);
        }
    }
    return nums;
}

function selectWord() {
    //numero aleatorio
    var num = Math.floor(Math.random() * 10148);
    return resp[num];
}

function loadDictionary() {
    //let url = 'https://ordenalfabetix.unileon.es/aw/diccionario.txt';
    let url = 'https://diccionario.casasoladerueda.es/diccionario.txt';
    fetch(url)
        .then(response => response.text())
        .then(dic => dictionary = dic)
        .then(function(dictionary) {
            prepareDictionary(dictionary);
        })
}

function prepareDictionary(dictionary){
    dic = dictionary.split("\n");
    return limitDictionary(dic);
}

function limitDictionary(dic) {
    for(let i=0; i<dic.length; i++) {
        if(dic[i].length==6) {
            resp.push(dic[i]);
        }
    }
    return resp;
}

async function givePoints(points){
    return $.post(
        "/addPoints",
        {points: points}
    );
}
