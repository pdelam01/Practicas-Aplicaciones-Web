async function start() {
    var auxLoad = await loadData();

    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'captcha'
    }
    
    writeData(auxLoad);
}

async function loadData() {
    return $.post(
        "/userInfo",
        { session: "session" }
    );
}

function writeData(data) {
    document.getElementById("nombre").innerHTML = data.name.concat(" " + data.surnames);
}

async function captcha() {
    
    //Captcha response
    var formData = new FormData(document.getElementById('submit_form'));
    var captcha = formData.get('g-recaptcha-response');
    
    var solucion = false;
    //Opcion con jquery


    if ('true' === await verifyCaptcha(captcha)) {
        givePoints(50)
        swal({
            title: '¡Enhorabuena ser humano',
            text: "¡Disfruta de tus 50 puntos por hacer absolutamente nada!",
            icon: 'success',
            button: "¡Gracias!"
        })
            .then(() => {
                location.reload();
            });
    } else {
        swal({
            title: '¿Beep-boop?',
            text: "El captcha no se pudo validar, intentalo de nuevo.",
            icon: 'error',
            button: "¡Perfecto!"
        })
            .then(() => {
                location.reload();
            });
    }
}

async function verifyCaptcha(captcha) {
    return $.post("/submit", { captcha: captcha }, function (req, res) {
        if (status !== 'success') swal("¡Oh no!", "Ha ocurrido un error al validar el captcha, ¡Intentalo de nuevo!", "error", { button: "¡Aceptar!", });
    });
}


async function givePoints(points) {
    await ($.post('/addPoints', { points: points }, function (data, status) {
        if (status !== 'success') swal("¡Oh no!", "Ha ocurrido un error al otorgar los puntos, ¡Intentalo de nuevo!", "error", { button: "¡Aceptar!", });
    }));
}