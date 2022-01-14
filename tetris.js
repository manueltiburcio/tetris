// alert('Presiona Aceptar para jugar');
const canvas = document.getElementById('tetris'); // main canvas
const context = canvas.getContext('2d'); // creates a 2d canvas

// audio
// document.getElementById("myAudio").volume = 0.8;


const showPiece = document.getElementById('showNextPiece'); //canvas showing next piece
const showPieceCtx= showPiece.getContext('2d');

context.scale(20, 20); // scale everything 20x, makes the pieces bigger
showPieceCtx.scale(35, 35);

// when a complete line is acheived by the player, sweep or clear the line and add some points
function arenaSweep(){
   //let speedUp = new Boolean (false);
    let scoreLvlUp = 10;
    
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y){
         // check if any of the lines (rows) have a zero in it (player left a gap in their line!)
        for (let x = 0; x < arena[y].length; ++x){
            if (arena[y][x] === 0){
                continue outer;
                // continue searching for gaps on the next row
            }
        }
        // if didn't find any gaps, it's a good line, take it out and fill it with zeros
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);  // moves the cleared row to the top of the arena
        ++y;

        player.score += rowCount * 10; // increase the score by 10 for each cleared line
        rowCount *= 2; // doubles your score


        if ( scoreLvlUp <= player.score){
            dropInterval -= 50;
            scoreLvlUp += 10;
        } 
        if (dropInterval < 200){
            dropInterval = 200;
        } 

        console.log(dropInterval);

          dropInterval = 1000;
      
    }
}

// collision detection
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y){
        for (let x = 0; x < m[y].length; ++x){
            // iterating over the player. check if y row and x column is NOT zero
            if (m[y][x] !== 0 && // check player matrix
                (arena[y + o.y] && // check if arena has a row and a column. 
                arena[y + o.y][x + o.x]) !== 0){
                    return true;
                }
        }
    }
    return false; // if no collision
}

function collideSW(arena, player) {
    const [m, o] = [player.matrixSW, player.posSW];
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

// this function keeps all the accumulated tetris blocks building up in our arena.
function createMatrix(w, h){ // takes width and height
    const matrix = [];
    while (h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// create all the different shapes of pieces. coordinate structure for 'T' tetris piece, 2d matrix
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

// create a general draw function
function draw() {
    context.fillStyle = '#000'; // each time updates, this will redraw the canvas
    context.fillRect(0,0, canvas.width, canvas.height); // coordinates to fill canvas

    showPieceCtx.fillStyle = '#000';
    showPieceCtx.fillRect(0,0, showPiece.width, showPiece.height);

    drawMatrix(arena, {x: 0, y: 0});

    drawMatrix(player.matrix, player.pos);
    drawMatrix(player.matrixSW, player.posSW);

    drawMatrixNP(nextPiece_temp,{x: 2, y: 0.3});
}

// draw the piece, iterating over the row
function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            // 0 is transparent, so check if 0
            if (value !== 0) {
                context.fillStyle = colors[value];
                // uses the numerical value to select from colors array
                // offset method used so you will be able to move the piece to desired coordinates
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
// copy all the values from the player and place them in the arena
function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) { // zeros are ignored, so take non-zeros
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function mergeSW(arena, player){
    player.matrixSW.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[player.posSW.y][player.posSW.x] = value;
            }
        });
    });
}

function playerDrop(){
    player.pos.y++; // moves piece on y axis (down)
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset(); // restart player's control postion back at the top of arena
        arenaSweep(); // check for any good lines and clear them out
        updateScore();
    }
    dropCounter = 0; // reset it so it starts counting all over again: adds a delay of a second before manual drop
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

function shadowProjection(){
    do {
        
            player.posSW.y--;
            mergeSW(arena, player);
            playerReset();
            arenaSweep();

            console.log(player.posSW.y)

        //dropCounter = 0;
    } while (!collideSW(arena, player))

}

// player initiates rotation. takes one param, direction of rotation (left - q key, right - w key)
function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)){
        player.pos.x += offset; // if collision, move the player's piece to the right and check again for collision
        player.posSW.x = player.pos.x; 
        offset = -(offset + (offset > 0 ? 1 : -1)); // if still collision, move  to the left. Go up by one and then negate that amount (negation means left) 
        if (offset > player.matrix[0].length) { // if the offset is more than the player.matrix first row's length, we've moved the piece too much
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            player.posSW.x = player.pos.x;
            return;
        }
    }
}

// keeps pieces from extending past the walls: if collide with arena, move its postition back
function playerMove(dir){
    player.pos.x += dir;
    player.posSW.x = player.pos.x;
    if(collide(arena,player)){
        player.pos.x -= dir;
        player.posSW.x = player.pos.x;
    }
}

// reset player's piece randomly
function playerReset(){
    player.matrix = nextPiece_temp;
    player.matrixSW = nextPiece_temp;

    nextPiece();
    
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    player.posSW.x = player.pos.x;
    if (collide(arena, player)) { 
        // if the above resetting of the player to the top center results in collision: GAME OVER, the arena is full.
        arena.forEach(row => row.fill(0));
        // clear out the stacked pieces in the arena and replace with empty spaces (zeroes)
        document.getElementById('prev-score').innerText = player.score;
        // posts last game score on the right side of screen
        player.score = 0; // reset score
        dropInterval = 1000; // reset speed
        updateScore();
    }
}

function nextPiece(){
    const pieces = 'ILJOTSZ';
    nextPiece_temp = createPiece(pieces[pieces.length * Math.random() | 0]);
}

// rotation of pieces, by transposing the rows into columns, then reversing the columns. accomplished by a tuple switch (ex., [a, b] = [b, a] )
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
    // check if the rotation direction is positive or negative
    if (dir > 0) {
     matrix.forEach(row => row.reverse());   
    } else {
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

// update function, to draw the game continuously 
function update(time = 0) { 
    // time is the total time since the page was loaded
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
        shadowProjection();        
    }


    draw();
    requestAnimationFrame(update);
}

// update score LS pending
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

// now establish the player's position coordinates
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    
    matrixSW: null, //Shadow projection of the piece
    posSW: {x: 0, y: 0},

    score: 0,
}


document.addEventListener('keydown', event => {
    if (event.keyCode == 37){ // arrow left
        playerMove(-1);
    } else if (event.keyCode === 39){ // arrow right
        playerMove(+1);
    } else if (event.keyCode === 38){ // arrow up
        playerFastDrop();
    }else if (event.keyCode === 40){ // arrow down
        playerDrop();
    } else if (event.keyCode === 81){ // q to rotate piece left
        playerRotate(-1);
    } else if (event.keyCode === 87){ // w key to rotate right
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
// based on tutorial by Meth Meth Method, https://www.youtube.com/watch?v=H2aW5V46khA