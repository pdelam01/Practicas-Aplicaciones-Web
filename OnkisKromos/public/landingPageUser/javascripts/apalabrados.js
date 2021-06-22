let ANSWERS = []

async function start(){
    newQuestions()
    var auxLoad = await loadData();

    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'apalabrados'
    }
    
    writeData(auxLoad);
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

async function newQuestions(){
    document.getElementById('mainRow').getElementsByTagName('input')[0].value = ''
    document.getElementById('mainRow').getElementsByTagName('input')[1].value = ''
    document.getElementById('mainRow').getElementsByTagName('input')[2].value = ''

    await loadNewQuestionFromServer()
}

async function loadNewQuestionFromServer(){
    await $.post('/newQuestions', function (data, status) {
        if (status === 'success') {
            const dataParsed = $.parseJSON(data)
            ANSWERS = [dataParsed[0].answer, dataParsed[1].answer, dataParsed[2].answer]
            document.getElementById('definition1').innerText = dataParsed[0].question
            document.getElementById('definition2').innerText = dataParsed[1].question
            document.getElementById('definition3').innerText = dataParsed[2].question
        } else {
            swal("¡Oh no!", "Ha ocurrido un error al solicitar las preguntas al servidor, ¡Intentalo de nuevo!", "error", {
                button: "¡Aceptar!",
            });
        }
    })
}
 
function checkAnswers(){
    let possibleAnswers = []
    possibleAnswers.push(document.getElementById('mainRow').getElementsByTagName('input')[0].value)
    possibleAnswers.push(document.getElementById('mainRow').getElementsByTagName('input')[1].value)
    possibleAnswers.push(document.getElementById('mainRow').getElementsByTagName('input')[2].value)

    let hits = 0
    for (let i = 0; i < ANSWERS.length; i++)
        if(ANSWERS[i].toUpperCase() === possibleAnswers[i].toUpperCase())
            hits++

    let points = 0

    switch (hits){
        case 0:
            swal("¡Deberías leer más!", "No has acertado ninguna palabra, ¡Intentalo de nuevo!", "error", {
                button: "¡Aceptar!",
            });
            break;
        case 1:
            swal("¡No está mal!", "Has acertado una palabra, disfruta de tus 50 puntos", "success", {
                button: "¡Gracias!",
            });
            points = 50
            break;
        case 2:
            swal("¡Te defiendes bien!", "Has acertado dos palabras, disfruta de tus 125 puntos", "success", {
                button: "¡Gracias!",
            });
            points = 125
            break;
        case 3:
            swal("¡Eres todo un cerebrito!", "Has acertado todas las palabras, disfruta de tus 225 puntos", "success", {
                button: "¡Gracias!",
            });
            points = 225
            break;
        default:
            swal("¡Oh no!", "Ha ocurrido un error al comprobar las preguntas, ¡Intentalo de nuevo!", "error", {
                button: "¡Aceptar!",
            });
    }

    givePoints(points)
    newQuestions()
}

async function givePoints(points){
    await ($.post('/addPoints', {points: points}, function (data, status) {
        if (status !== 'success') swal("¡Oh no!", "Ha ocurrido un error al otorgar los puntos, ¡Intentalo de nuevo!", "error", {button: "¡Aceptar!",});
    }));
}