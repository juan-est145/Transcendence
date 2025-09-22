
type puzzleCell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 //solo acepta numeros de 0 a 9
type puzzleBoard = [ //board 9 x 9 
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
	[puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell],
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

const rotatePuzzle = (puzzle: puzzleBoard) => {
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
	console.log(puzzle)
	console.log("rotated \n")
	console.log(rotated)
	return rotated
}

const fisherYatesShuffle = () => {
	const shuffled = [1, 2, 3, 4, 5 ,6, 7, 8, 9]
	for(let i = shuffled.length - 1; i > 0; i--)
	{
		const swapIndex = Math.floor(Math.random() * (i + 1))//genera un numero de 0 a i + 1
		const current = shuffled[i]
		shuffled[i] = shuffled[swapIndex]
		shuffled[swapIndex] = current
	}
	return shuffled
}

const shufflePuzzle = (/*puzzle: puzzleBoard*/) => {
	
	const shuffled = fisherYatesShuffle()
	const conversion: number[] = []
	let e = 0
	let i = 0

	shuffled.forEach((e, i) => conversion[i + 1] = e)//pos 1 = 3 => el 1 lo vamos a cambiar por 3
	console.log(conversion)							//pos 0 se queda vacia para dejar 0
	console.log("\n")
	return shuffled
}
console.log(shufflePuzzle())