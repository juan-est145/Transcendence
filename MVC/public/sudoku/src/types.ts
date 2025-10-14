export type puzzleCell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 //solo acepta numeros de 0 a 9
export type puzzleLine = [puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell, puzzleCell]
export type puzzleBoard = [puzzleLine,	puzzleLine,	puzzleLine,	puzzleLine,	puzzleLine,	puzzleLine,	puzzleLine,	puzzleLine,	puzzleLine]
export type difficult_board = [puzzleBoard, puzzleBoard, puzzleBoard]