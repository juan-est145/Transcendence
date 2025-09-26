import { solution, fixed } from "./algo.js";
let numSelected = null;
let tileSelected = null;
let errors = 0;
window.onload = function () {
    setGame();
};
function setGame() {
    var _a, _b;
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div"); //crea una div para cada numero
        number.id = i.toString(); //anande id como el numero tal cual
        number.innerText = i.toString(); //asi como el texto
        number.addEventListener("click", selectNumber); //hook para la funncion
        number.classList.add("number"); //anande la classe css a ese elemento //css class
        (_a = document.getElementById("digits")) === null || _a === void 0 ? void 0 : _a.appendChild(number); //anande esas divs dentro de la div digits
    }
    //crear el board
    for (let i = 0; i < 9; i++) {
        for (let x = 0; x < 9; x++) {
            let tile = document.createElement("div");
            tile.id = i.toString() + "-" + x.toString();
            if (fixed[i][x] != 0) //si no es vacia
             {
                tile.innerText = fixed[i][x].toString();
                tile.classList.add("tile-fixed"); //rellena con los numeros iniciales
            }
            if (i == 2 || i == 5)
                tile.classList.add("horizontal-line"); //lineas mas gruesas para separar el 3x3
            if (x == 2 || x == 5)
                tile.classList.add("vertical-line");
            tile.addEventListener("click", selectTile); //hook
            tile.classList.add("tile"); //css class
            (_b = document.getElementById("board")) === null || _b === void 0 ? void 0 : _b.appendChild(tile);
        }
    }
}
function selectNumber() {
    if (tileSelected == null) {
        if (numSelected != null) {
            numSelected.classList.remove("selected-number");
        }
        if (numSelected === this) {
            numSelected.classList.remove("selected-number");
            numSelected = null;
            return;
        }
        numSelected = this;
        numSelected.classList.add("selected-number"); //css class
    }
    else //si tile esta seleccionado
     {
        let coords = tileSelected.id.split('-');
        let i = parseInt(coords[0]);
        let x = parseInt(coords[1]);
        if (solution[i][x] == parseInt(this.id)) //checkea si el numero encaja ahi
         {
            tileSelected.innerText = this.id;
            tileSelected.classList.remove("incorrect");
            tileSelected.classList.add("correct");
        }
        else {
            errors += 1;
            tileSelected.innerText = this.id;
            document.getElementById("errors").innerText = errors.toString();
            tileSelected.classList.add("incorrect");
            tileSelected.classList.remove("correct");
        }
    }
}
function selectTile() {
    if (numSelected) //si un numero esta seleccionado
     {
        if (this.innerHTML != "")
            return;
        //0-1, 0-2
        let coords = this.id.split('-');
        let i = parseInt(coords[0]);
        let x = parseInt(coords[1]);
        if (solution[i][x] == parseInt(numSelected.id)) {
            this.innerText = numSelected.id;
            this.classList.remove("incorrect");
            this.classList.add("correct");
        }
        else {
            errors += 1;
            this.innerText = numSelected.id;
            document.getElementById("errors").innerText = errors.toString();
            this.classList.add("incorrect");
            this.classList.remove("correct");
        }
    }
    else //si sleccionas la tile y luego el numero
     { //seleccionar la tile
        if (tileSelected != null) {
            tileSelected.classList.remove("selected-tile");
        }
        if (tileSelected === this) {
            tileSelected.classList.remove("selected-tile");
            tileSelected = null;
            return;
        }
        tileSelected = this;
        if (tileSelected.innerText != "") //si la tile no es vacia no si puede seleccionar
         {
            tileSelected = null;
            return;
        }
        tileSelected.classList.add("selected-tile");
    }
}
