//Obtains canvas element and context to draw on the page, and the size of the canvas
const canvasEl = document.getElementById('pong');
if (!(canvasEl instanceof HTMLCanvasElement)) {
    throw new Error("Canvas element not found or not a canvas");
}
const canvas: HTMLCanvasElement = canvasEl;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 400;

//Variables to keep track of the score and top and bottom margins of the paddles
let scoreOne: number = 0;
let scoreTwo: number = 0;
const paddleMargin: number = 2;

//Interface for element options
interface ElementOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    speed?: number;
    gravity: number;
}

//Main movement class for all elements in the game
class GameElement {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    speed: number;
    gravity: number;

    constructor(options: ElementOptions){
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.color = options.color;
        this.speed = options.speed ?? 4;
        this.gravity = options.gravity;
    }
}

//First player paddle (Left)
const playerOne = new GameElement({
    x: 10,
    y: (canvas.height - 80) / 2,
    width: 15,
    height: 80,
    color: "#fff",
    gravity: 2,
});

//Second player paddle (Right)
const playerTwo = new GameElement({
    x: 775,
    y: (canvas.height - 80) / 2,
    width: 15,
    height: 80,
    color: "#fff",
    gravity: 2,
});

//Ball element
const ball = new GameElement({
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 15,
    height: 15,
    color: "#fff",
    gravity: 1,
});

//Player one score text
function drawScoreOne(): void {
    ctx.font = "bold 48px 'Press Start 2p' ,Courier New, monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText(scoreOne.toString(), canvas.width/2 - 200, 70);
}

//Player two score text
function drawScoreTwo(): void {
    ctx.font = "bold 48px 'Press Start 2p' ,Courier New, monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText(scoreTwo.toString(), canvas.width/2 + 200, 70);
}

//Draw Elements function to draw paddles and ball on canvas
function drawElement(element: GameElement): void {
    ctx.fillStyle = element.color;
    ctx.fillRect(element.x, element.y, element.width, element.height);
}

//Draws the middle line of the canvas to delimit the two sides of the game
function drawMiddleLine(): void {
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

//Handles keypresses to move the paddles up and down
const keysPressed: { [key: string]: boolean } = {};

window.addEventListener("keydown", (event: KeyboardEvent) => {
    const key = event.key;
    keysPressed[key] = true;
});

window.addEventListener("keyup", (event: KeyboardEvent) => {
    const key = event.key;
    keysPressed[key] = false;
});

//Store paddle positions to send to backend
let paddleOneY = 160;
let paddleTwoY = 160;

//Move paddles locally and send to backend
function handlePaddleInput() {
    if (keysPressed["w"]) paddleOneY -= 8;
    if (keysPressed["s"]) paddleOneY += 8;
    if (keysPressed["ArrowUp"]) paddleTwoY -= 8;
    if (keysPressed["ArrowDown"]) paddleTwoY += 8;
    paddleOneY = Math.max(2, Math.min(400 - 80 - 2, paddleOneY));
    paddleTwoY = Math.max(2, Math.min(400 - 80 - 2, paddleTwoY));
}

//Fetch game state from backend
async function getGameState() {
    const res = await fetch("https://localhost:8000/renamePong/state");
    return await res.json();
}

async function sendMove(){
    await fetch('https://localhost:8000/renamePong/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paddleOne: paddleOneY, paddleTwo: paddleTwoY }),
    });
}

async function tickGame(){
    await fetch('https://localhost:8000/renamePong/tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paddleOne: paddleOneY, paddleTwo: paddleTwoY }),
    });
}

async function mainLoop(){
    handlePaddleInput();
    await sendMove();
    await tickGame();
    const state = await getGameState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawElement(new GameElement({ ...state.paddleOne, color: "#fff" }));
    drawElement(new GameElement({ ...state.paddleTwo, color: "#fff" }));
    drawElement(new GameElement({ ...state.ball, color: "#fff" }));

    scoreOne = state.scoreOne;
    scoreTwo = state.scoreTwo;
    drawScoreOne();
    drawScoreTwo();
    drawMiddleLine();

    window.requestAnimationFrame(mainLoop);
}
mainLoop();