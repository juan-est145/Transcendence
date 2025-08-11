//Obtains canvas element and context to draw on the page, and the size of the canvas
const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

//Variables to keep track of the score and top and bottom margins of the paddles
let scoreOne = 0;
let scoreTwo = 0;
const paddleMargin = 2;

//Main movement class for all elements in the game
class Element {
	constructor(options){
		this.x = options.x;
		this.y = options.y;
		this.width = options.width;
		this.height = options.height;
		this.color = options.color;
		this.speed = options.speed || 4;
		this.gravity = options.gravity;
	}
}

//First player paddle (Left)
const playerOne = new Element({
	x: 10,
	y: (canvas.height - 80) / 2,
	width: 15,
	height: 80,
	color: "#fff",
	gravity: 2,
});

//Second player paddle (Right)
const playerTwo = new Element({
	x: 775,
	y: (canvas.height - 80) / 2,
	width: 15,
	height: 80,
	color: "#fff",
	gravity: 2,
});

//Ball element
const ball = new Element({
	x: canvas.width / 2,
	y: canvas.height / 2,
	width: 15,
	height: 15,
	color: "#fff",
	gravity: 1,
});

//Player one score text
function drawScoreOne() {
	context.font = "bold 48px 'Press Start 2p' ,Courier New, monospace";
	context.fillStyle = "#fff";
	context.fillText(scoreOne, canvas.width/2 - 200, 70);
}

//Player two score text
function drawScoreTwo() {
	context.font = "bold 48px 'Press Start 2p' ,Courier New, monospace";
	context.fillStyle = "#fff";
	context.fillText(scoreTwo, canvas.width/2 + 200, 70);
}

//Draw Elements funciton to drawn paddles and ball on canvas
function drawElement(element){
	context.fillStyle = element.color;
	context.fillRect(element.x, element.y, element.width, element.height);

};

//Draws the middle line of the canvas to delimit the two sides of the game
function drawMiddleLine() {
    context.save();
    context.strokeStyle = "#fff";
    context.lineWidth = 4;
    context.setLineDash([20, 20]);
    context.beginPath();
    context.moveTo(canvas.width / 2, 10);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();
    context.setLineDash([]);
    context.restore();
}

//Handles keypresses to move the paddles up and down
const keysPressed = {};

window.addEventListener("keydown", (event) => {
	const key = event.key;
	keysPressed[key] = true;
});

window.addEventListener("keyup", (event) => {
	const key = event.key;
	keysPressed[key] = false;
});

let playerOneVelocity = 0;
let playerTwoVelocity = 0;

//Moves the paddles based on keypresses and applies gravity to them
function movePaddles() {
    playerOneVelocity = 0;
    playerTwoVelocity = 0;

    if (keysPressed["w"] && playerOne.y - playerOne.gravity * 8 > paddleMargin) {
        playerOne.y -= playerOne.gravity * 4;
        playerOneVelocity = -playerOne.gravity * 4;
    }
    if (keysPressed["s"] && playerOne.y + playerOne.height + playerOne.gravity * 8 < canvas.height - paddleMargin) {
        playerOne.y += playerOne.gravity * 4;
        playerOneVelocity = playerOne.gravity * 4;
    }
    if (keysPressed["ArrowUp"] && playerTwo.y - playerTwo.gravity * 8 > paddleMargin) {
        playerTwo.y -= playerTwo.gravity * 4;
        playerTwoVelocity = -playerTwo.gravity * 4;
    }
    if (keysPressed["ArrowDown"] && playerTwo.y + playerTwo.height + playerTwo.gravity * 8 < canvas.height - paddleMargin) {
        playerTwo.y += playerTwo.gravity * 4;
        playerTwoVelocity = playerTwo.gravity * 4;
    }
}

//Ball bounce function when colliding with the top or bottom of the canvas
function ballBounce()
{
	if (ball.y + ball.gravity <= 0 || ball.y + ball.gravity + ball.height >= canvas.height){
		ball.gravity = ball.gravity * -1;
		ball.y += ball.gravity;
		ball.x += ball.speed;
	}
	else{
		ball.y += ball.gravity;
		ball.x += ball.speed;
	}
	ballWallCollision();
}

//Handles the collision between the ball and the paddles or walls
function ballWallCollision() {
    function paddleCollision(paddle) {
        const nextBallX = ball.x + ball.speed;
        const nextBallY = ball.y + ball.gravity;
        return (
            nextBallX < paddle.x + paddle.width &&
            nextBallX + ball.width > paddle.x &&
            nextBallY < paddle.y + paddle.height &&
            nextBallY + ball.height > paddle.y
        );
    }

    if (paddleCollision(playerTwo)) {
        ball.speed = -Math.abs(ball.speed) * 1.1;
        const hitPos = (ball.y + ball.height / 2) - playerTwo.y;
        const relativeIntersect = hitPos / playerTwo.height;
        ball.gravity = ((relativeIntersect < 0.5 ? -1 : 1) * Math.max(1, Math.abs(ball.gravity))) + playerTwoVelocity * 0.5;
    }
    else if (paddleCollision(playerOne)) {
        ball.speed = Math.abs(ball.speed) * 1.1;
        const hitPos = (ball.y + ball.height / 2) - playerOne.y;
        const relativeIntersect = hitPos / playerOne.height;
        ball.gravity = ((relativeIntersect < 0.5 ? -1 : 1) * Math.max(1, Math.abs(ball.gravity))) + playerOneVelocity * 0.5;
    }
    else if (ball.x + ball.speed < 0) {
        scoreTwo += 1;
        ball.x = canvas.width / 2 - ball.width / 2;
        ball.y = canvas.height / 2 - ball.height / 2;
        ball.speed = 4;
        ball.gravity = (Math.random() > 0.5 ? 1 : -1);
        return;
    }
    else if (ball.x + ball.speed > canvas.width) {
        scoreOne += 1;
        ball.x = canvas.width / 2 - ball.width / 2;
        ball.y = canvas.height / 2 - ball.height / 2;
        ball.speed = -4;
        ball.gravity = (Math.random() > 0.5 ? 1 : -1);
        return;
    }
}

//Draws all the elements on the canvas
function drawElements()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawElement(playerOne);
	drawElement(playerTwo);
	drawElement(ball);
	drawScoreOne();
	drawScoreTwo();
	drawMiddleLine();
}


//Main loop of pong that will draw the elements every frame
function mainLoop()
{
	movePaddles();
	ballBounce();
	drawElements();
	window.requestAnimationFrame(mainLoop);
}
mainLoop();