var kromos = [];
var mostrando = 0;
var collections = [];

async function start(){
    var auxLoad = await loadData();
    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'table'
    }
    
    writeData(auxLoad);

    var albums = await loadAlbums();
    albums = JSON.parse(albums);

    collections = await loadCollections(albums[1]);
    collections = JSON.parse(collections);

    await writeCollections();
    writeStatus(collections.length);
        
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

async function loadAlbums() {
    return $.post(
        "/userAlbums",
        {session: "session"}
    );
}

async function loadCollections() {
    return $.post(
        "/collections",
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

async function writeCollections() {
    for(let i=0; i<6; i++) {
        //writeRowName(i);
        writeRowActivated(i);
        writeRowPrice(i);
        writeRowUnits(i);
        writeRowDate(i);
    }
    for(let i=6; i<collections.length; i++) {
        await addRow("assets/img/logoKromos/valorantLogo.png", collections[i].name, i+1,  collections[i].activated, collections[i].price, await loadUnits(i+1), datetimeToDate(collections[i].date));
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

async function writeRowUnits(index) {
    var pos = index + 1;
    var units = await loadUnits(pos);
    document.getElementById(pos+"_total").innerHTML = units;
}

async function loadUnits(id) {
    return $.post(
        "/cardsByUser",
        {id: id}
    );
}

function writeRowDate(index) {
    var pos = index + 1;
    document.getElementById(pos+"_date").innerHTML = datetimeToDate(collections[index].date);
}

function writeNumberCards(idCollections, cards) {
    for(let i=0; i<idCollections.length; i++) {
        switch(idCollections[i]) {
            case 1:
                document.getElementById("2_total").innerHTML = cards[i];
                break;
            case 2:
                document.getElementById("4_total").innerHTML = cards[i];
                break;
            case 3:
                document.getElementById("6_total").innerHTML = cards[i];
                break;
            case 4:
                document.getElementById("3_total").innerHTML = cards[i];
                break;
            case 5:
                document.getElementById("5_total").innerHTML = cards[i];
                break;
            case 6:
                document.getElementById("1_total").innerHTML = cards[i];
                break;
            default:
                var ruta = i+"_total";
                document.getElementById(ruta).innerHTML = cards[i];
        }
    }
}

function writeStatus(numberCollections) {
    for(let i=0; i<numberCollections; i++) {
        var ruta = (i+1)+"_total";
        writeRealStatus(document.getElementById(ruta).innerHTML, i+1);
    }
}

function writeRealStatus(number, pos) {
    var ruta = pos+"_state"
    if(number==10){
        document.getElementById(ruta).innerHTML = "Finalizada";
    }else if(number>0 && number<10) {
        document.getElementById(ruta).innerHTML = "Completada parcialmente";
    }else{
        document.getElementById(ruta).innerHTML = "No iniciada";
    }
}

function formatAlbumNumbers(albums) {
    var output = [];
    for(let i=0; i<albums.length; i++) {
        output.push(albums[i].idcollection)
    }
    return output;
}

function datetimeToDate(mySQLDate){
    var date = mySQLDate.split("T");
    var aux = date[0].split("-");
    date = aux[2]+"/"+aux[1]+"/"+aux[0];
    return date;
}

/*PARTE DEL MODAL*/
async function modal(collection) {
    resetModal();
    var albums = await loadAlbums();
    albums = JSON.parse(albums);
    if(albums[1].length>0){
        albums = extractAlbums(albums[1], collection);
        if(albums.length>0){
            var cards = await loadCards(albums);
            cards = JSON.parse(cards);
            kromos = cards;
            showCard(kromos[0]);
        }
    }
}

async function showCard(card) {
    document.getElementById("nameModal").value = card[0].name;
    document.getElementById("priceModal").value = card[0].price;
    document.getElementById("unitsModal").value = 1;
    var nameCol = await idToNameCollection(card[0].idcollections);
    namecol = JSON.parse(nameCol);
    document.getElementById("nameColModal").value = nameCol.replaceAll("\"", "");
    var path = `url(../resources/kromos/${card[0].imagePath}.png)`;
    document.getElementById("expositor-kromo").style.backgroundImage = path;
}

async function idToNameCollection(id) {    
    return $.post(
        "/nameCollectionId",
        {id: id}
    );
}

function resetModal() {
    kromos = [];
    mostrando = 0;
    document.getElementById("nameModal").value = "";
    document.getElementById("priceModal").value = "";
    document.getElementById("unitsModal").value = "";
    document.getElementById("nameColModal").value = "";
    var path = `url(https://www.hemomadrid.com/wp-content/uploads/2015/09/imagen-vacia.jpg)`;
    document.getElementById("expositor-kromo").style.backgroundImage = path;
}

function extractAlbums(json, collection) {
    var albums = [];
    for(let i=0; i<json.length; i++) {
        if(json[i].idcollection == collection){
            albums.push(json[i].idalbums);
        }
    }
    return albums;
}

async function loadCards(albums) {
    return $.post(
        "/cardsAlbum",
        {id: albums[0]}
    );
}

/*PARTE DE LOS MOVIMIENTOS*/
function stepBack() {
    if(mostrando>0) {
        mostrando --;
        showCard(kromos[mostrando]);
    }
}

function stepForward() {
    if(mostrando<kromos.length-1){
        mostrando ++;
        showCard(kromos[mostrando]);
    }
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
    var nameText = document.createElement('a');

        //Parametros anchor
        nameText.innerText = name;
        nameText.href = '#kromo';
        nameText.setAttribute('data-bs-toggle', "modal");
        nameText.setAttribute('onclick', "modal("+ nameCollection +")");

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
    var quantityText = document.createTextNode(quantity);

    //Celda fecha alta
    var dateCell = document.createElement("td");
    var dateText = document.createTextNode(date);

    //Celda estado
    var statusCell = document.createElement("td");
    var statusText = document.createTextNode('');


    //Rellenar fila con los elementos
    nameCell.appendChild(nameImage);
    nameCell.innerHTML += '&nbsp;';
    nameCell.appendChild(nameText);    
    row.appendChild(nameCell);

    activeCell.appendChild(activeText);
    activeCell.setAttribute('id', nameCollection+"_active");
    row.appendChild(activeCell);    

    pointsCell.appendChild(pointsText);
    pointsCell.setAttribute('id', nameCollection+"_points");
    row.appendChild(pointsCell);
    

    quantityCell.appendChild(quantityText);
    quantityCell.setAttribute('id', nameCollection+"_total");
    row.appendChild(quantityCell);
    

    dateCell.appendChild(dateText);
    dateCell.setAttribute('id', nameCollection+"_date");
    row.appendChild(dateCell);

    statusCell.appendChild(statusText);
    statusCell.setAttribute('id', nameCollection+"_state");
    row.appendChild(statusCell);

    //Agregar a la tabla
    table.appendChild(row);
}
