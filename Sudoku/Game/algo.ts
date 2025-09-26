//Set types of the board

/* const cnvsEl = document.getElementById('sudoku')
if (!(cnvsEl instanceof HTMLCanvasElement))
		throw Error ("Canvas element not found or not a canvas")

const cnvs: HTMLCanvasElement = cnvsEl;
const context = cnvs.getContext('2d')!;
cnvs.width = 800;
cnvs.height = 400;
 */
export type puzzleCell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 //solo acepta numeros de 0 a 9
export type puzzleLine = [puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell,]
export type puzzleBoard = [ //board 9 x 9 
	puzzleLine,
	puzzleLine,
	puzzleLine,
	puzzleLine,
	puzzleLine,
	puzzleLine,
	puzzleLine,
	puzzleLine,
	puzzleLine
]

const puzzle: puzzleBoard = [
	[2, 9, 0, 0, 4, 5, 8, 0, 1],
	[0, 8, 0, 0, 2, 6, 3, 0, 0],
	[0, 4, 0, 8, 9, 0, 0, 0, 6],
	[0, 0, 8, 0, 0, 3, 0, 0, 7],
	[4, 3, 2, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 6, 0, 0],
	[0, 0, 5, 0, 7, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 2, 0, 0, 8],
	[1, 0, 0, 5, 3, 0, 0, 0, 4],
]


//Rotate and shuffle the board to create new puzzles
const rotatePuzzle = (puzzle: puzzleBoard) => { //rota hacia derecha toda la tabla
	const n = puzzle.length
	const rotated = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 0 as puzzleCell)
  ) as puzzleBoard //inicializa el array como un puzzleBoard con puzzleCells en 0

	for(let i = 0; i < n; i++) //rotate entre lines y columnas
	{
		for(let j = 0; j < n; j++)
		{
			let temp = puzzle[i][j]
			let pos = n - (i + 1)
			rotated[j][pos] = temp
		}
	}
	return rotated
}

const fisherYatesShuffle = () => {
	const shuffled = [1, 2, 3, 4, 5 ,6, 7, 8, 9]
	for(let i = shuffled.length - 1; i > 0; i--)
	{
		const swapIndex = Math.floor(Math.random() * (i + 1))//genera un numero de 0 a i + 1
		const current = shuffled[i] //haz un swap "aleatorio" cambiando todo el orden del array
		shuffled[i] = shuffled[swapIndex]
		shuffled[swapIndex] = current
	}
	return shuffled
}

const shufflePuzzle = (puzzle: puzzleBoard) => {//cambia los numeros del juego
	
	const shuffled = fisherYatesShuffle()
	const conversion: number[] = []
	let e = 0
	let i = 0


	shuffled.forEach((e, i) => conversion[i + 1] = e)//pos 1 = 3 => el 1 lo vamos a cambiar por 3
	conversion[0] = 0//pos 0 se queda vacia para dejar 0
	for (let i = 0; i < 9; i++)
	{
		for (let x = 0; x < 9; x++)
		{
			puzzle[i][x] = conversion[puzzle[i][x]] as puzzleCell
		}
	}
	return puzzle
}

const swap = (index: puzzleBoard, piece: number[], orig: number, dest: number) => //funcion que hace un swap
{
	let temp :puzzleLine = puzzle[0]
	temp = puzzle[piece[orig]]
	puzzle[piece[orig]] = puzzle[piece[dest]]
	puzzle[piece[dest]] = temp

}

const shuffleRow = (puzzle: puzzleBoard) => //cambiar orden de las lineas
{
	let piece1 = [0, 1, 2]
	let piece2 = [3, 4, 5]
	let piece3 = [6, 7, 8]
	
	for (let i = 0; i < 3; i++)
	{
		if (i + 1 <= 2)
		{
			swap(puzzle, piece1, i, i + 1)
			swap(puzzle, piece2, i, i + 1)
			swap(puzzle, piece3, i, i + 1)
		}
	}
	return puzzle
}

//PUZZLE SOLUTION

const findNextEmpty = (board: puzzleBoard) => {
	for (let i = 0; i < 9; i++)
	{
		for(let x = 0; x < 9; x++)
		{
			if (board[i][x] == 0)
				return [i, x]
		}
	}
	return [-1, -1]
}

const checkSub = (board: puzzleBoard, row: number, col: number, num: number) => {
	let limitRow = Math.floor(row / 3) * 3//rango de 0, 3, 6 marcando el principio
	let limitCol = Math.floor(col / 3) * 3
	for (let i = limitRow; i < limitRow + 3; i++) // + 3 marca el fin (3, 6, 9)
	{
		for (let x = limitCol ; x < limitCol + 3; x++)
				if (board[i][x] == num)
					return false;
	}
	return true
}

const checkValue = (board: puzzleBoard, row: number, col: number, num: number) => {//checkear la columna, la linea y el 3x3
	for (let i = 0; i < 9; i++)
	{
		if (board[i][col] == num)
			return false
	}
	for (let x = 0; x < 9; x++)
	{
		if (board[row][x] == num)
			return false
	}
	return checkSub(board, row, col, num)	
}	

const solveBoard = (board: puzzleBoard) => {
	
	const emptySpot = findNextEmpty(board)
	let row = emptySpot[0]
	let col = emptySpot[1]

	//row/linha = emptySpot[0]
	//column = emptySpot[1]
	if (row == -1 && col == -1) //si el mapa ya esta lleno
		return board

	for(let num = 1; num <= 9; num++)
	{	
		if (checkValue(board, row, col, num))//checkea se num pueade estar en esa posicion
		{
			board[row][col] = num as puzzleCell//si si define ese numero en la posicion
			if (solveBoard(board)) //va al siguiente numero vacio y intenta llenar
				return board
		}
		board[row][col] = 0 //numero valido pero incorrecto
	}										//si falla vuelve a 0 en la posicion y busca otro video
	return false;
}

export const fixed = rotatePuzzle(shufflePuzzle(shuffleRow(rotatePuzzle(puzzle))))
let board = structuredClone(fixed);
export const solution = solveBoard(board) as puzzleBoard
console.log(fixed);
console.log("\n");
console.log(solution);
