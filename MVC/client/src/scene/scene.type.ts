export interface PaddleConstructor {
	paddleName: string,
	dimensions: PaddleDimensions,
	positionX: number,
	positionY: number,
};

interface PaddleDimensions {
	size: number,
	width: number,
	height: number,
	depth: number,
};