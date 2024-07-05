# Basic Path Finder
hi! glad you are here. let me explain to you some stuff.<br>
this is a project that I made a rather long time ago, but the code was pretty bad
and kind of unreadable (not that it's any better now) but well, I fixed some stuff
and added (A LOT!) more comments to it for better readability.<br><br>
now if you are just checking this out, simply, open the "index.html" file.
otherwise, let me guide you through some stuff and how this mess works.<br>
I've explained a lot of the small little things inside the files themselves.
so, I'll be talking a little more general here! <br><br>

let's get started...

## Cells
the cells are the start of it all. for the display, it is nothing but a
simple canvas plus some fancy math and calculations done. as for the algo
itself, it's a lot more complicated. Cells, are each of the squares you see
on the canvas! they handle two things only:
- holding info
- drawing themselves and keeping a relation with the "effect cells"

so it's more like, rather than handling bigger processes, they more like
a tool, or a database.
Here's a couple important values that are stored inside the cell class:
- state: which tells us what is the cell exactly. it can vary from the following ones:
  - wall
  - empty
  - start
  - end
- row and col: they hold the place of the cell on the board
- x and y: they hold the position of the cell on the screen
<br>
> now, we need some explanation on this section.
throughout the code, wherever I use the term 'before', it means
all the data that is stored, is related to the path from start to end.
but whenever there's mention of 'after', it is related to the path
going from the end to start. Here's some of the use cases:
- layerBefore: the indexes stored from start to end
- layerAfter: the indexes stored from end to start
> more explained on this layer

- beforeCell or afterCell: the cell it was explored from, going from start to end or other way around.
- isPath, show and pathShow: variables used for setting the color of the cell based on.

and that's about it for the cells!

## Board
an array holding rows, holdings cells that form the entirety of the canvas.
the number of rows and cols are defined using the `count` variable,
in a way that the number of all cells is `count * count` or `count ^ 2`.
In the code, this is defined as the `cells` array, and it's accessed from
almost anywhere inside the project. displaying the cells, or running different algorithms,
pretty much all, involve the use of this variable.

The `addCells()` function in `page.js` handles adding the cells to the array at first.
it also places the start and ending cells.

## Clicks & Touches
the web supports both mouse and keyboard, and touches, meaning that you
can get almost the same experience on your mobile device as long as it opens web pages.
to achieve this accessibility, the followings were performed:
- handling input using 'mousedown', 'mousemove' and 'mouseup'
- handling input using 'touchstart', 'touchmove' and 'touchend'

There is an acceptable amount of similarities between the two methods
that are performed at the same time. Let me explain a little about them.
> The `mouse` variable is used to handle the actions performed by input.
> despite its name, it is used for the functionality of both touch devices
> and also the use of mouse and keyboard. `mouse.down` is used
> to see whether input should be considered on the cells or not.
> `mouse.state` defines what sort of action should be done!
> 'wall' to place wall, 'empty' to clear cells, 'start' to move start
> and 'end' to move the end cell. how these values are set and used
> is deeply explained the code, specially the `page.js` file.

now, how do the cells understand if they were pressed? it's really simple.
the position of the click or touch is saved inside `mouse.x` and `mouse.y`.
then, if the mouse or touch is down (`mouse.down`) then we will go through
every single cell and check for a certain condition:
- `cell.x  < mouse.x` and `cell.x + cellSize > mouse.x`
- `cell.y  < mouse.y` and `cell.y + cellSize > mouse.y`

which makes perfect sense! we are simply checking if the touch is
inside the boundaries defined for every cell.
[/media/boundaries.png][]

## The Finder
Now, here comes the main section of the project! The finder.<br>
That's the algorithm doing all the work in the background! Basically
the entire functionality is done using the algo. Let's get into how it works.
There's basically two sides to the algo:
- The animated version
- The quick version

As the name's suggest, it's all about speed! (well, not really)<br>
The most important difference is how they are used and when they are used
The animated version is the original one, and the one I made first.
It's simply almost the same as the second faze, but instead running it
using loops, it's ran with recursive calls with dilay, using the
javascript functions: `setTimeout` and `setInterval`<br>
Whilst it would have been possible to make it with the `setInterval`
method (which would make more sense), but I made it all with the first option
(being `setTimeout`).<br>
The reason I went for that option, is that it lets me know what I'm exactly doing!
It also allows me to make rather complicated logic without confusing myself out!
So, it's a win.<br>

That was the animated version, now let's talk about the quicker version!
The quicker version is done using nested for loops and while loops, which
means there is basically no delay in between, just the matter of speed.
Other than that, there are some other differences to consider as well!
For example:
- The animated version, also make the path blocks form slowly
(using the `formingCell` class) But the quick version does not
- The animated version is only used for forward finding! 
(more will be explained) whilst the quick run version handles both!

now, **What was the question?**
Right! what is exactly *forwards*?!?!?!<br>
Simple, remember we used Before and After names for the `Cell` class?
That's the same! The `Before` name is used instead of `forwards` and
the `After` name is used instead of `backwards`.<br>
The reason which I did that will be clean in a bit after I explain what
is exactly going on!

## Relation Between Cells
This is the cool part! I will explain this quick!<br>
Let's focus on start to finish first. In the process we will be
using the names `beforeCell` and `LayerBefore`. We will also be using the terms `openCells` and `exploredCells`,
both of which referring to an array, used throughout the algorithm. Here's a step by step explanation of everything.
The `exploredCells` array holds all the cells that have already gone through the algo and been explored.
Basically cells that their main properties are already set and no need for setting them or updating them again.
However, the `openCells` are a little more complicated!<br>
They simply hold two functionalities:
- Having themselves explored
- Adding the neighboring cells to the `openCells` array as well!<br>

The one important to remember is the second one, you know, since the first one just makes one.
Which neighbor cells???? well, assuming diagonals is off, that would be the ones on the top, left, right and bottom
of the current cell being explored! With the diagonals on, you can probably guess what would happen.
The main idea is to explore every cell this way, one by one, using other cells. The starting point being basically the
first cell inside the `openCells`, from which point every other cell is explored. If at any point we run into cells
being inside `exploredCells`, we will just skip them. What's really important for you to know are the following items:
- `layerBefore` property on cell, defines by which generation they were explored. There's an index which is updated for
each generation and the cells explored on that generation. this is used to make the brown looking effect when you move
the end cell. it basically shows all the cells which were explored until the generation with the ending cell came up.
- `beforeCell` property on cell, refers to the position of the cell the current one was explored by. Basically whenever
a cell is explored, it's source of exploration is also saved inside the cell itself (it's coordinate is).
- Going the other way around, the same is done but using the `afterCell` and `LayerAfter` variables.
- Walls, are a little weird. Since I am allowing placing the start or end cells on the walls, it means they need to be
explored as well, but, here's the catch, we don't want to add them to `openCells`. If we do add them, the issue we will
face is that their neighboring cells will also be explored, however since you can't go through walls, they shouldn't be
added.

> A little problem I should take care of is how I handle walls being explored. Not sure if the way I'm doing it with 
> `openCells` is the best way, I might change it into a better approach later.

After it's all done with the properties, we will display the path!

## Path
How we approach finding the path is using the `beforeCell` and `afterCell` properties. For example, going from start to
finish, we first start with the end cell, and make our way back using the `beforeCell` value, to find the cell it was
explored by, then we keep doing the same thing as many times we have to, until we reach the start cell, as we store all
the cells in the line, inside the `path` array. And done! The path variable is your path right there! The only thing 
left is displaying it, which is done simply. And there you have it!

## Challenges
- Can you make it take as few turns or as many turns as possible?
- Can you try making some other path finding algorithms?
- Can you also consider things like, if it was a 3d surface, keep you path with the least amount of ups and downs?
- Maybe try adding places to explore before getting to the end!

Possibilities are literally endless. So, have fun exploring! 