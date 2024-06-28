function normal(cells) { // this is the actual algo to run the pathfinder (called by pressing r)
    const start = getStartOrEnd('start'); // finding the pos of the start
    openCells.push(cells[start[0]][start[1]]); // adding the start cell to the ones that will be explored
    algorithmDone = false; // running that algo
    overLoop = false; // ending the infinite loop of finding
    pathFound = false;
    moveIndex = 0; // the indexing done for each cell
    algorithmRunning = true;
    movingStartOrEnd = 'end';
    accessMovement();
    quickAfterBeforeSet('end');
}

let path;
let openCells = [];
let exploredCells = [];
let algorithmDone = true;
let overLoop = false;
let pathFound = false;
let pathsRecognized = false;
let algorithmRunning = false;


function getPath(fromStartOrEnd) {
    let currentCell;
    const currentCoordinates = getStartOrEnd(fromStartOrEnd);
    currentCell = cells[currentCoordinates[0]][currentCoordinates[1]];
    if (currentCell === undefined) return;
    const path = [];

    while (true) {
        if (fromStartOrEnd === 'end') {
            if (currentCell.beforeCell !== undefined) {
                path.push(currentCell);
                currentCell = cells[currentCell.beforeCell[0]][currentCell.beforeCell[1]];
                if (currentCell.state === 'start') break;
            } else {
                break;
            }
        }
        else if (fromStartOrEnd === 'start') {
            if (currentCell.afterCell !== undefined) {
                path.push(currentCell);
                currentCell = cells[currentCell.afterCell[0]][currentCell.afterCell[1]];
                if (currentCell.state === 'end') break;
            } else {
                break;
            }
        }
        if (currentCell.state === 'wall') return [];
    }
    return path;
}

let moveIndex = 0;
function accessMovement() {
    if (algorithmDone && !pathFound) { // done with the finding and time to display the path
        path = getPath('end');
        visualizePath();
        pathFound = true;
    }
    if (overLoop) {
        pathsRecognized = true;
        algorithmRunning = false;
        quickRunShouldRun = true;
        return;
    }

    // here we check: if the algo is done (path found from start to end) then we will run the rest quick
    // otherwise, it's done with the delay it's supposed to be done by.
    if (!algorithmDone) {
        setTimeout(accessMovement, 100); // not done yet
    } else {
        setTimeout(accessMovement, 1); // done, just exploring the rest of the canvas
    }

    const newSet = []; // the new cells that  should be explored
    for (let i = 0; i < openCells.length; i++) { // going through every cell that is supposed to be explored
        setUpCellSelect(-1,0,openCells[i],newSet);
        setUpCellSelect(1,0,openCells[i],newSet);
        setUpCellSelect(0,-1,openCells[i],newSet);
        setUpCellSelect(0,1,openCells[i],newSet);
        if (!diagonals) continue; // diagonal cells are explored if the option is toggled
        setUpCellSelect(-1,-1,openCells[i],newSet);
        setUpCellSelect(1,-1,openCells[i],newSet);
        setUpCellSelect(-1,1,openCells[i],newSet);
        setUpCellSelect(1,1,openCells[i],newSet);

    }
    if (newSet.length === 0) { // there are no more cells to be explored
        algorithmDone = true;
        overLoop = true;
        return;
    }
    openCells = newSet; // the next generation of cells that need to be explored
    moveIndex++; // next index of cells to be explored
}

let index = 0;
function visualizePath() {
    if (path === undefined) return;
    if (index >= path.length) return;
    setTimeout(visualizePath,40);
    if (path[index].state !== 'end')
        effectCells.push(new formingCell(path[index].x,path[index].y,
            colorCases.path,5,path[index]));
    path[index].isPath = true;
    index ++;
}

function setUpCellSelect(a,b,current,newSet) { // handling the new cells that need to be explored
    // checking for boundaries
    if (current.row + a >= 0 && current.row + a < cells.length && current.col + b >= 0 && current.col + b < cells.length) {
        const cell = cells[current.row + a][current.col + b]; // the cell which state is being explored

        if (cell.state === 'wall') { // handling walls aside from empty cells
            exploredCells.push(cell);
            if (cell.beforeCell === undefined) // from start to end
                cell.beforeCell = [current.row,current.col];
            if (cell.layerBefore === undefined) // from end to start
                cell.layerBefore = moveIndex;
        }
        if (cell.state === 'start') return; // no considering the start anymore

        // now, if we reach the end and the end hasn't been found yet
        if (cell.state === 'end' && !algorithmDone) {
            if (cell.beforeCell === undefined) // the cell that reached it
                cell.beforeCell = [current.row,current.col];
            cell.layerBefore = moveIndex; // it's index from the start to end
            algorithmDone = true; // end was found
            // the end is now explored inside the new set of open cells
            newSet.push(cell);
            exploredCells.push(cell);
            cell.pathShow = true;
            cell.show = true;
            return;
        }


        if (exploredCells.includes(cell)) return; // if the cell is already explored, just leave it
        // now one thing is that I could have done the same for cases like wall and the end and starting cells,
        // but I don't know what I was writing back then!
        // so, it's a TODO: clean this section of the code later

        if (!algorithmDone) { // the end hasn't been found yet
            cell.explored = true; // the color set for the cells explored before the end
        }

        if (cell.beforeCell === undefined) // defining the cell that comes before the current cell
            cell.beforeCell = [current.row,current.col];
        newSet.push(cell); // explore surrounding on next gen
        exploredCells.push(cell); // not explored anymore
        cell.layerBefore = moveIndex; // defining the indexes

        effectCells.push(new formingCell(cell.x,cell.y, colorCases.exploredFromStart,4,cell)); // adding effects
    }
}

