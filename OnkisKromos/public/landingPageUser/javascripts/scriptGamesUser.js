async function start(){
    var auxLoad = await loadData();

    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'games'
    }

    writeData(auxLoad);
}

async function loadData() {
    return $.post("/userInfo",{session: "session"})
}

function writeData(data) {
    document.getElementById("nombre").innerHTML = data.name.concat(" "+data.surnames);
}