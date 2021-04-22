var items = [
    ["C", "L", "A", "N"],
    ["C", "I", "A", "N"],
    ["N", "A", "C", "I"],
    ["N", "A", "C", "E"],
    ["C", "E", "N", "A"],
    ["P", "E", "N", "A"],
    ["R", "E", "M", "A", "T", "O"],
    ["R", "E", "M", "O", "T", "O"],
    ["M", "O", "T", "E", "R", "O"],
    ["L", "O", "T", "E", "R", "O"],
    ["T", "O", "L", "E", "R", "O"],
    ["T", "O", "T", "E", "R", "O"],
];
let alf="clanciannacinacecenapenarematoremotomoteroloterotolerotorero";

function crearTabla() {
    let div = document.getElementsByTagName("div")[4];
    let form = document.createElement("form");
    form.name = "myFrom";
    let idsNum = 1;
    let aux=1;

    let tabla = document.createElement("table");
    let tblBody = document.createElement("tbody");

    let hilera;
    let celda;
    let input;
    let et;

    for (let i = 0; i < 6; i++) {
        hilera = document.createElement("tr");

        for (let j = 0; j < 5; j++) {
            if(j==4){
                celda = document.createElement("td");
                et = document.createElement("a");
                if(aux==1){
                    et.innerHTML="← 1"
                }else if(aux==6) {
                    et.innerHTML = "← 2"
                }
                celda.appendChild(et);
                hilera.appendChild(celda);
            }else{
                celda = document.createElement("td");
                input = document.createElement("input");
                input.type = "text"; //setAttribute("type", "text");
                input.maxLength = 1; //setAttribute("maxlength", "1");
                input.className = "cuadrados";//setAttribute("class", "cuadrados");
                input.id = idsNum.toString();
                input.style="text-transform:uppercase;";
                celda.appendChild(input);
                hilera.appendChild(celda);
                idsNum+=1;
            }
        }
        aux++;
        tblBody.appendChild(hilera);
    }

    aux=1;

    for (let k = 0; k < 6; k++) {
        hilera = document.createElement("tr");

        for (let j = 0; j < 7; j++) {
            if(j==6){
                celda = document.createElement("td");
                et = document.createElement("a");
                if(aux==1){
                    et.innerHTML="← 3"
                }else if(aux==6) {
                    et.innerHTML = "← 4"
                }
                celda.appendChild(et);
                hilera.appendChild(celda);
            }else{
                celda = document.createElement("td");
                input = document.createElement("input");
                input.type = "text"; //setAttribute("type", "text");
                input.maxLength = 1; //setAttribute("maxlength", "1");
                input.className = "cuadrados";//setAttribute("class", "cuadrados");
                input.id = idsNum.toString();
                input.style="text-transform:uppercase;";
                celda.appendChild(input);
                hilera.appendChild(celda);
                idsNum+=1;
            }
        }
        aux++;
        tblBody.appendChild(hilera);
    }

    tabla.appendChild(tblBody);
    form.appendChild(tabla);
    div.appendChild(form);
    createButtons(form);

    tabla.className = "tabla";
    form.className= "former";
}

function saveData(){
    for (let i = 1; i <= 60; i++) {
        localStorage.setItem(i.toString(), document.getElementById(i.toString()).value);
    }
}

function loadData() {
    for (let i = 1; i <= 60; i++) {
        document.getElementById(i.toString()).value = localStorage.getItem(i.toString());
    }
}


function displayText(){
    if(confirm("¿Desearía ALMACENAR su progreso en almacenamiento local?")){
        saveData();
    }else{
        if(confirm("¿Desearía ELIMINAR su progreso en almacenamiento local?")){
            localStorage.clear();
            for (let i = 1; i <= 60; i++) {
                document.getElementById(i.toString()).value = '';
            }
        }
    }
}

function createButtons(form){
    let resetBtn = document.createElement("input");
    resetBtn.type = "reset"; //resetBtn.setAttribute("type", "reset");
    resetBtn.innerHTML = "Restablecer";

    let guardarBtn = document.createElement("button");
    guardarBtn.innerHTML = "Guardar";
    guardarBtn.type = "button";
    guardarBtn.setAttribute("onclick", "displayText()");

    let resolverBtn = document.createElement("button");
    resolverBtn.innerHTML = "Comprobar";
    resolverBtn.type = "button";
    resolverBtn.setAttribute("onclick", "checkCorrecto()");

    let pistaBtn = document.createElement("button");
    pistaBtn.innerHTML = "Pista";
    pistaBtn.type = "button";
    pistaBtn.setAttribute("onclick","mostrarPista()");

    form.appendChild(resetBtn);
    form.appendChild(guardarBtn);
    form.appendChild(resolverBtn);
    form.appendChild(pistaBtn);

    resetBtn.className="botones";
    guardarBtn.className="botones";
    resolverBtn.className="botones";
    pistaBtn.className="botones";
}