function getStartOrEnd(startOrEnd) { // finding the coordinates of the start or end cells
    for (let row = 0; row < cells.length; row++) {
        for (let col = 0; col < cells[row].length; col++) {
            if (startOrEnd === 'start')
                if (cells[row][col].state === 'start') return [row,col];
            if (startOrEnd === 'end')
                if (cells[row][col].state === 'end') return [row,col];
        }
    }
}

function quickPathShow(path) { // simply displaying every cell as path which is placed inside the path array
    path.forEach(cell => {
        cell.isPath = true;
        cell.pathShow = true;
    });
}

function resetPathShown() { // removing the path display from every single cell on the board
    for (let row = 0; row < cells.length; row++) {
        for (let col = 0; col < cells[row].length; col++) {
            cells[row][col].isPath = false;
            cells[row][col].explored = false;
        }
    }
}

// showing the cells that where explored until the start or end are reached
function quickExploreShow(layer,afterOrBefore) {
    for (let row = 0; row < cells.length; row++) {
        for (let col = 0; col < cells[row].length; col++) {
            if (cells[row][col].state === 'end' || cells[row][col].state === 'wall') continue;
            if (afterOrBefore === 'before') {
                cells[row][col].explored = cells[row][col].layerBefore <= layer;
            }
            if (afterOrBefore === 'after') {
                cells[row][col].explored = cells[row][col].layerAfter <= layer;
            }
        }
    }
}

/*
* The rest is dedicated to the quick algo run.
* this does pretty much the same, but with the difference of there not being any delays!
* which means that sadly there's a lot of repeated code!
* this is why I feel like I should rewrite this section of the code later, but for now this is all I got.
* */

let quickRunShouldRun = false; // whether a full exploration is done or not
function quickAfterBeforeSet(fromStartOrEnd) { //defines the news paths from the end or the beginning, to the other
    // note: the main algorithm runs in the mode "fromStart" and uses beforeCell
    // the other finder is "fromEnd" and uses the afterCell
    // this function is the main order setter of the code that runs in diffrent functions and sets
    let openCells = [];
    const exploredCells = [];
    const overLoop = false;

    if (fromStartOrEnd === 'start') {
        const startCoordinates = getStartOrEnd('start');
        openCells.push(cells[startCoordinates[0]][startCoordinates[1]]);
        exploredCells.push(cells[startCoordinates[0]][startCoordinates[1]]);
    } else if (fromStartOrEnd === 'end') {
        const endCoordinates = getStartOrEnd('end');
        openCells.push(cells[endCoordinates[0]][endCoordinates[1]]);
        exploredCells.push(cells[endCoordinates[0]][endCoordinates[1]]);

    }

    let index = 0;
    while (!overLoop) {
        const newOpenCells = [];
        if (fromStartOrEnd === 'start') {
            for (let i = 0; i < openCells.length; i++) {
                quickProcessOnBlocksRun(-1,0,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                quickProcessOnBlocksRun(1,0,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                quickProcessOnBlocksRun(0,1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                quickProcessOnBlocksRun(0,-1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                if (diagonals) {
                    quickProcessOnBlocksRun(-1,1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                    quickProcessOnBlocksRun(-1,-1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                    quickProcessOnBlocksRun(1,1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                    quickProcessOnBlocksRun(1,-1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                }
            }
        }
        else if (fromStartOrEnd === 'end') {
            for (let i = 0; i < openCells.length; i++) {
                quickProcessOnBlocksRun(0,-1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                quickProcessOnBlocksRun(0,1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                quickProcessOnBlocksRun(1,0,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                quickProcessOnBlocksRun(-1,0,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                if (diagonals) {
                    quickProcessOnBlocksRun(1,-1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                    quickProcessOnBlocksRun(1,1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                    quickProcessOnBlocksRun(-1,-1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                    quickProcessOnBlocksRun(-1,1,openCells[i],newOpenCells,exploredCells,fromStartOrEnd,index);
                }
            }
        }
        openCells = newOpenCells;
        if (openCells.length === 0) break;
        index++;
    }
}

// pretty much the same as exploring the cells, but with the difference of there not being any delays
// again, TODO: make this section a little more clear and readable + removing repeated code
function quickProcessOnBlocksRun(a,b,current,newCells,exploredCells,fromStartOrEnd,index) {
    if (current.row + a < 0 || current.row + a >= count || current.col + b < 0 || current.col + b >= count) return false;
    const cellWorkingOn = cells[current.row + a][current.col + b];
    if (exploredCells.includes(cellWorkingOn)) return false;
    exploredCells.push(cellWorkingOn);
    if (cellWorkingOn.state !== 'wall')
        newCells.push(cellWorkingOn);
    if (fromStartOrEnd === 'start') {
        if (cellWorkingOn.state !== 'start') {
            cellWorkingOn.beforeCell = [current.row,current.col];
            if (current.state !== 'wall')
                cellWorkingOn.layerBefore = index;
        }
    } else if (fromStartOrEnd === 'end') {
        if (cellWorkingOn.state !== 'end') {
            cellWorkingOn.afterCell = [current.row,current.col];
            if (current.state !== 'wall')
                cellWorkingOn.layerAfter = index;
        }
    }
}