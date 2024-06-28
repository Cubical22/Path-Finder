const canvas = document.getElementById('main');
const c = canvas.getContext('2d');
let count = 23; // the number of rows and columns
let showBorders = false; // toggleable with the web menu
let movingStartOrEnd = undefined;

const colorCases = { // used to handle all the colors throughout the project
    wall: 'rgb(30,30,30)',
    empty: 'rgb(200,200,200)',
    start: 'hsl(150,50%,50%)',
    end: 'hsl(1,50%,50%)',
    path: 'hsl(255,50%,50%)',
    exploredFromStart: 'hsl(30,20%,50%)',
    exploredFromEnd: 'hsl(50,20%,50%)'
}

// resizing the canvas
function resize() {
    const length_used = innerWidth >= innerHeight ? innerHeight : innerWidth;

    canvas.width = length_used;
    canvas.height = length_used;
}
resize();
addEventListener('resize',resize);

// object used for drawing walls and moving start or finish
mouse = {
    x:canvas.width/2,
    y: canvas.height/2,
    down: false,
    state: undefined
};

/*
* let me explain a little about how this works.
* we have "mouse.state" which is undefined by default.
* whenever you start touching the screen (or clicking and holding) the state is updated accordingly.
* pressing an empty cell means you want to place some walls, so the state is set to 'wall'.
* same is done other way around. pressing a wall, makes the state be 'empty' which clears walls.
* now, how does it change?!?!
* it's simple! just stop touching the screen (or stop holding the mouse button) and the state variable
* is set right back to undefined right away, clearing the way for you to change it accordingly again!
* */

//mouse events
addEventListener('mousedown',()=>{
    mouse.down = true;
});

addEventListener('mouseup',()=>{
    handle_mouse_start_state();
});

addEventListener('mousemove',(e)=>{
    if (innerWidth >= innerHeight) { // painful it was...
        // I'll call e.clientX as just x
        // basically x - innerWidth/2 makes all values go from half out and half in from the left side of the screen
        // the + innerHeight/2 is there to make sure the start of the screen lands at the start of my canvas
        // since the height of the canvas is the same as it's width
        mouse.x = e.clientX - innerWidth/2 + innerHeight/2;
        mouse.y = e.clientY;
    } else {
        mouse.x = e.clientX;
        // same sort of effect is applied here
        mouse.y = e.clientY - innerHeight/2 + innerWidth/2;
    }
})

function handle_touch_move(e) {
    e.preventDefault();
    // e.touches[0] just means the first touch that is done is only considered
    if (innerWidth >= innerHeight) {
        mouse.x = e.touches[0].clientX - innerWidth/2 + innerHeight/2; // same old thing
        mouse.y = e.touches[0].clientY - cellSize * 2;
    } else {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY - innerHeight/2 + innerWidth/2 - cellSize * 2; // and here too
    }
}

/*
* quick explanation, "quickAfterBeforeSet(<'start'/'end'>)" just updates all the cell indexes on the path finding.
* more explained on the finder file but basically, there's <normal> which takes time
* and, there's a <quick> one, which is used here a couple likes bellow.
* the quick one has no animations or delays, just quick index update.
* this is pretty nice, because if I ever decide to add another path finding algo, I can just add it as animations
* and states, and handle the rest using the <quick> searches!
* neat, isn't it?!
* */
function handle_mouse_start_state() {
    mouse.down = false;

    if (mouse.state === 'startMove') {
        if (quickRunShouldRun) {
            resetLayers();
            quickAfterBeforeSet('start');
            quickAfterBeforeSet('end');
        }
    }
    if (mouse.state === 'endMove') {
        if (quickRunShouldRun) {
            resetLayers();
            quickAfterBeforeSet('end');
            quickAfterBeforeSet('start');
        }
    }

    mouse.state = undefined;
}

//touch events
canvas.addEventListener('touchstart',(e)=>{
    handle_touch_move(e)
    mouse.down = true;
});
canvas.addEventListener('touchmove',(e)=>{
    handle_touch_move(e)
});
canvas.addEventListener('touchend',(e)=>{
    e.preventDefault();
    handle_mouse_start_state();
});

