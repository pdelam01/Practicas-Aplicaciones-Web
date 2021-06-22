var kromos = [];
var index = 0;
var collections = [];

async function start() {
    var auxLoad = await loadData();
    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'buysell'
    }
    
    writeData(auxLoad);

    kromos = await loadCards();
    kromos = JSON.parse(kromos);

    var aux = await loadCollections();
    collections = JSON.parse(aux);
    writeCard();
    
    newRow();
    loadRows();

}

async function loadData() {
    return $.post(
        "/userInfo",
    );
}

async function loadCollections() {
    return $.post(
        "/collections",
    );
}

function writeData(data) {
    document.getElementById("nombre").innerHTML = data.name.concat(" "+data.surnames);
}

async function loadCards() {
    return $.post(
        "/cards",
    );
}

async function writeCard() {
    document.getElementById("name").value = kromos[index].name;
    document.getElementById("price").value = kromos[index].price;
    document.getElementById("units").value = kromos[index].remainingUnits;
    var nameCol = await idToNameCollection(kromos[index].idcollections);
    namecol = JSON.parse(nameCol);
    document.getElementById("nameCol").value = nameCol.replaceAll("\"", "");
    var path = `url(../resources/kromos/${kromos[index].imagePath}.png)`;
    document.getElementById("expositor").style.backgroundImage = path;
}

async function idToNameCollection(id) {
    return $.post(
        "/nameCollectionId",
        {id: id}
    );
}

function stepBack() {
    if(index>0) {
        index --;
        writeCard();
    }
}

function stepForward() {
    if(index<kromos.length-1){
        index ++;
        writeCard();
    }
}

function loadRows(){
    for(let i=1; i<=collections.length; i++) {
       rowState(i); 
       rowPrice(i);
       rowName(i);
    }
}

function rowState(rowNum) {
    const table = document.getElementById("albums_table");
    
    var cell = document.getElementById("status_"+rowNum);
    if(collections[rowNum - 1].activated == 0) {
        cell.innerHTML = "No activa";   
    }else{
        cell.innerHTML = "Activa";
    }
}

function rowPrice(rowNum) {
    var cell = document.getElementById("price_"+rowNum);
    cell.innerHTML = collections[rowNum - 1].price;   
}

function rowName(rowNum){
    var cell = document.getElementById("name_"+rowNum);
    
    if(rowNum > 6 && rowNum < 9){
        
        var img = document.createElement('img');
        img.src = "http://onkisko.ciscofreak.com:3000/landingPageUser/assets/img/newcollection.jpg";

        img.width = '30';
        img.height = '30';
        img.className = 'rounded-circle me-2';

        var espacio = '&nbsp;';  
        
        cell.innerHTML = '';
        
        cell.appendChild(img);
        cell.innerHTML += espacio + collections[rowNum - 1].name;  



    }else{
        cell.innerHTML += collections[rowNum - 1].name;
    }
}

function newRow() {
    const table = document.getElementById("albums_table");

    //Contador de id's
    let id = 9;

    while(table.rows.length < collections.length){
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        nameCell.setAttribute('id', "name_"+id);
        let priceCell = document.createElement('td');
        priceCell.setAttribute('id', "price_"+id);
        let statusCell = document.createElement('td');
        statusCell.setAttribute('id', "status_"+id);
        let buyCell = document.createElement('td');
        buyCell.setAttribute('id', "buy_"+id);

        //Relleno de nameCell
        var nameImage = document.createElement("img");

        nameImage.src = "http://onkisko.ciscofreak.com:3000/landingPageUser/assets/img/newcollection.jpg";

        //Parametros de la imagen
        nameImage.width = '30';
        nameImage.height = '30';
        nameImage.className = 'rounded-circle me-2'

        nameCell.appendChild(nameImage);
        nameCell.innerHTML += '&nbsp;';
        row.appendChild(nameCell);

        //Relleno de priceCell
        let price = document.createTextNode('');
        priceCell.appendChild(price);
        row.appendChild(priceCell);

        //Relleno de statusCell
        let status = document.createTextNode('');
        statusCell.appendChild(status);
        row.appendChild(statusCell);

        //Relleno de buyCell
        let buy = document.createElement('a');

        //Parametros anchor
        buy.innerText = "Comprar";

        //Modificar cuando se implemente la compra
        buy.href = '#';

        buyCell.appendChild(buy);
        row.appendChild(buyCell);

        table.appendChild(row);
    id++;
    }
}

/* COMPRA DE KROMOS */

