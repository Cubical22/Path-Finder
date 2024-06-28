/*
* in this file, the followings are represented:
* 1. The <if (algorithmRunning) return;> is there to stop multiple algorithms from running
* 2. algorithmRunning = true/false is just toggling whether the algo is done or not
* */


document.getElementById('chamber-random-blocks').addEventListener('click',()=> {
    if (algorithmRunning) return;

    clearPath();
    reset();
    algorithmRunning = true;
    const limit = count*count * 0.16; // number of blocks based of the width and height

    for (let i = 0; i < limit; i++) {
        while (true) {
            const randRow = Math.floor(Math.random() * count);
            const randCol = Math.floor(Math.random() * count);
            let flag = !(cells[randRow][randCol].state === 'start' || cells[randRow][randCol].state === 'end');
            if (flag) { // handling the right placements (not at start or end)
                cells[randRow][randCol].state = 'wall';
                effectCells.push(new formingCell(cells[randRow][randCol].x,cells[randRow][randCol].y,
                    colorCases.wall,5,cells[randRow][randCol]));
                cells[randRow][randCol].wasWall = true;
                break;
            }
        }
    }
    algorithmRunning = false; // gate opened (generation done)
});

shapes = [ // the shapes that can be place according to the central cell of each one
    [[0,0],[-1,0],[1,0]],
    [[0,0],[0,1],[0,-1]],
    [[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[1,0],[0,-1]],
    [[0,0],[-1,0],[0,-1]],
    [[0,0],[1,0],[0,1]],
    [[0,0],[-1,0],[0,-1]],
    [[0,0],[1,0],[-1,0],[0,1],[0,-1]]
];

function checkForShape(shape,x,y) { // checking if a shape can be placed
    for (let i = 0; i < shape.length; i++) {
        // x in the boundaries
        if (x + shape[i][0] < 0 || x + shape[i][0] >= count) return false;
        // y in the boundaries
        if (y + shape[i][1] < 0 || y + shape[i][1] >= count) return false;
        // no clipping with the start
        if (cells[x + shape[i][0]][y + shape[i][1]].state === 'start') return false;
        // no clipping with the end
        if (cells[x + shape[i][0]][y + shape[i][1]].state === 'end') return false;
    }
    return true; // all settled
}
function drawShape(shape,x,y) { // place the cell on the board
    for (let i = 0; i < shape.length; i++) {
        cells[x + shape[i][0]][y + shape[i][1]].state = 'wall';
        effectCells.push(new formingCell(cells[x + shape[i][0]][y + shape[i][1]].x,cells[x + shape[i][0]][y + shape[i][1]].y,
            colorCases.wall,5,cells[x + shape[i][0]][y + shape[i][1]]));
        cells[x + shape[i][0]][y + shape[i][1]].wasWall = true;
    }
}

document.getElementById('chamber-random-shapes').addEventListener('click',()=>{
    if (algorithmRunning) return;

    clearPath();
    reset();
    algorithmRunning = true;

    for (let i = 0; i < 30; i++) { // going for the 30 shapes in total
        while (true) {
            const randX = Math.floor(Math.random() * count);
            const randY = Math.floor(Math.random() * count);
            const shapeIndex = Math.floor(Math.random() * shapes.length);
            if (checkForShape(shapes[shapeIndex],randX,randY)) {
                drawShape(shapes[shapeIndex],randX,randY);
                break;
            }
        }

    }
    algorithmRunning = false;

    // one thing to mention on this algo...
    // technically you can see that I am placing every shape with force
    // you know, cause of the "while inside for loop"
    // but the truth is, since walls can be placed on top of each other, this won't cause any issues at all
    // that is only until you make the board so small that it becomes unbelievable or stupid
});

// default: 100
let holChamberDelay = 100; // basic var used for the timing of animations
// this algorithm for generating the chamber has three steps that are done one after another using recursive calls
// 1. placing columns 2. removing some cells 3. adding some cells
document.getElementById('chamber-random-hole').addEventListener('click',()=>{
    if (algorithmRunning) return;

    clearPath();
    reset();

    algorithmRunning = true;

    for (let row = 1; row < count; row+=2) { // for each row, with the jump of one in between
        for (let col = 0; col < count; col++) { // for every column
            if (cells[row][col].state === 'start' || cells[row][col].state === 'end') { // avoiding the start or end
                continue;
            }
            effectCells.push(new formingCell(cells[row][col].x,cells[row][col].y,
                colorCases.wall,5,cells[row][col]));
            cells[row][col].state = 'wall';
            cells[row][col].wasWall = true;
        }
    }
    setTimeout(removeLinePeaces,holChamberDelay); // calling the removal process with delay
});

let indexRemoval = 1; // used to handle the number of blocks removed
function removeLinePeaces() {
    const randCol = Math.floor(Math.random()*count);
    if (indexRemoval >= count) {
        indexRemoval = 1; // resetting the process
        setTimeout(addExtraBlocks,holChamberDelay); // starting the next stage
        return;
    }
    setTimeout(removeLinePeaces,holChamberDelay); // recursive call with delay
    const removeCountRandom = Math.floor(Math.random() * 5) + 4; // the number of removed walls
    for (let s = 0; s < removeCountRandom; s++) {
        let whileIndex = 0;
        while (true) {
            if (cells[indexRemoval][randCol].state === 'start' || cells[indexRemoval][randCol].state === 'end') {
                continue; // avoiding the start or end
            }
            if (checkForBlockRemoval(indexRemoval,randCol)) {
                break;
            }
            whileIndex ++;
            if (whileIndex >= 10) break; // handling the matter of infinite while loops (for safety)
        }

        effectCells.push(new FadingCell(cells[indexRemoval][randCol].x,cells[indexRemoval][randCol].y,
            colorCases.wall,5));
        cells[indexRemoval][randCol].state = 'empty';
        cells[indexRemoval][randCol].wasWall = false;
    }
    indexRemoval += 2;
}

let indexAdded = 0; // used to handle the number of blocks added
function addExtraBlocks() { // the next stage of the algo
    const randCol = Math.floor(Math.random()*count);
    if (indexAdded >= count) { // done with the algo (third and last stage done)
        indexAdded = 0;
        algorithmRunning = false;
        return;
    }
    setTimeout(addExtraBlocks,holChamberDelay);
    const numberAdded = Math.floor(Math.random() * 2) + 1;
    for (let s = 0; s < numberAdded; s++) {
        let whileIndex = 0;
        while (true) {
            if (cells[indexAdded][randCol].state === 'start' || cells[indexAdded][randCol].state === 'end') {
                continue; // not adding them under the start or ending cells
            }
            if (checkForBlockPlacement(indexAdded,randCol)) {
                break;
            }
            whileIndex ++;
            if (whileIndex >= 10) { // handling the matter of infinite while loops (for safety)
                break;
            }
        }

        effectCells.push(new formingCell(cells[indexAdded][randCol].x,cells[indexAdded][randCol].y,
            colorCases.wall,5,cells[indexAdded][randCol]));
        cells[indexAdded][randCol].state = 'wall';
        cells[indexAdded][randCol].wasWall = true;
    }
    indexAdded += 2;
}

function checkForBlockRemoval(row,col) { // making sure that the cell is being at an acceptable position
    // not near the bottom and not near the top
    if (row + 2 < 0 || row + 2 >= count) return false;
    if (row - 2 < 0 || row - 2 >= count) return false;

    // not near the sides
    if (col + 1 < 0 || col + 1 >= count) return false;
    if (col - 1 < 0 || col - 1 >= count) return false;

    // no empty cells bellow and above it, not any empty cells on the columns next to it at the same height
    if (cells[row][col-1].state === 'empty' || cells[row][col+1].state === 'empty') return false;
    return !(cells[row - 2][col].state === 'empty' || cells[row + 2][col].state === 'empty');

}

function checkForBlockPlacement(row,col) { // making sure that the cell being placed is at a good position
    // not near the top or bottom of the board
    if (row + 1 < 0 || row + 1 >= count) return false;
    if (row - 1 < 0 || row - 1 >= count) return false;

    // not near the left or right of the board
    if (col + 1 < 0 || col + 1 >= count) return false;
    if (col - 1 < 0 || col - 1 >= count) return false;

    // no walls on top of each other, and no empty spots on the column next to the walls placed
    if (cells[row][col-1].state === 'wall' || cells[row][col+1].state === 'wall') return false;
    return !(cells[row - 1][col].state === 'empty' || cells[row + 1][col].state === 'empty');
}