let cells = []; // a list, holding all the cells
let cellSize = canvas.height/count;
function addCells() { // generating all the cells to be placed on the board
    for (let row = 0; row < count; row++) {
        cells.push([]); // adding rows
        for (let col = 0; col < count; col++) {
            cells[cells.length-1].push(new Cell(row,col,'empty')); // adding cells to rows
            if (row === 0 && col === 0) {
                cells[row][col].state = 'start'; // default place for start
            }
            if (row === count-1 && col === count-1) {
                cells[row][col].state = 'end'; // default place for end
            }
        }
    }
}
addCells();

let effectCells = []; // these are the cells that used for making the animations
function checkForCellClick() {
    if (algorithmRunning) return; // no clicks when algo is running
    if (!mouse.down) return; // nothing to do if there are no clicks

    // here we go through every cell and check if it is being clicked based on the coordinates of the cell
    // and the position the mouse is at.
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            if (cells[row][col].x < mouse.x && cells[row][col].x + cellSize > mouse.x) {
                if (cells[row][col].y < mouse.y && cells[row][col].y + cellSize > mouse.y) {
                    if (mouse.state === undefined) {
                        switch (cells[row][col].state) { // the state management for the click
                            case 'wall':
                                mouse.state = 'empty';
                                break;
                            case 'empty':
                                mouse.state = 'wall';
                                break;
                            case 'start':
                                mouse.state = 'startMove';
                                break;
                            case 'end':
                                mouse.state = 'endMove';
                                break;
                        }
                    }
                    if (mouse.state === 'wall') { // placing walls
                        // making sure there are no walls on the start or ending points
                        if (cells[row][col].state === 'start' || cells[row][col].state === 'end') continue;
                        if (algorithmDone) clearPath(); // no path anymore
                        if (cells[row][col].state === 'empty') // if the cell is empty, we spawn the animation cells
                            effectCells.push(new formingCell(cells[row][col].x,cells[row][col].y,
                                colorCases.wall,5,cells[row][col]));
                        cells[row][col].state = 'wall'; // we update the state for it either way though
                        cells[row][col].wasWall = true;
                        quickRunShouldRun = false; // no need for quick path finding and extra lag
                    } else if (mouse.state === 'empty') {
                        // no clearing the cells holding the start or end cells
                        if (cells[row][col].state === 'start' || cells[row][col].state === 'end') continue;
                        if (algorithmDone) clearPath();
                        if (cells[row][col].state === 'wall') // adding the fading animation
                            effectCells.push(new FadingCell(cells[row][col].x,cells[row][col].y,
                                colorCases.wall,5));
                        cells[row][col].state = 'empty'; // updating the state of the cell
                        cells[row][col].wasWall = false;
                        quickRunShouldRun = false;
                    } else if (mouse.state === 'startMove') {
                        setStart(row,col); // moving the start to a new position
                        movingStartOrEnd = 'start';
                    } else if (mouse.state === 'endMove') {
                        setEnd(row,col); // moving the end to a new position
                        movingStartOrEnd = 'end';
                    }
                }
            }
        }
    }
}

function setStart(row, col) {
    if (algorithmDone) clearPath();
    if (cells[row][col].state !== 'end') { // avoiding the end cell
        for (let rowI = 0; rowI < count; rowI++) {
            for (let colI = 0; colI < count; colI++) {
                if (cells[rowI][colI].state === 'start') {
                    if (cells[rowI][colI].wasWall) { // if the cell under start was a wall, making it a wall
                        cells[rowI][colI].state = 'wall';
                        cells[rowI][colI].show = true;
                    } else { // otherwise, just empty
                        cells[rowI][colI].state = 'empty';
                    }
                }
            }
        }
        cells[row][col].state = 'start'; // the new start cell

        if (quickRunShouldRun) {
            path = getPath('start'); // getting the path based on pre-computed indexes
            resetPathShown(); // removing the start path
            quickPathShow(path); // showing the new path
            quickExploreShow(cells[row][col].layerAfter,'after'); // quick explore from finish to start
            play_note(100, 'sine'); // playing the sound
        }
    }
}

