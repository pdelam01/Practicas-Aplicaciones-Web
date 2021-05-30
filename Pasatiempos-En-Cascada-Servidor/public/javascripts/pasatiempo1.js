//----------------------------------//
//       VARIABLES GLOBALES         //
//----------------------------------//
var cont=3;
var arr = [];
var divis = document.createElement("div");
var script;
var resp=[];
var arraySoluciones=[];


//---------------------------------//
//         INICIALIZACION          //
//---------------------------------//
function start(){
    crearTabla();
    loadData();
    cargaAsyn();
}

//---------------------------------//
//      FUNCIONES PRINCIPALES      //
//---------------------------------//
function crearTabla() {
    let div = document.getElementsByTagName("div")[4];
    let form = document.createElement("form");

    let idsNum = 1;
    let aux=1;

    let tabla = document.createElement("table");
    let tblBody = document.createElement("tbody");

    let hilera;
    let celda;
    let input;
    let et;

    form.name = "myFrom";
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
                input.type = "text";
                input.maxLength = 1;
                input.className = "cuadrados";
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
                input.type = "text";
                input.maxLength = 1;
                input.className = "cuadrados";
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
    if(confirm("¿Desearía ALMACENAR su progreso en almacenamiento local?\n\nSi pulsa cancelar podrá elegir borrarlo.")){
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
    resetBtn.type = "reset";
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


function mostrarPista(){
    if(cont==0){
        alert("¡Número de máximo pistas alcanzado!")
    } else {
        let texto = prompt("Escriba las letras: ", "Pistas restantes: " + cont);
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


function funcion(arr){
    let body = document.getElementsByTagName("body")[0];
    let head = document.createElement("h2");
    head.innerHTML="Lista de palabras"
    divis.className="items2";
    divis.textContent=arr;

    divis.appendChild(head);
    body.appendChild(divis);
}


async function cargaAsyn() {
    script = document.createElement("script");
    //script.src = "https://ordenalfabetix.unileon.es/aw/diccionario.txt";
    script.src = "http://127.0.0.1:3000/diccionario.txt"
    script.crossOrigin = "anonymous";
    document.body.append(script);

    Promise.all([
        fetch(script.src).then(x => x.text()),
    ]).then(([respuesta]) => {
        prepararResp(respuesta);
    }).catch(function(error) {
        console.log('Request failed', error)
    });

}


function removeAccents(str){
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


async function checkCorrecto() {
    let arrDe4 = [];
    let arrDe6 = [];
    let arr4Aux = [];
    let arr6Aux = [];
    let auxCont = 0;
    let auxCont2 = 0;
    let comprobacion = 0;
    let noDict = 0;

    for (let i = 0; i < 24; i++) {
        arrDe4.push(document.getElementById("" + (i + 1)).value)
    }

    for (let k = 24; k < 60; k++) {
        arrDe6.push(document.getElementById("" + (k + 1)).value)
    }

    arr4Aux = dividirEnGrupos(arrDe4, 4);
    arr6Aux = dividirEnGrupos(arrDe6, 6);


    if (comprobaciones(arr4Aux, arr6Aux)) {
        for (let j = 0; j < arr4Aux.length; j++) {

            if (arr4Aux[j + 1] === undefined || arr6Aux[j + 1] === undefined) {
                break;
            }

            if (comprobacion % 2 !== 0) {
                if (comprobacionLetra(removeAccents(arr4Aux[j].join("").toString().toLowerCase()), removeAccents(arr4Aux[j + 1].join("").toString().toLowerCase()))) {
                    auxCont++;
                }
            } else {
                if (comprobacionOrden(removeAccents(arr4Aux[j].join("").toString().toLowerCase()), removeAccents(arr4Aux[j + 1].join("").toString().toLowerCase()))) {
                    auxCont++;
                }
            }

            if (comprobacion % 2 !== 0) {
                if (comprobacionLetra(removeAccents(arr6Aux[j].join("").toString().toLowerCase()), removeAccents(arr6Aux[j + 1].join("").toString().toLowerCase()))) {
                    auxCont2++;
                }
            } else {
                if (comprobacionOrden(removeAccents(arr6Aux[j].join("").toString().toLowerCase()), removeAccents(arr6Aux[j + 1].join("").toString().toLowerCase()))) {
                    auxCont2++;
                }
            }

            comprobacion++;
        }

        for (let j = 0; j < arr4Aux.length; j++) {
            if (!resp.includes(arr4Aux[j].join("").toString().toLowerCase())) {
                alert("La palabra: '"+arr4Aux[j].join("").toString().toLowerCase()+"' no se encuentra en el diccionario");
                noDict++;
            }

            if (!resp.includes(arr6Aux[j].join("").toString().toLowerCase())) {
                alert("La palabra: '"+arr6Aux[j].join("").toString().toLowerCase()+"' no se encuentra en el diccionario");
                noDict++;
            }
        }

        arraySoluciones.push(arr4Aux[0].join("").toString().toLowerCase(), arr4Aux[5].join("").toString().toLowerCase(),
            arr6Aux[0].join("").toString().toLowerCase(), arr6Aux[5].join("").toString().toLowerCase());

        var esValido = await comprobacionServer();

        if (auxCont === 5 && auxCont2 === 5 && esValido && noDict>0) {
            alert("Puzle completado, pero hay palabras que no se encuentran en el diccionario...");
        } else if(auxCont === 5 && auxCont2 === 5 && esValido && noDict===0){
            alert("¡Perfecto! Puzle completado");
        }else{
            alert("Lo siento... puzle no completado");
        }

    } else {
        alert("Algo debe estar mal... ¡Hay huecos en blanco!");
    }

    arraySoluciones = [];
}

async function comprobacionServer(){
    try{
        return 'true' === await comprobacionServerPost();
    }catch(error){
        console.log(error);
    }
}


function comprobacionServerPost() {
   return $.post(
       "http://127.0.0.1:3000/pasatiempo1",
       {arraySoluciones: arraySoluciones.toString()},
    );
}


function comprobacionLetra(primera,segunda) {
    let distinto=0;
    for (let i = 0; i < primera.length; i++) {
        if(!primera.includes(segunda[i])){
            distinto++;
        }
    }
    return distinto == 0;
}


function comprobacionOrden(primera,segunda){
    let igual=0;
    for (let i = 0; i < primera.length; i++) {
        if(primera[i]==segunda[i]){
            igual++;
        }
    }
    if(igual==3){
        return true;
    }else return igual == 5;
}

function prepararResp(dictionary){
    return resp=dictionary.split("\n");
}

function comprobaciones(arr4Aux,arr6Aux){
    let aux2=true;

    for (let i = 0; i < arr6Aux.length; i++) {
        for (let j = 0; j < arr6Aux.length; j++) {
            if(arr6Aux[i][j]==="" || arr4Aux[i][j]===""){
                aux2=false;
            }
        }
    }

    if(aux2===true){
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


function acceptCookies() {
    localStorage.acceptCookies = 'true';
    document.getElementById("div-cookies").style.visibility = "hidden";
}