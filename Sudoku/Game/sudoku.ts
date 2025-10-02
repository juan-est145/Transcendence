import { solution, fixed, selectDifficult } from "./algo.js";
import type {puzzleCell} from "./algo.js";

let numSelected: HTMLDivElement | null = null;
let tileSelected: HTMLDivElement | null = null;
let errors = 0;

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-easy")?.addEventListener("click", () => selectDifficult("easy"))
  document.getElementById("btn-medium")?.addEventListener("click", () => selectDifficult("medium"))
  document.getElementById("btn-hard")?.addEventListener("click", () => selectDifficult("hard"))
})


export function setGame()
{	//crear los numeros para seleccionar
	(document.getElementById("difficult-screen") as HTMLElement).style.display = "none";
	(document.getElementById("game-screen") as HTMLElement).style.display = "block";
	timeStart();

	for (let i = 1; i <= 9; i++)
	{
		let number = document.createElement("div"); //crea una div para cada numero
		number.id = i.toString();//anande id como el numero tal cual
		number.innerText = i.toString(); //asi como el texto
		number.addEventListener("click", selectNumber);//hook para la funncion
		number.classList.add("number");//anande la classe css a ese elemento //css class
		document.getElementById("digits")?.appendChild(number);//anande esas divs dentro de la div digits
	}
	//crear el board
	for (let i = 0; i < 9; i++)
	{
		for (let x = 0; x < 9; x++)
		{
			let tile = document.createElement("div");
			tile.id = i.toString() + "-" + x.toString();
			if (fixed[i][x] != 0)//si no es vacia
			{
				tile.innerText = fixed[i][x].toString();
				tile.classList.add("tile-fixed"); //rellena con los numeros iniciales
				tile.classList.add("correct");
			}
			if (i == 2 || i == 5)
				tile.classList.add("horizontal-line");//lineas mas gruesas para separar el 3x3
			if (x == 2 || x == 5)
				tile.classList.add("vertical-line");
			tile.addEventListener("click", selectTile);//hook
			tile.classList.add("tile");//css class
			document.getElementById("board")?.appendChild(tile);
		}
	}
}

function selectNumber(this: HTMLDivElement) {
	if (tileSelected == null)
	{
		if (numSelected != null)
		{
			numSelected.classList.remove("selected-number")
		}
		if (numSelected === this)
		{
			numSelected.classList.remove("selected-number");
			numSelected = null;
			return;
		}
		numSelected = this;
		numSelected.classList.add("selected-number");//css class
	}
 	else//si tile esta seleccionado
	{
		let coords = tileSelected.id.split('-')
		let i = parseInt(coords[0]);
		let x = parseInt(coords[1]);
		if (solution[i][x] == parseInt(this.id))//checkea si el numero encaja ahi
		{
			tileSelected.innerText = this.id;
			fixed[i][x] = solution[i][x];
		 	if (check_number(solution[i][x]))
			{
				const done = document.getElementById(solution[i][x].toString()) as HTMLElement;
				done.classList.add("done");
			}
			tileSelected.classList.remove("incorrect");
			tileSelected.classList.add("correct");
		}
		else
		{
			errors += 1;
			tileSelected.innerText = this.id;
			(document.getElementById("errors") as HTMLElement).innerText  = errors.toString();
			tileSelected.classList.add("incorrect");
			tileSelected.classList.remove("correct");
		}
	} 
}

function selectTile(this: HTMLDivElement) {
	if (numSelected) //si un numero esta seleccionado
	{
		if (this.classList.contains("correct"))
			return ;
		//0-1, 0-2
		let coords = this.id.split('-');
		let i = parseInt(coords[0]);
		let x = parseInt(coords[1]);
		if (solution[i][x]== parseInt(numSelected.id))
		{
			fixed[i][x] = solution[i][x];//use fixed as my board with all the correct numbers //maybe a problem due to pointers
			 if (check_number(solution[i][x]))
			{
				numSelected.classList.add("done");
			}
			this.innerText = numSelected.id;
			this.classList.remove("incorrect");
			this.classList.add("correct");
		}
		else
		{	
			errors += 1;
			this.innerText = numSelected.id;
			(document.getElementById("errors") as HTMLElement).innerText  = errors.toString();
			this.classList.add("incorrect");
			this.classList.remove("correct");
		}
	}
	else//si sleccionas la tile y luego el numero
	{	//seleccionar la tile
		if (tileSelected != null)
		{
			tileSelected.classList.remove("selected-tile")
		}
		if (tileSelected === this)
		{
			tileSelected.classList.remove("selected-tile");
			tileSelected = null;
			return;
		}
		tileSelected = this;
		if (tileSelected.classList.contains("correct"))//si la tile no es vacia no si puede seleccionar
		{
			tileSelected = null;
			return; 
		}
		tileSelected.classList.add("selected-tile");
	}
}

function check_number(target: puzzleCell) {//function para checkear si un numero ya esta lleno
	let appearces = 0;
	for (let i = 0; i < 9; i++)
	{
		for (let x = 0; x < 9; x++)
			{
				if (fixed[i][x] == target )
					appearces++;
			}
	}
	if (appearces != 9)
		return false;
	console.log("target " + target + " is done");
	isComplete()//funcion para checkear si el board ya esta completo
	return true;
}

function isComplete ()
{
	for (let i = 0; i < 9; i++)
	{
		for (let x = 0; x < 9; x++)
		{
			if (fixed[i][x] != solution[i][x])
				return false;
		}
	}
	console.log("acabouuu")
	let board = document.getElementById("board");
	board?.classList.add("finished");
	stopTimer();
}

//TIMER 
let timeInterval: number | null = null;
let startTime: number = 0;

function timeStart(){
	startTime = Date.now();

	if (timeInterval) 
		clearInterval(timeInterval);

	timeInterval = window.setInterval(() =>//funcion que se repite a cada x tiempo (1000ms -> 1s)
	{
		const rawTime = Math.floor((Date.now() - startTime) / 1000);

		const minutes = Math.floor(rawTime/60).toString().padStart(2, "0");
		const seconds = Math.floor (rawTime % 60).toString().padStart(2, "0");

		const timeEl = document.getElementById("timer") as HTMLElement;
		timeEl.innerText =`${minutes}:${seconds}`;
	}, 1000)
}

function stopTimer() {
	if (timeInterval)
	{
		clearInterval(timeInterval);
		timeInterval = null;
	}
}