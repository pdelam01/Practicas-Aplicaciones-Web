async function start(){
    var auxLoad = await loadData();
    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'index'
    }
    writeData(auxLoad);

    var auxLoadAlbum = await loadDataAlbum();
    auxLoadAlbum = JSON.parse(auxLoadAlbum);
    writeDataAlbum(auxLoadAlbum);
}

async function closeSession() {
    return $.post(
        "/closeSession",
        {session: "session"}
    );
}

async function loadData() {
    return $.post(
        "/userInfo",
        {session: "session"}
    );
}

async function loadDataAlbum() {
    return $.post(
        "/userAlbums",
        {session: "session"}
    );
}

function writeData(data) {
    document.getElementById("username").value =  data.username;
    document.getElementById("email").value =  data.email;
    document.getElementById("first_name").value =  data.name;
    document.getElementById("last_name").value =  data.surnames;
    document.getElementById("address").value =  data.address;
    document.getElementById("city").value =  data.city;
    document.getElementById("country").value =  data.country;
    document.getElementById("puntos").innerHTML = data.points;
    document.getElementById("puntosGanados").innerHTML = data.pointsGameWin;
    document.getElementById("rol").innerHTML = data.rol;
    document.getElementById("nombre").innerHTML = data.name.concat(" "+data.surnames);
}

function writeDataAlbum(data) {
    document.getElementById("percentaje").innerHTML = Math.round(data[0]*100)+"%";
    document.getElementById("percentajeGraphic").style.width = Math.round(data[0]*100)+"%";
    var array = data[1];
    for (let i = 0; i < array.length; i++) {
        switch (array[i].idcollection) {
            case 1:
                document.getElementById("formulaNumber").innerHTML = Math.round((data[2][i]/10)*100)+"%";
                document.getElementById("formulaPercentaje").style.width = Math.round((data[2][i]/10)*100)+"%";
                break;
            case 2:
                document.getElementById("csNumber").innerHTML = Math.round((data[2][i]/10)*100)+"%";
                document.getElementById("csPercentaje").style.width = Math.round((data[2][i]/10)*100)+"%";
                break;
            case 4:
                document.getElementById("nbaNumber").innerHTML = Math.round((data[2][i]/10)*100)+"%";
                document.getElementById("nbaPercentaje").style.width = Math.round((data[2][i]/10)*100)+"%";
                break;
            case 5:
                document.getElementById("rocketNumber").innerHTML = Math.round((data[2][i]/10)*100)+"%";
                document.getElementById("rocketPercentaje").style.width = Math.round((data[2][i]/10)*100)+"%";
                break;
            case 6:
                document.getElementById("valorantNumber").innerHTML = Math.round((data[2][i]/10)*100)+"%";
                document.getElementById("valorantPercentaje").style.width = Math.round((data[2][i]/10)*100)+"%";
                break;
            default:
                break;
        }
    }
}