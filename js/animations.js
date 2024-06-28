function draw_self(self) { // the function used to avoid rewriting the same code twice
    c.beginPath();
    c.fillStyle = self.color;
    const middleX = self.x + self.sizeLimit / 2;
    const middleY = self.y + self.sizeLimit / 2;
    c.rect(middleX - self.size/2, middleY - self.size/2,self.size,self.size);
    c.fill();
    c.closePath();
}

class formingCell { // the boxes that grow bigger
    constructor(x,y,color,speed,parentCell) {
        this.size = 0;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.sizeLimit = canvas.height/count;
        this.parentCell = parentCell; // used for make sure that we change the color of the parent cell after done
        this.remove = false;
    }

    draw() { // drawing the animation
        draw_self(this);
    }

    update() {
        if (this.size < this.sizeLimit - 3) { // growing the box
            this.size += this.speed;
        } else { // done with the growing bit
            this.remove = true;
            this.parentCell.show = true; // coloring the parent cell now
            if (this.parentCell.isPath) { // we play some notes afterward if the parent cell is part of the path
                this.parentCell.pathShow = true;
                play_note(200,'sine');
            }
        }
    }
}

class FadingCell { // the boxes that grow smaller
    constructor(x,y,color,speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.color = color;
        this.sizeLimit = canvas.height/count;
        this.remove = false;
        this.size = this.sizeLimit;
    }

    draw() {
        draw_self(this);
    }

    update() {
        if (this.size > 0.5) { // shrinking the box
            this.size -= this.speed;
        } else { // done shrinking and time to remove and delete
            this.remove = true;
        }
    }
}