let cont=3;
let arr = [];
let flags = 'g';
function mostrarPista(){
    if(cont==0){
        alert("¡Número de máximo pistas alcanzado!")
    } else {
        //let texto = prompt("Escriba su palabra: ","Pistas restantes: "+cont);
        //let regex = new RegExp("[a-zA-Z]*" + texto.toString() + "[a-zA-Z]*",flags);
        //let regex = new RegExp("[^\s]*" + texto.toString() + "[^\s]*",flags);
        /*for (let i = 0; i < texto.length; i++) {
            let regex = new RegExp("[a-zA-Z]*" + texto.charAt(i) + "[a-zA-Z]*",flags);
            if(resp.toString().matchAll(regex)){
                for (let i of resp.toString().matchAll(regex)) {
                    arr.push(" "+i)
                }
                funcion(arr);
                arr=[];
            }*/

        let texto = prompt("Escriba su palabra: ", "Pistas restantes: " + cont);
        if(texto!=null) {
            const output = find(resp, texto);
            for (let i of output) {
                arr.push(" " + i)
            }
            funcion(arr);
            arr = [];
            cont--;
        }
    }
}

function find(palabras, str) {
    //Dividimos el String en un array
    str = str.split('');
    //Filter añadirá la palbra si todas las condiciones se cumplen
    return palabras.filter(function(word) {
        //Tomamos todos los elementos en str y vemos si aparece en algún lugar en la palabra
        return str.every(function(char) {
            //Comprobamos si el caracter se incluye en la palabra
            return word.includes(char);
        });
    });
}

let divis = document.createElement("div");
let body = document.getElementsByTagName("body")[0];
let head = document.createElement("h2");
function funcion(arr){
    head.innerHTML="Lista de palabras"
    divis.className="items2";
    divis.textContent=arr;

    divis.appendChild(head);
    body.appendChild(divis);
}

var script;
var resp=[];
async function cargaAsyn() {
    script = document.createElement("script");
    //script.src = "https://ordenalfabetix.unileon.es/aw/diccionario.txt";
    script.src = "https://diccionario.casasoladerueda.es/diccionario.txt";
    script.crossOrigin = "anonymous";
    document.body.append(script);

    Promise.all([
        fetch(script.src).then(x => x.text()),
    ]).then(([respuesta]) => {
        prepararResp(respuesta);
    });
}


function checkCorrecto(){
    let arrDe4=[];
    let arrDe6=[];
    let arr4Aux=[];
    let arr6Aux=[];
    let auxCont=0;
    let auxCont2=0;

    for (let i = 0; i < 24; i++) {
        arrDe4.push(document.getElementById(""+(i+1)).value)
    }

    for (let k = 24; k < 60; k++) {
        arrDe6.push(document.getElementById(""+(k+1)).value)
    }

    arr4Aux=dividirEnGrupos(arrDe4,4);
    arr6Aux=dividirEnGrupos(arrDe6,6);

    if(comprobaciones(arr4Aux,arr6Aux)){
        for (let j = 0; j < arr4Aux.length; j++) {
            if (resp.includes(arr4Aux[j].join("").toString().toLowerCase())) {
                auxCont++;
            }

            if (resp.includes(arr6Aux[j].join("").toString().toLowerCase())) {
                auxCont2++;
            }
        }

        if (auxCont === 6 && auxCont2 === 5) {
            alert("¡Perfecto! Puzzle completado")
        } else {
            alert("Lo siento... algo debe estar mal")
        }
    }else{
        alert("Lo siento... algo debe estar mal")
    }
}

function prepararResp(dictionary){
    return resp=dictionary.split("\n")
}

function comprobaciones(arr4Aux,arr6Aux){
    let aux=false;
    let aux2=true;
    if (arr4Aux[0].join("").toString().toLowerCase()==="clan" &&
        arr4Aux[5].join("").toString().toLowerCase()==="pena" &&
        arr6Aux[0].join("").toString().toLowerCase()==="remato" &&
        arr6Aux[5].join("").toString().toLowerCase()==="torero" ){
            aux = true;
    }

    for (let i = 0; i < arr6Aux.length; i++) {
        for (let j = 0; j < arr6Aux.length; j++) {
            if(arr6Aux[i][j]==="" || arr4Aux[i][j]===""){
                aux2=false;
            }
        }
    }

    if(aux===true && aux2===true){
        return true;
    }
}

function dividirEnGrupos(input,tam) {
    let division = [];
    for (let i = 0;  i < input.length; i += tam) {
        division.push(input.slice(i, i + tam))
    }
    return division;
}

function start(){
    crearTabla();
    loadData();
    cargaAsyn();
}

/*function retornarPalabras(){
    let arr = [];
    let cont=0;
    for (let i=0;i<60;i++){
        arr.push(document.getElementById(""+(i+1)).value)
        cont ++;
        if(cont==4) {
            break;
        }
    }
    alert(arr.join("").toString().toLowerCase())
    return arr.join("").toString().toLowerCase();
}*/

/*function checkCorrecto(){
    let cont=0;
    //comprobar correccion frente a dic
    for (let i=1;i<=alf.length;i++){
        if (document.getElementById(i.toString()).value.toUpperCase() == alf[i-1].toString().toUpperCase()){
            cont++;
        }
    }

    if(cont==alf.length){
        alert("¡Perfecto! Puzzle completado")
    }else{
        alert("Lo siento... algo debe estar mal")
    }
}*/
