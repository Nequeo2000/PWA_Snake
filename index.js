let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = Math.floor(window.innerWidth / 10) * 10;
canvas.height = Math.floor(window.innerHeight / 10) * 10;

let snakeBrain = {};
let snake = [];
let apple = [];
let inputHistory = [];
let stepCount = 0;

function draw() {
    // get next move
    move();

    // draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw snake and apple
    for (let i = 0; i < snake.length; i++) {
        let tile = snake[i];
        ctx.fillStyle = `rgb(${0},${255 - i * (200 / snake.length)},${0})`;
        ctx.fillRect(tile[0], tile[1], 10, 10);
    }
    ctx.fillStyle = "red";
    ctx.fillRect(apple[0], apple[1], 10, 10);

    requestAnimationFrame(draw);
}
spawnApple();
resetSnake();
requestAnimationFrame(draw);

function move() {
    let inputs = getInputs().toString().replaceAll(",", "");
    updateHistory(inputs);
    let output = makeDecision(inputs);
    let prediction = [0, 0];
    if (output == 0)
        prediction[0] = 10;
    if (output == 1)
        prediction[0] = -10;
    if (output == 2)
        prediction[1] = 10;
    if (output == 3)
        prediction[1] = -10;

    let newPosition = [snake[0][0] + prediction[0], snake[0][1] + prediction[1]];
    snake = [newPosition, ...snake];

    // check if hit wall
    if (snake[0][0] < 0 || snake[0][1] < 0 || snake[0][0] > canvas.width - 10 || snake[0][1] > canvas.height - 10) {
        rewardSnake(-1);
        resetSnake();
        stepCount = 0;
        return;
    }

    // check if snake hit tail
    let hitTail = false;
    for (let i = 1; i < snake.length; i++) {
        let tile = snake[i];
        if (tile[0] == newPosition[0] && tile[1] == newPosition[1]) {
            hitTail = true;
            break;
        }
    }

    if (newPosition[0] == apple[0] && newPosition[1] == apple[1]) {
        spawnApple();
        rewardSnake(1);
        stepCount = 0;
    }
    else if (hitTail) {
        snake = snake.slice(0, 3);
        rewardSnake(-1);
        resetSnake();
        stepCount = 0;
    }
    else {
        snake.pop();
    }

    stepCount++;
    if (snake.length < 10 && stepCount > canvas.width / 5 + canvas.height / 5
    || snake.length >= 10 && stepCount > (canvas.width / 10) * (canvas.height / 10)) {
        rewardSnake(-1);
        stepCount = 0;
    }
}

function getInputs() {
    let inputs = [];

    // apple in sight?
    inputs.push((snake[0][0] == apple[0] && snake[0][1] < apple[1]) ? 1 : 0);
    inputs.push((snake[0][0] == apple[0] && snake[0][1] > apple[1]) ? 1 : 0);
    inputs.push((snake[0][1] == apple[1] && snake[0][0] < apple[0]) ? 1 : 0);
    inputs.push((snake[0][1] == apple[1] && snake[0][0] > apple[0]) ? 1 : 0);

    // next to tail or wall?
    let arr = [
        (snake[0][0] > canvas.width - 10) ? 1 : 0,
        (snake[0][0] == 0) ? 1 : 0,
        (snake[0][1] > canvas.height - 10) ? 1 : 0,
        (snake[0][1] == 0) ? 1 : 0
    ];
    for (let i = 1; i < snake.length; i++) {
        if (snake[0][0] + 10 == snake[i][0] && snake[0][1] == snake[i][1]) {
            arr[0] = 1;
            break;
        }
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[0][0] - 10 == snake[i][0] && snake[0][1] == snake[i][1]) {
            arr[1] = 1;
            break;
        }
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[0][1] + 10 == snake[i][1] && snake[0][0] == snake[i][0]) {
            arr[2] = 1;
            break;
        }
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[0][1] - 10 == snake[i][1] && snake[0][0] == snake[i][0]) {
            arr[3] = 1;
            break;
        }
    }
    inputs.push(arr[0]);
    inputs.push(arr[1]);
    inputs.push(arr[2]);
    inputs.push(arr[3]);

    return inputs;
}

function rewardSnake(n) {
    for (let i = 0; i < inputHistory.length; i++) {
        let inputs = inputHistory[i];
        let output = snakeBrain[inputs].indexOf(Math.max(...snakeBrain[inputs]))
        snakeBrain[inputHistory[i]][output] += n * Math.pow(4, -i);
    }
}

function resetSnake() {
    let center = [Math.floor(canvas.width / 20) * 10, Math.floor(canvas.height / 20) * 10];
    snake = [center, [center[0], center[1] + 10], [center[0], center[1] + 20]];
    inputHistory = [];
}

function spawnApple() {
    apple[0] = Math.floor(Math.random() * canvas.width / 10) * 10;
    apple[1] = Math.floor(Math.random() * canvas.height / 10) * 10;

    // if apple on snake move the apple
    while (ctx.getImageData(apple[0], apple[1], 1, 1).data[0] != 0
        || ctx.getImageData(apple[0], apple[1], 1, 1).data[1] != 0
        || ctx.getImageData(apple[0], apple[1], 1, 1).data[2] != 0) {
        apple[0] = (apple[0] + 10) % canvas.width;
        if (apple[0] == 0)
            apple[1] = (apple[1] + 10) % canvas.height;
    }
}

function updateHistory(newValue) {
    inputHistory = [...inputHistory.slice(0, 4)];
    let doubleIndex = inputHistory.indexOf(newValue);
    if (doubleIndex != -1) {
        inputHistory = [newValue, ...(inputHistory.slice(0, doubleIndex)), ...(inputHistory.slice(doubleIndex + 1))];
    } else {
        inputHistory = [newValue, ...inputHistory.slice(0, 4)];
    }
}

function makeDecision(inputs) {
    if (snakeBrain[inputs] == undefined)
        snakeBrain[inputs] = [0, 0, 0, 0];
    return snakeBrain[inputs].indexOf(Math.max(...snakeBrain[inputs]));
}







const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
        try {
            navigator.serviceWorker.register("/sw.js").then(e => { console.log(e) });

        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};
registerServiceWorker();
