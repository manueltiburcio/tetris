const canvas = document.getElementById('tetris'); // main canvas
const context = canvas.getContext('2d');

const showPiece = document.getElementById('showNextPiece'); //canvas showing next piece
const showPieceCtx= showPiece.getContext('2d');

context.scale(20, 20); // scale everything 20x, makes the pieces bigger
showPieceCtx.scale(35, 35);

function arenaSweep(){
   //let speedUp = new Boolean (false);
    let scoreLvlUp = 10;
    
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y){
        for (let x = 0; x < arena[y].length; ++x){
            if (arena[y][x] === 0){
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;


        if ( scoreLvlUp <= player.score){
            dropInterval -= 50;
            scoreLvlUp += 10;
        } 
        if (dropInterval < 200){
            dropInterval = 200;
        } 

        console.log(dropInterval);

        // switch (player.score){

        //     case 50:
        //     dropInterval = 500;
        //     break;

        //     case 150:
        //     dropInterval = 300;
        //     break;

        //     case 300:
        //     dropInterval = 150;
        //     break;

        //     dropInterval = 1000;
        // }
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y){
        for (let x = 0; x < m[y].length; ++x){
            if (m[y][x] !== 0 && 
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0){
                    return true;
                }
        }
    }
    return false;
}

function createMatrix(w, h){
    const matrix = [];
    while (h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type){
    if (type === 'T'){
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L'){
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J'){
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I'){
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S'){
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z'){
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0,0, canvas.width, canvas.height);

    showPieceCtx.fillStyle = '#000';
    showPieceCtx.fillRect(0,0, showPiece.width, showPiece.height);

    drawMatrix(arena, {x: 0, y: 0});

    drawMatrix(player.matrix, player.pos );
    drawMatrixNP(nextPiece_temp,{x: 2, y: 0.3});
}

function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {

                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y, 
                                 1, 1);

                context.lineWidth = 0.08;
                context.strokeStyle="#000";
                context.strokeRect(x + offset.x, y + offset.y, 1,1);//for white background
        
            }
        });
    });
}

function drawMatrixNP(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                showPieceCtx.fillStyle = colors[value];
                showPieceCtx.fillRect(x + offset.x,
                                 y + offset.y, 
                                 1, 1);

                showPieceCtx.lineWidth = 0.08;
                showPieceCtx.strokeStyle="black";
                showPieceCtx.strokeRect(x + offset.x, y + offset.y, 1,1)
        
            }
        });
    });
}

function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop(){
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerFastDrop(){
    do {
        if(collide(arena, player)){
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
            updateScore();
        }
        dropCounter = 0;
    } while (player.pos.y++)
}

function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerMove(dir){
    player.pos.x += dir;
    if(collide(arena,player)){
        player.pos.x -= dir;
    }
}

function playerReset(){
    player.matrix = nextPiece_temp;
    nextPiece();
    
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        document.getElementById('prev-score').innerText = player.score;
        player.score = 0;
        dropInterval = 1000;
        updateScore();
    }
}

function nextPiece(){
    const pieces = 'ILJOTSZ';
    nextPiece_temp = createPiece(pieces[pieces.length * Math.random() | 0]);
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y){
        for (let x = 0; x < y; ++x){
            [
                matrix [x][y],
                matrix [y][x],] = 
                [ 
                    matrix [y][x],
                    matrix [x][y],
                ];
        }
    }
    if (dir > 0) {
     matrix.forEach(row => row.reverse());   
    } else {
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore(){
    document.getElementById('score').innerText = player.score;
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
}


document.addEventListener('keydown', event => {
    if (event.keyCode == 37){
        playerMove(-1);
    } else if (event.keyCode === 39){
        playerMove(+1);
    } else if (event.keyCode === 38){
        playerFastDrop();
    }else if (event.keyCode === 40){
        playerDrop();
    } else if (event.keyCode === 81){
        playerRotate(-1);
    } else if (event.keyCode === 87){
        playerRotate(1);
    } else if(event.keyCode === 32){ // spacebar
        alert("Paused: OK to resume"); // pauses play
    }
});

// mobile moving
document.getElementById('leftBtn').onclick = function() {
    playerMove(-1);
}
document.getElementById('rightBtn').onclick = function() {
    playerMove(+1);
}
document.getElementById('upBtn').onclick = function() {
    playerFastDrop();
}
document.getElementById('downBtn').onclick = function() {
    playerDrop();
}
document.getElementById('rotateL').onclick = function() {
    playerRotate(-1); 
}
document.getElementById('rotateR').onclick = function() {
    playerRotate(1); 
}
document.addEventListener('dblclick', (event) => {
    event.preventDefault();
})

nextPiece();
playerReset();
updateScore();
update();