async function buyCard() {
    var user = await loadData();
    user = JSON.parse(user);
    var name = document.getElementById("name").value;
    var price = document.getElementById("price").value;
    var remainingUnits = document.getElementById("units").value;
    var nameCol = document.getElementById("nameCol").value;
    if(remainingUnits==0) {
        swal('Oops...', 'No hay unidades restantes de dicho kromo', 'error');
    }else if(user.points<price){
        swal('Oops...', 'Usted no posee los suficientes puntos para comprar el kromo', 'error');
    }else{
        //Realizar compra
        var idCard = await loadIdCard(name);
        idCard = JSON.parse(idCard);

        var albums = await loadAlbums(user.idusers);
        albums = JSON.parse(albums);
        albums = formatAlbums(albums);       
        
        var idsCol = [];
        for(let i=0; i<albums.length; i++) {
            var aux = await loadIdsCollection(albums[i]);
            idsCol.push(JSON.parse(aux));

        }

        var nameCollections = [];
        for(let i=0; i<idsCol.length; i++) {
            nameCollections.push(JSON.parse(await idToNameCollection(idsCol[i])));
        }

        var idAlbum = obtainAlbum(albums, nameCollections, nameCol)
        if(idAlbum!=null){
            var state = await loadState(idAlbum);
            state = JSON.parse(state);
            if(state.activated==1){
                if(await makeOperation(idCard, price, idAlbum, user.idusers)){
                    await actualizarEstadoAlbum(idAlbum);
                    swal("¡Perfecto!", "Cromo comprado","success")
                    .then(function(isConfirm) {
                    if (isConfirm) {
                        location.reload();
                    } else {
                        //if no clicked => do something else
                    }
                    });
                }
            }else{
                swal('Oops...', 'No se puede comprar un kromo si su coleccion no esta activa', 'error');
            }
        }else{
            swal('Oops...', 'Usted no posee el album necesario para dicho kromo', 'error');
        }
    }
}


async function makeOperation(idCard, points, idAlbum, idUser) {
    var resultado = await asociatedAlbumCard(idCard, idAlbum);
    if(resultado == "Ok") {
        operationCards(idCard);
        await operationUsers(points, idUser); 
        return true; 
    }else{
        swal('Oops...', '¡Usted no puede tener kromos repetidos!\n¡Comparta con los demas!', 'error');
        return false;
    }
}

async function actualizarEstadoAlbum(idAlbum) {
    var units = await loadUnits(idAlbum);
    if(units==0) {
        await updateAlbum(idAlbum, "Completada parcialmente");
    }else if(units==10){
        await updateAlbum(idAlbum, "Finaliza");
    }
}
function obtainAlbum(idsAlbums, nameCollections, name) {    
    for(let i=0; i<nameCollections.length; i++) {
        if(nameCollections[i]==name) {
            return idsAlbums[i];
        }
    }
}

function formatAlbums(albums) {
    var output = [];
    for(let i=0; i<albums.length; i++) {
        output.push(albums[i].idalbums);
    }
    return output;
}

async function updateAlbum(id, state) {
    return $.post(
        "/updateStateAlbum",
        {idAlbum: id,
        stateAlbum: state}
    );
}


async function loadUnits(id) {
    return $.post(
        "/cardsByUser",
        {id: id}
    );
}

async function loadState(id) {
    return $.post(
        "/activatedCollectionId",
        {id: id}
    );
}

async function loadIdCard(name) {
    return $.post(
        "/idCard",
        {name: name}
    );
}

async function operationUsers(points, id) {
    return $.post(
        "/subtractPoints",
        {points: points,
        id: id}
    );
}

async function operationCards(id) {
    return $.post(
        "/subtractCards",
        {id: id}
    );
}


async function loadAlbums(idUser) {
    return $.post(
        "/idlbumsUser",
        {id: idUser}
    );
}

async function loadIdsCollection(idAlbum) {
    return $.post(
        "/albumsCollection",
        {id: idAlbum}
    );
}

async function asociatedAlbumCard(idCards, idAlbum) {
    return $.post(
        "/albumsWithCards",
        {idAlbum: idAlbum,
        idCard: idCards}
    );
}

/* FIN COMPRA DE KROMOS */

/* COMPRA DE ALBUMS */

async function buyAlbum(id) {    
    var user = await loadData();
    user = JSON.parse(user);    
    var price = document.getElementById("price_"+id).innerHTML;    
    if(user.points<price) {
        swal('Oops...', 'Usted no posee los suficientes puntos para comprar el kromo', 'error');
    }else{      
        var state = await loadStateCol(id);
        if(state==1){
            await buyAlbumBD(id, user.idusers);
           swal("¡Perfecto!", "Colección comprada","success")
                .then(function(isConfirm) {
                if (isConfirm) {
                    location.reload();
                } else {
                    //if no clicked => do something else
                }
                });
        }else{
            swal('Oops...', 'No se puede comprar un album si su coleccion no esta activa', 'error');
        }  
    }
}

async function buyAlbumBD(idCol, idUs) {
    return $.post(
        "/insertAlbums",
        {idCollection: idCol,
        idUser: idUs}
    );
}

async function loadStateCol(idCol) {
    return $.post(
        "/stateCollectionId",
        {id: idCol}
    );
}

/* FIN COMPRA DE ALBUMS */
