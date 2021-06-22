var valoresKromo = [];
var valoresColeccion = [];
var valoresColeccionEdit = [];
var auxTimes;
var auxTimesAdd;
var imgs = [];
var idCollectionEdit;
var nameColK;
var collections = [];
var kromos = [];
var index = 0;


/* Inicialization */
async function start(){
    var auxLoad = await loadNameUsr();
    try{
        auxLoad = JSON.parse(auxLoad);
    }catch(e){
        window.location.href = 'index'
    }
    writeData(auxLoad);
    auxTimesAdd = 0;
    auxTimes = 0; 
    
    var aux = await loadCollections();
    collections = JSON.parse(aux);    
    writeCollections();

    kromos = await loadCards();
    kromos = JSON.parse(kromos);
    writeCard();
}

/* POST methods */
async function closeSession() {
    return $.post(
        "/closeSession",
        {session: "session"}
    );
}

async function loadNameUsr() {
    return $.post(
        "/userInfo",
        {session: "session"}
    );
}

async function loadCards() {
    return $.post(
        "/cards",
    );
}

async function writeCard() {
    document.getElementById("name_kromo").value = kromos[index].name;
    document.getElementById("price_kromo").value = kromos[index].price;
    document.getElementById("units_kromo").value = kromos[index].remainingUnits;
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

async function loadCollections() {
    return $.post(
        "/collections",
    );
}

async function saveDataDB(valoresStringCol, num) {
    return $.post(
        "/collectionAdd",
        {kromos: valoresKromo.toString(),
            collection: valoresStringCol,
            numCol: num }
    );
}

async function saveDataDBEdit(valoresStringCol, idCollectionEdit){
    return $.post(
        "/collectionEdit",
        {collection: valoresStringCol,
            idCol: idCollectionEdit}
    );
}

async function saveImgDB() {
    return $.post(
        "/upload",
        {images: imgs}
    );
}

/* Main functions */
function addKromoFront(nameKromo){
    if(auxTimes<10){
        var li = document.createElement('li');
        li.appendChild(document.createTextNode("Kromo "+(auxTimes+1)+": "+nameKromo));
        document.getElementById('idUl').appendChild(li);
        auxTimes++;
    }
}

function writeData(data) {
    document.getElementById("nombre").innerHTML = data.name.concat(" "+data.surnames);
}

function writeCollections() {
    var pos;
    for(let i=0; i<6; i++) {
        pos = i+1;
        document.getElementById("name_"+pos).innerHTML += collections[i].name;
    }
    for(let i=6; i<collections.length; i++) {
        addRow(i);
    }
}


function modalId(id){
    idCollectionEdit = id;
}

async function addKromo(){
    var nameKromo = document.getElementById('nameCrear').value;
    var precioKromo = document.getElementById('precioCrear').value;
    var cantMaxKromo = document.getElementById('cantMaxCrear').value;
    var fileImg = document.getElementById('fileImg').value;
    imgs.push(fileImg);
    var valoresString;

    if(auxTimesAdd===9){
        $('#kromo').modal('hide');
        document.getElementById('nameCrear').value='';
        document.getElementById('precioCrear').value='';
        document.getElementById('cantMaxCrear').value='';
        //document.getElementById('fileImg').value='';
    }

    nameColK = document.getElementById('name').value;
    if(nameColK.length>0 && nameColK.length<=45){
        if(nameKromo.length>0 && nameKromo.length<=45){
            if(precioKromo>=25 && precioKromo<=150){
                if(cantMaxKromo>=5 && cantMaxKromo<=10){
                        valoresString = nameKromo.concat("-");
                        valoresString = valoresString.concat(precioKromo+"-");
                        valoresString = valoresString.concat(cantMaxKromo+"-");
                        //var path = 'Kromo'+(auxTimesAdd+1)+'_'+nameColK;
                        //valoresString = valoresString.concat(path);
                        addKromoFront(nameKromo);
                        valoresKromo.push(valoresString);
                        auxTimesAdd++;
                }else{
                    swal('Oops...', 'La cantidad maxima de cromos ha de ser entre 5 y 10', 'error'); 
                }
            }else{
                swal('Oops...', 'El precio de los cromos ha de ser entre 25 y 150', 'error'); 
            }
        }else{
            swal('Oops...', 'Debe establecer una nombre para el cromo', 'error');  
        }
    }else{
        swal('Oops...', 'Debe establecer una nombre para la colección', 'error');
    }
    
}

async function addCollection(){
    var nameCol= document.getElementById('name').value;
    var priceCol = document.getElementById('price').value;
    var activatedColY = document.getElementById('activatedYes').checked;
    var activatedColN = document.getElementById('activatedNo').checked;
    var valoresStringCol;

    if(valoresKromo.length===10){
        if(nameCol.length>0 && nameCol.length<=45){
            if(priceCol>=150 && priceCol<=350){
                if(activatedColY || activatedColN){
                    valoresStringCol = nameCol.concat("-");
                    valoresStringCol = valoresStringCol.concat(priceCol+"-");
                    if(activatedColY){
                        valoresStringCol = valoresStringCol.concat("1"+"-");
                    }else{
                        valoresStringCol = valoresStringCol.concat("0");
                    }
                    await saveDataDB(valoresStringCol, 1);
                    swal('¡Perfecto!', 'Colección añadida', 'success')
                    .then(function(isConfirm) {
                        if (isConfirm) location.reload();
                    });
                }else{
                    swal('Oops...', 'Debe seleccionar una de las opciones Activa o No Activa', 'error'); 
                }
            }else{
                swal('Oops...', 'El precio debe establecerse entre 150 y 350 puntos', 'error'); 
            }
        }else{
            swal('Oops...', 'Debe establecer una nombre para la colección', 'error'); 
        }
    }else{
        swal('Oops...', 'Debe crear 10 cromos', 'error');
    }
    //location.reload();
}

function obtainId(path) {
    try {
        var ruta = path.split("_");
        var auxiliar = ruta[1].replace("N","");
        var aux = auxiliar.split("n");
        if(aux[1]!=undefined){
            return aux[1];
        }else{
            return 0;
        }
    } catch(e) {
        return 0;
    }
}

function valueDefault(id) {
    var pos = id - 1;
    document.getElementById('nombreKromoEdit').value = collections[pos].name;
    document.getElementById('precioKromoEdit').value = collections[pos].price;
    if(collections[pos].activated == 1) {
        document.getElementById('activatedYesEdit').checked = true;
    }else{
        document.getElementById('activatedNoEdit').checked = true;
    }
}

async function editCollection(){
    var nameCol= document.getElementById('nombreKromoEdit').value;
    var priceCol = document.getElementById('precioKromoEdit').value;
    var activatedColY = document.getElementById('activatedYesEdit').checked;
    var activatedColN = document.getElementById('activatedNoEdit').checked;
    var valoresStringCol;

    if(nameCol.length>0 && nameCol.length<=45){
        if(priceCol>=150 && priceCol<=350){
            if(activatedColY || activatedColN){
                valoresStringCol = nameCol.concat("-");
                valoresStringCol = valoresStringCol.concat(priceCol+"-");
                if(activatedColY){
                    valoresStringCol = valoresStringCol.concat("1"+"-");
                }else{
                    valoresStringCol = valoresStringCol.concat("0");
                }
                
                await saveDataDBEdit(valoresStringCol, idCollectionEdit);
                swal("¡Perfecto!", "Colección modificada","success")
                .then(function(isConfirm) {
                if (isConfirm) {
                    location.reload();
                } else {
                    //if no clicked => do something else
                }
                });
            }else{
                swal('Oops...', 'Debe seleccionar una de las opciones Activa o No Activa', 'error'); 
            }
        }else{
            swal('Oops...', 'El precio debe establecerse entre 150 y 350 puntos', 'error'); 
        }
    }else{
        swal('Oops...', 'Debe establecer una nombre para la colección', 'error'); 
    }
}

function addRow(id){
    let pos = id + 1;
    const table = document.getElementById("edit_table");

    let row = document.createElement('tr');

    let nameCell = document.createElement('td');

        let nameImage = document.createElement("img");
        
        //Source de la imagen
        nameImage.src = "http://onkisko.ciscofreak.com:3000/landingPageUser/assets/img/newcollection.jpg";
        nameImage.width = '30';
        nameImage.height = '30';
        nameImage.className = 'rounded-circle me-2';

        let nameText = document.createTextNode(collections[id].name);
       
        nameCell.appendChild(nameImage);
        nameCell.innerHTML += '&nbsp;';
        nameCell.appendChild(nameText);

        let editCell = document.createElement('td');

        let editLink = document.createElement('a');

        editLink.innerText = "Editar";
        editLink.href = '#collection';
        editLink.setAttribute('data-bs-toggle', "modal");
        editLink.setAttribute('onclick', "modalId(" + pos + "), valueDefault(" + pos + ");");
       
        editCell.appendChild(editLink);

        row.appendChild(nameCell);
        row.appendChild(editCell);

        table.appendChild(row);
}

async function newcopy() {
    await updateKromo();
    swal("¡Perfecto!", "Nueva copia creada","success")
                .then(function(isConfirm) {
                if (isConfirm) {
                    location.reload();
                } else {
                    //if no clicked => do something else
                }
                });
}

async function updateKromo() {
    return $.post(
        "/updateRemainingUnits",
        {idCards: index+1}
    );
}

async function loadNum() {
    return $.post(
        "/obtainIdNewKromo",
    );
}