// and the same comments go here
function setEnd(row, col) {
    if (cells[row][col].state !== 'start') {
        for (let rowI = 0; rowI < count; rowI++) {
            for (let colI = 0; colI < count; colI++) {
                if (cells[rowI][colI].state === 'end') {
                    if (cells[rowI][colI].wasWall) {
                        cells[rowI][colI].state = 'wall';
                    } else {
                        cells[rowI][colI].state = 'empty';
                    }
                }
            }
        }
        cells[row][col].state = 'end';

        if (quickRunShouldRun) {
            path = getPath('end');
            resetPathShown();
            quickPathShow(path);
            quickExploreShow(cells[row][col].layerBefore,'before');
            play_note(100, 'sine');
        }
    }
}

function animate() { // the animation loop is placed right here
    requestAnimationFrame(animate);
    c.clearRect(0,0,canvas.width,canvas.height); // rendering everything again

    const offset = canvas.width/2 - canvas.height/2; // this doesn't make much difference, but well...
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            cells[row][col].draw(c,[canvas.height,canvas.height],count,offset,showBorders); // drawing every cell
        }
    }
    checkForCellClick(); // checking for the click event

    for (let i = effectCells.length-1; i >= 0; i--) { // going through each effect cell
        effectCells[i].draw();
        effectCells[i].update();
        if (effectCells[i].remove) {
            effectCells.splice(i,1); // I love splice :>
        }
    }
    // NOTE: I am using a reverse loop because I want to not miss anything or go out of index after deleting any.
}
animate();

// clearing everything (the path, indexes, states and everything, except the start and end positions)
document.getElementById('clearButton').addEventListener('click',()=> {
    if (algorithmRunning) return;
    clearPath();
    reset();
    quickRunShouldRun = false;
});
// starting the slow and delayed algo with animations
document.getElementById('visualize').addEventListener('click',()=> {
    if (algorithmRunning) return;
    clearPath();
    normal(cells); // START TO IT ALL!!!!!!!
    quickRunShouldRun = false;
});


let diagonals = false; // handling toggle
const diagonalsInput = document.getElementById('diagonals');
diagonalsInput.addEventListener('change',()=> {
    diagonals = !diagonals;
    quickRunShouldRun = false;
});

// only clearing the path and not states of the cells
document.getElementById('resetButton').addEventListener('click',()=> {
    if (algorithmRunning) return;
    clearPath();
    quickRunShouldRun = false;
});

// toggle border display
document.getElementById('showBorders').addEventListener('change',()=>{
    showBorders = !showBorders;
})

// resetting all properties that relate to the path
function clearPath() {
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            cells[row][col].beforeCell = undefined;
            cells[row][col].explored = false;
            cells[row][col].isPath = false;
            cells[row][col].layerBefore = undefined;
            if (cells[row][col].state !== 'wall') {
                cells[row][col].show = false;
                cells[row][col].pathShow = false;
            }
        }
    }
    index = 0;
    openCells = [];
    exploredCells = [];
    path = [];
}

// resetting the state of all the cells
function reset() {
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            if (cells[row][col].state === 'wall')
                effectCells.push(new FadingCell(cells[row][col].x,cells[row][col].y,
                    colorCases.wall,5));
            cells[row][col].state = cells[row][col].state !== 'end'
            && cells[row][col].state !== 'start' ? 'empty' : cells[row][col].state;
            cells[row][col].wasWall = false;
        }
    }
}

// handling the shortcuts
addEventListener('keydown',(event)=>{
    if (algorithmRunning) return;
    switch (event.key) {
        case 'c':
            reset();
            clearPath();
            break;
        case 'x':
            clearPath();
            break;
        case 'r':
            clearPath();
            normal(cells);
            break;
        default:
            break;
    }
})

// the button used for toggling the toolbar
const toolbar_button = document.querySelector(".toolbar-button");
const toolbar = document.querySelector("#toolBar");
let is_toolbar_on = false;

toolbar_button.addEventListener("click", ()=>{
    if (!is_toolbar_on) {
        toolbar.style.display = "flex";
        is_toolbar_on = true;
    } else {
        toolbar.style.display = "none";
        is_toolbar_on = false;
    }
});

// resetting the layers (explained in the finder)
function resetLayers() {
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            cells[row][col].layerAfter = undefined;
            cells[row][col].layerBefore = undefined;
        }
    }
}