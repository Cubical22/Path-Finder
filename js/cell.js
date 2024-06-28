class Cell { // the class used to hold all the info needed for the cells on the board
    constructor(row,col,state) {
        // board positions
        this.row = row;
        this.col = col;

        // start, end, wall or empty states
        this.state = state;
        // this war is used for when you move the start or end cells over the wall
        this.wasWall = false;

        // display positions
        this.x = undefined;
        this.y = undefined;

        // variables used for the pathfinder
        this.beforeCell = undefined;
        this.afterCell = undefined;
        this.explored = false;
        this.isPath = false;
        this.layerBefore = undefined;
        this.layerAfter = undefined;
        this.show = false;
        this.pathShow = false;
    }

    setColorByState(showBorders) { // handling the color of the cells using the state it holds
        if (this.state === 'empty') {
            c.fillStyle = colorCases.empty;
        }
        if (this.state === 'wall') {
            if (this.show) {
                c.fillStyle = colorCases.wall;
            } else {
                c.fillStyle = colorCases.empty;
            }
        }
        if (this.state === 'start') {
            c.fillStyle = colorCases.start;
        }
        if (this.state === 'end') {
            c.fillStyle = colorCases.end;
        }
        if (this.explored && (this.show || quickRunShouldRun) && (this.state !== 'start' && this.state !== 'end')) {
            c.fillStyle = movingStartOrEnd === 'end' ? colorCases.exploredFromStart : colorCases.exploredFromEnd;
        }
        if (this.state !== 'end' && this.state !== 'start' && this.isPath && this.pathShow) {
            c.fillStyle = colorCases.path;
        }
        switch (showBorders) { // the toggleable option on the menu in web to show borders
            case false:
                c.strokeStyle = c.fillStyle;
                break;
            case true:
                c.strokeStyle = 'black';
                break;
            default:
                break;
        }
    }

    draw(c,gridSize,count,offset,showBorders) { // drawing the cell
        c.beginPath();
        this.setColorByState(showBorders); // the function above

        // setting the coordinates of the cell based on the screen
        this.x = offset+gridSize[0]/count*this.row;
        this.y = gridSize[1]/count*this.col;

        // drawing the rect
        c.rect(this.x,this.y,gridSize[1]/count,gridSize[1]/count);
        c.fill();
        c.stroke();
        c.closePath();
    }
}