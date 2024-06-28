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

<I'll add the rest later>