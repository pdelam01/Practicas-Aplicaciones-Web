var collections = [];

async function start(){
    var auxLoad = await loadData();
    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'table'
    }
    writeData(auxLoad);

    var aux = await loadCollections();
    collections = JSON.parse(aux);

    var cards = await loadNumCards();
    cards = JSON.parse(cards);

    writeCollections(cards);
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

async function loadCollections() {
    return $.post(
        "/collections",
        {session: "session"}
    );
}

async function loadNumCards() {
    var ids = [];
    for(let i=0; i<collections.length; i++) {
        ids.push(collections[i].idcollections);
    }
    return $.post(
        "/cardsCollections",
        {id: ids.toString()}
    );
}

function writeCollections(cards) {
    for(let i=0; i<6; i++) {
        writeRowName(i);
        writeRowActivated(i);
        writeRowPrice(i);
        writeRowUnits(i, cards);
        writeRowDate(i);
    }
    for(let i=6; i<collections.length; i++) {
        addRow("assets/img/logoKromos/valorantLogo.png", collections[i].name, i+1,  collections[i].activated, collections[i].price, cards[i].result,datetimeToDate(collections[i].date));
    }
}

function writeRowName(index) {
    var pos = index + 1;
    document.getElementById(pos+"_logo").innerHTML += collections[index].name;
}

function writeRowActivated(index) {
    var pos = index + 1;
    if(collections[index].activated == 1){
        document.getElementById(pos+"_active").innerHTML = "Activa";
    }else{
        document.getElementById(pos+"_active").innerHTML = "No activa";
    }
}

function writeRowPrice(index) {
    var pos = index + 1;
    document.getElementById(pos+"_price").innerHTML = collections[index].price;
}

function writeRowUnits(index, cards) {
    var pos = index + 1;
    if(cards[index].result!="null"){
        document.getElementById(pos+"_total").innerHTML = cards[index].result;
    }else{
        document.getElementById(pos+"_total").innerHTML = "0";
    }
}

function writeRowDate(index) {
    var pos = index + 1;
    document.getElementById(pos+"_date").innerHTML = datetimeToDate(collections[index].date);
}

function datetimeToDate(mySQLDate){
    var date = mySQLDate.split("T");
    var aux = date[0].split("-");
    date = aux[2]+"/"+aux[1]+"/"+aux[0];
    return date;
}


/*
*   Referencia de los param:
*       nameSrc: Ruta de la imagen que mostrara la fila
*       name: Nombre de la coleccion
*       nameCollection: Numero de la colleccion en la cual se cargaran los cromos individuales en el dialogo modal
*       active: Coleccion activa o no activa
*       points: Precio de la coleccion
*       quantity: Cantidad de la coleccion
*       date: Fecha alta
*       status: Estado de la coleccion(no empezada, parcialmente completada, finalizada)
*
*   Hay un ejemplo de llamada a la funcion a modo de placeholder en la linea 25 de este fichero
*/
function addRow(nameSrc, name, nameCollection, active, points, quantity, date){
    const table = document.getElementById("collections_table");

    //Fila
    var row = document.createElement("tr");

    //Celda nombre coleccion
    var nameCell = document.createElement("td");

    //Imagen
    var nameImage = document.createElement("img");

        //Source de la imagen
        nameImage.src = "http://onkisko.ciscofreak.com:3000/landingPageUser/assets/img/newcollection.jpg";

        //Parametros de la imagen
        nameImage.width = '30';
        nameImage.height = '30';
        nameImage.className = 'rounded-circle me-2';
    
    //Anchor
    var nameText = document.createTextNode(name);

    //Celda activa
    var activeCell = document.createElement("td");
    var activeText;
    if(active == 0){
        activeText = document.createTextNode("No activa");
    }else{
        activeText = document.createTextNode("Activa");
    }
    //Celda puntos
    var pointsCell = document.createElement("td");
    var pointsText = document.createTextNode(points);

    //Celda existencias
    var quantityCell = document.createElement("td");
    var quantityText
    if(quantity!=null) {
        quantityText = document.createTextNode(quantity);
    }else{
        quantityText = document.createTextNode("0");
    }

    //Celda fecha alta
    var dateCell = document.createElement("td");
    var dateText = document.createTextNode(date);

    //Rellenar fila con los elementos
    nameCell.appendChild(nameImage);
    nameCell.innerHTML += '&nbsp;';
    nameCell.appendChild(nameText);    
    row.appendChild(nameCell);

    activeCell.appendChild(activeText);
    activeCell.setAttribute('id', (nameCollection+1)+"_active");
    row.appendChild(activeCell);    

    pointsCell.appendChild(pointsText);
    pointsCell.setAttribute('id', (nameCollection+1)+"_points");
    row.appendChild(pointsCell);
    

    quantityCell.appendChild(quantityText);
    quantityCell.setAttribute('id', (nameCollection+1)+"_total");
    row.appendChild(quantityCell);
    

    dateCell.appendChild(dateText);
    dateCell.setAttribute('id', (nameCollection+1)+"_date");
    row.appendChild(dateCell);

    //Agregar a la tabla
    table.appendChild(row);
}