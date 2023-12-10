// create unique snakes: color, size, name, speed, speed/time
// create unique apples: color, rot, reward life or speed
//	style boards with different colours (wall, floor, door, snake)
//  move apple count to lair
//
//
// Features:  FOG, DOORS, TUNNELS,  MANY APPLES, MANY SNAKES, multi-life
//				LIFE APPLE , DEATH APPLE, APPLES INCREASE/DECREASE SNAKE SPEED
//				SHRINK/GROW OVER TIME, REVERSE DIRECTIONS (bad apple), LAZERS, SPIDER
//				SLOW AND FAST TERRAIN, LEAVE A TRAIL, DARK AND BRIGHT (light switch), 
//  			TELEPORTER, SECTIONS(missions),  COPY TRAIL BONUS ROUND (snake over trail)
//				HELMET ( break wall / door ), Timed Event (), Doors Auto open/close (no key)
//				MIRROR IMAGE (2 synchronized snakes, 2 separate rooms),
//				CAMOFLAUGE (snake almost same colour as lair)
//

// How:  Reveal more lair -> Start big and partially black out board


// apple.conjure  - Prevent apple on door and KEY
// snake.move   -  Detect doors, Detect KEY
// level 7		- create array of KEYS

// keep doors out of wall object???  
// maybe Key is a door and an apple
// have collision check keys
// have apple check for keys




class Host
{	constructor()
	{
		this.lives			= 5;
		this.meals			= 0;
		this.level			= 1;
		this.points			= 0;
		this.gameComplete	= false;
		this.levelComplete  = false;
	}
}

class snake
{	constructor(size, clr)
	{
		this.name		= "Zucc";
		this.alive 		= true;
		this.speed 		= 150;			// the bigger the speed, the slower the snake
		this.topspeed	= 150;			// set max speed
		this.direction	= 'd';			// set direction:  "d" down, "u" up, "l" left, "r" right
		this.colour 	= "green";		// avoid colours of other objects
		this.grow		= 0;			// grow in both snake and food,  snake.grow decreases each move until zero... stop growing
		this.tail 		= 0;			// tail coord
		this.head 		= 0;			// head coord
		this.meals		= 0;			// count food consumed
		this.coords 	= [ 1,2,3,4,5 ];
	}

	clear()		{ this.coords= []; }
	add(where)	{ this.coords.push(where); }

	paint()
	{	for(let ctr = 0; ctr < this.coords.length; ctr++)
			{ 	getMe(this.coords[ctr]).style.backgroundColor = this.colour;  }
				//getMe(this.coords[ctr]).style.border = "2px solid #3c3"; }
	}


	move()
	{	switch(this.direction) {
			case "r":	if ( ((	this.head +1) % lair.cols != 0)  && !collision(this.head +1) )
						{		this.moveOk(this.head +=1); }
						else 	{this.alive = false; }
						break;
						
			case "l":	if ((	this.head % lair.cols != 0) && !collision(this.head -1))
						{		this.moveOk(this.head -=1); }
						else	{this.alive = false; }
						break;
						
			case "u":	if (	this.head >= lair.cols && !collision(this.head - lair.cols) )
						{		this.moveOk(this.head -=lair.cols); }
						else	{this.alive = false; }
						break;
			
			case "d":	if ((lair.last - this.head) >= lair.cols && !collision(this.head + lair.cols) ) 
						{		this.moveOk(this.head +=lair.cols); }
						else	{this.alive = false; }
						break;
						
			default:	break; }	
	}

	moveOk(where)
	{ this.coords.push(where); 
		apple.eaten = (where) == apple.coord ? true : false;
		if( where == door.key)
		{	door.open();
		  	lair.paintPixel(where); }
	}

	hunt()
	{
		if(apple.eaten)						// if apple eaten, award points and increase zucc speed
		{	host.points+= apple.value;		
			this.meals++;
			this.grow += apple.grow -1;		// grow suspends tail removal in ELSE below
			this.speed+= apple.rush;
			apple.conjure(); 				// place a new apple on board

			if(this.meals>= host.meals)		// set levelComplete to true when zucc eats enough apples
			{	this.grow = 0;				// reset growth for next level
				host.level++; 
				host.levelComplete = true;
			}
		}
		else
		{	apple.age();					// apple NOT eaten, age apple
			if (this.grow)					// decrement grow if greater than 0
				{	--this.grow; }
			else							// remove tail when grow is 0
				{	//alert("tail: " + zucc.tail + "\ncoord: " + this.coords[0]);
					//getMe(this.coords[0]).className = "pixl";
					this.coords.shift(); 	// remove first element of snake
					setColour(zucc.tail, getColour( zucc.tail )); }	// getColour vaule could be any square
					//lair.paintPixel(zucc.tail); }
		}
	}
}

class food
{	constructor()
	{
		this.visible	= true;
		this.colour		= "red";
		this.eaten		= false;	
		this.grow		= 0;		// increase snake by this length for food
		this.timer		= 60;		// timer that decreases by one for each snake move
		this.life		= 60;		// time it takes for food to rot
		this.coord		= 0;		// position of food relating to board button id's
		this.value		= 4;		// points awarded for food
		this.count		= 0;		// counting done in Lair?? coz lair tracks level specific requriements
		this.rush		= -1;		// change speed of snake when food eaten; + will decrease speed, - will increase speed
	}

	paint()
	{	if(this.visible)	{ setColour(this.coord, this.colour); }
		else				{ setColour(this.coord, getColour(this.coord)); }
	}
	
	age()
	{
		this.timer--;
		let fade = this.timer / this.life * 100;
		switch(true)
		{
			case fade == 0:
			{	setColour(this.coord, lair.colour);
				this.conjure();
			}
			
			case fade >0 && fade <= 25:
			{	this.colour = "#fbb";
				this.value = 1;
				break;				}

			case fade >25 && fade <=50:
			{	this.colour = "#f99";
				this.value = 2;
				break;				}
			
			case fade >50 && fade <=75:
			{	this.colour = "#f66";
				this.value = 3;
				break;				}
			
			case fade >75 && fade <=100:
			{	this.colour = "#f00";
				this.value = 4;
				break;				}
				
			default:		{break; }
			
		}	this.paint();
	}

	conjure()
	{	let ok = true;
		this.colour = "#f00";
		do
		{	ok = true;
			this.coord = Math.floor( Math.random() * lair.last );

			if(this.coord == door.key)	{ ok= false; break; }
			
			for( let z of zucc.coords )
				{ if(this.coord == z )	{ ok = false; break; }}
	
			for (let w of walls.coords )
			{	if(this.coord == w )	{ ok = false; break; }}			

			for (let d of door.coords )
			{	if( this.coord == d )	{ ok = false; break; }}			

		} while(!ok);
		
		this.timer = this.life;
		this.value = 4;
		this.paint();
		this.count++;
		this.eaten = false;
	}
}

class hGrid
{	constructor()
	{
		this.cols 		= 36;
		this.rows 		= 36;
		this.last		= 0;
		this.colour		= "#444";
		this.timer  	= 0;
		this.turntime	= 0;
	}

	paint()	
	{	let pixels = document.getElementsByClassName("pixl");
		for(let ctr=0; ctr< pixels.length; ctr++)
			{ pixels[ctr].style.backgroundColor = pixels[ctr].value; }
	}

	// create CSS class pixl
	paintPixel(where) 		
	{
//		getMe(where).style.backgroundColor = this.colour;
//		getMe(where).style.margin = "1px";
//		getMe(where).style.border = "";
//		getMe(where).style.borderLeft = "solid 1px #665";
//		getMe(where).style.borderBottom = "solid 1px #665";
		getMe(where).className= "pixl";
		getMe(where).value= this.colour;
	}
}

class obstacle
{	constructor(colour, coords)
	{
		this.coords	=	coords || [];
		this.colour	=	colour || "black";
	}
	
	add(where)	{ this.coords.push(where); }
	clear()		{ this.coords = []; }
	paint()		{ for(let i of this.coords)		{ setColour(i, this.colour); } }
}

class Door extends obstacle
{
	constructor(colour,where)
	{
		super(colour,where);
		this.key 	= null;
		this.isOpen = false;
	}

	clearDoor()
	{	this.isOpen = false;
		this.key = null;
		this.clear();
	}

	open()
	{	this.isOpen		= true;
		this.key		= null;
		for(let c of this.coords)	{ setColour(c, lair.colour);}
		this.clear();
	}

	addKey(where)
	{	this.key = where;
		getMe(this.key).style.border = "thin solid white"
	}
}


//***** Global Variables *****  //  make array for apples, triggers
//****************************
let host  = new Host();
let lair  = new hGrid();
let zucc  = new snake();
let apple = new food();
let walls = new obstacle();
let door  = new Door();

let black 	= "black";
let white	= "white";
let purple 	= "purple";
let brown 	= "brown";
let orange  = "orange";

// each level in this array stores the  # of rows, # of cols in the LAST 2 elements of each level array
// the paintBoard() routine builds the board based on these 2 important elements at the back
let levels = 
[
	[],
	[ ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"black",,,,,,,"black",,,"black",,,,,,,"black",,,"black",,,,,,,"black",,,"black",,,,,,,"black",,,"black",,,,,,,"black",,,"black",,,,,,,"black",,,"black",,,,,,,"black",,,"black",,,,,,,"black",,,"black","black","black","black","black","black","black","black",,,,,,,,,,,,10,20 ],
	[ "black",,,,,,,,,,,,,,,,,,,"black",,,,,,,,,,,,,,,,,,,,,,,"black","black","black","black","black","black","black","black","black","black","black","black","black","black","black","black",,,,,"black",,,,,,,,,,,,,,,"black",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"black",,,,,,,,,,,,,,,"black",,,,,"black","black","black","black","black","black","black","black","black","black","black","black","black","black","black","black",,,,,,,,,,,,,,,,,,,,,,,"black",,,,,,,,,,,,,,,,,,,"black",20,10 ],
	[ ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,black,,,,,,,,,,,,,,,black,,,,,black,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,black,,,,,,,,,,,,,,,black,,,,,black,,,,,,,,,,,,,,,black,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,black,,,,,,,,,,,,,,,black,,,,,black,,,,,,,,,,,,,,,black,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,black,,,,,black,,,,,,,,,,,,,,,black,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,20,22 ],
	[ ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,11,19 ],
	[ ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,black,black,black,black,black,black,,black,black,black,black,black,black,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,19,19 ],
	[ ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,black,black,black,black,black,,,,,,black,,,,,,,,,black,,,,,,,,,,,,,,,black,,,,,,black,black,black,black,,,,,,black,,,,,,,,,,,,,,,black,black,black,black,,,,,,black,,,,,,black,,,,,,,,,,,,,,,,,,black,,,,,,black,black,black,black,,,black,,,,,,,,,,,,,,,,,,black,black,black,black,,,,,,black,,,black,,,,,,,,,,,black,black,black,black,black,,,,,,black,,,,,,black,black,black,black,,,,,,,,,,,black,,,,black,,,,,,black,black,black,black,,,,,,,,,,,,,,,,,black,,,,black,black,black,black,,,,,,black,,,,,,,,,,,,,,,,,black,,,,,,,black,,,,,,black,black,black,black,,,,,,,,,,,,,,black,,,,,,,black,black,black,black,,,,,,black,,,,,,,,,,,,,,black,,,,,,,,,,black,,,,,,black,black,black,black,,,,,,,,,,,black,,,,,,,,,,black,black,black,black,,,,,,black,,,,,,,,,,,black,,,,,,,,,,,,,black,,,,,,black,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,30,24],
	[,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,black,,,,,,,,,,,,,,,,,,,,black,,,,,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,black,,,,,,,,,,purple,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,brown,,30,30],
	[,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,black,black,black,black,black,black,black,black,black,black,black,black,black,black,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,20,20]

];
	

//*****  Executable Code *****
//****************************
level();
go();


//***** Global functions *****
//****************************
function Lionel()				{ confirm("Hello, Is it me you're looking for?"); }
function getMe(id)				{ return document.getElementById(id); }	
function getColour(id)			{ return getMe(id).value; }
function setColour(id, colour)	{ getMe(id).style.backgroundColor= colour; }


function level()
{	
	zucc.grow = 	0;
	zucc.meals = 	0;
	apple.count = 	0;
	paintBoard();

	switch(host.level)
	{
		case 1:		getMe("level").innerHTML =   	"1- The Beginning";
					getMe("mission").innerHTML =	"Eat 5 apples." + "<br />" +
												 	"Avoid hitting any snakes or walls." + "<br />" +
													"Apples increase snake speed ALOT.";

					// zucc is built using a for loop
					for(let z=1; z < 5; z++)	{ zucc.add(Number(z)); }
					zucc.topspeed	= 220;
					zucc.speed 		= 220;
					zucc.direction 	= "d";
					zucc.name		= "Zucc";
				
					host.meals 		= 5;
					apple.life 		= 60;
					apple.rush		= -35;
					apple.grow		= 1;
					break;

		case 2:		getMe("level").innerHTML =   	"2- Getting Somewhere";
					getMe("mission").innerHTML =	"Eat 4 apples." + "<br />" +
													"Apples rot quicker.";
																		
					for(let z=1; z < 6; z++)	{ zucc.add(Number(z)); }
					zucc.topspeed	= 150;
					zucc.speed 		= 150;
					zucc.direction 	= "r";
					zucc.colour		= "yellow";
					zucc.name		= "Chuck";

					host.meals		= 4;
					apple.life		= 48;
					apple.rush		= -1;
					apple.grow		= 1;
					break;

		case 3:		getMe("level").innerHTML =   	"3- Kabinets";
					getMe("mission").innerHTML = 	"Eat 5 apples." + "<br />" +
													"Apples slow you down a bit.";
					
					for(let z=135; z > 129; z--)	{ zucc.add(Number(z)); }
					zucc.topspeed	= 125;
					zucc.speed 		= 125;
					zucc.direction 	= "l";
					zucc.colour		= "orange";
					zucc.name		= "Tedious";

					host.meals		= 5;
					apple.life		= 60;	
					apple.rush		= 7;
					apple.grow		= 1;
					break;

		case 4: 	getMe("level").innerHTML =   	"4- Ziggy Zaggy";
					getMe("mission").innerHTML =	"Eat only 3 apples."  + "<br />" +
												 	"Apples rot quicker"  + "<br />" +
													"Apples increase snake speed.";
													
					
					for(let z=12; z < 17; z++)	{ zucc.add(Number(z)); }
					zucc.topspeed	= 190;
					zucc.speed 		= 190;
					zucc.direction 	= "r";
					zucc.colour		= "white";
					zucc.name		= "Ziggy";

					host.meals		= 3;
					apple.life		= 40;
					apple.rush		= -10;
					apple.grow		= 1;
					break;						
		
		case 5:		getMe("level").innerHTML =   	"5- Cross";
					getMe("mission").innerHTML =	"Eat 10 apples."  + "<br />" +
												 	"Apples increase snake size.";
					
					for(let z=322; z >312; z--)	{ zucc.add(Number(z)); }
					zucc.topspeed	= 130;
					zucc.speed 		= 130;
					zucc.direction 	= "l";
					zucc.colour		= "yellow";
					zucc.name		= "Telly";

					host.meals		= 10;
					apple.life		= 60;
					apple.rush		= -1;
					apple.grow		= 5;
					break;

		case 6:		getMe("level").innerHTML =   	"6- Easter Egg";
					getMe("mission").innerHTML = 	"Eat 5 apples."  + "<br />" +
													"Apples rot quicker.";
					
					for(let z=695; z < 697; z++)	{ zucc.add(Number(z)); }
					zucc.topspeed	= 145;
					zucc.speed 		= 145;
					zucc.direction 	= "r";
					zucc.colour		= "green";
					zucc.name		= "Bunny";

					host.meals		= 5;
					apple.life		= 40;
					apple.rush		= -1;
					apple.grow		= 1;
					break;

		case 7:		getMe("level").innerHTML =   	"7- Door";
					getMe("mission").innerHTML =	"Eat 5 apples."  + "<br />" +
													"Apples rot really fast"  + "<br />" +								
													"trigger plates open doors";
													
					if(door.coords.length) { door.addKey(475); }
					
					for(let z=2; z < 9; z++)	{ zucc.add(Number(z)); }
					zucc.topspeed	= 145;
					zucc.speed 		= 145;
					zucc.direction 	= "d";
					zucc.colour		= "green";
					zucc.name		= "Miner";

					host.meals		= 5;
					apple.life		= 32;
					apple.rush		= -1;
					apple.grow		= 1;
					break;

		case 8:		getMe("level").innerHTML =   "8- Testing Testing 123";
					getMe("mission").innerHTML =	"Eat 12 apples." + "<br />" +
													"Apples rot quicker." + "<br />" +
													"Snake speed is quicker.";

					
					for(let z=5; z < 10; z++)	{ zucc.add(Number(z)); }
					zucc.topspeed	= 125;
					zucc.speed 		= 125;
					zucc.direction 	= "r";
					zucc.colour		= "green";
					zucc.name		= "Joe Rogan";

					host.meals		= 12;
					apple.life		= 40;
					apple.rush		= -1;
					apple.grow		= 1;
					break;					

		default:	break;
	}
	zucc.paint();
	apple.conjure();
}
	
function paintBoard()
{
	let thislevel	= levels[host.level];
	lair.rows  		= thislevel[thislevel.length-1];
	lair.cols 		= thislevel[thislevel.length-2];
	lair.last 		= lair.rows * lair.cols -1;

	host.levelComplete = false;
	// remove the contents of board. The nested for loops below will recreate the board 
	while (getMe("board").hasChildNodes())		{ getMe("board").removeChild( getMe("board").firstChild ); }
	for(let row=1; row <= lair.rows; row++)
	{	for(let col=1; col <= lair.cols; col++)
		{	let pixl= document.createElement("button");
			pixl.id= lair.cols * (row-1) + (col-1);
			getMe("board").appendChild(pixl); 
			lair.paintPixel(pixl.id);
			if (col==lair.cols) { getMe("board").appendChild(document.createElement("br")); }
		} }

	// Search thislevel array for black walls, purple Door
	zucc.clear();
	walls.clear();
	walls.colour = "black";
	door.clearDoor();
	door.colour = "purple";
		
	for(let i= 0; i <= lair.last; i++)
	{	switch( thislevel[i] )
		{
			case walls.colour:		walls.add(i);	break;
			case door.colour:		door.add(i);	break;
			default:				break;
		}
	}
	walls.paint();
	if(door.coords != [])	{ door.paint(); }
		
}


function go()
{	setTimeout(function()
	{	
		zucc.tail = zucc.coords[0];
		zucc.head = zucc.coords[ zucc.coords.length -1 ];
		//setColour(zucc.tail, getColour( zucc.tail ));			// replace old tail colour with lair colour
		zucc.move();
			
		if (zucc.alive)							// if Zucc is still alive, check for apples eaten
		{
			lair.timer++;
			zucc.hunt();
			zucc.paint();						// draw zucc and dump game stats
			dumpStats();

			if(!host.levelComplete)				// call this function recursively until level is complete
			{	go(); }							// RECURSIVE CALL	
			else								// restore game defaults for next level before calling this function recursively 
			{	if(confirm("You did it! Continue?"))
				{	if(host.level < levels.length)
					{	level();
						go();					// RECURSIVE CALL
					}
					else { alert("WAY TO GO... you have COMPLETED the game... thank you for playing"); }
				}
			}
		}
		else									// alert player when zucc dies or when game is over
		{
			if(host.lives >1)
			{	
				alert("Ouch... you lost a life... click ok to continue...");
				zucc.grow = 0;
				host.lives -=1;
				zucc.alive = true;
				level();
				go();							// RECURSIVE CALL
			}	
			else	{ alert("OH NOOOO... you lost your LAST life... ") }	

		}	
	},	zucc.speed );
}

function direct(direction)
{	if ((zucc.direction == "l" && direction != "r") || (zucc.direction == "r" && direction != "l") ||
		(zucc.direction == "u" && direction != "d") || (zucc.direction == "d" && direction != "u") )
			{ 	if(lair.timer != lair.turntime)
				{	zucc.direction = direction; 
					lair.turntime  = lair.timer;	}
				else
				{	} // make sound
			}
}

function collision(destination)
{	
	let ok= false;
	for (let i=1; i <= zucc.coords.length; i ++)		// do not consider hitting tail at zucc.coords[0]
	{	if (destination == zucc.coords[i])				// since tail will be gone next move
		{	ok = true;
			break;
		} 
	}
	for (let i of walls.coords)							// loop through walls coords array for collision
	{	if (destination == i)
		{	ok = true;
			break;
		}
	}	
	for (let i of door.coords)							// loop through door coords array for collision
	{	if (destination == i)
		{	ok = true;
			break;
		}
	}	
	return ok;
}

function dumpStats()
{
	getMe("name").innerHTML 	= zucc.name;
	getMe("lives").innerHTML 	= host.lives;	
	getMe("speed").innerHTML	= zucc.topspeed - zucc.speed;
	getMe("points").innerHTML 	= host.points;
	getMe("apples").innerHTML 	= zucc.meals;
	getMe("clock").innerHTML	= lair.timer;

}

window.addEventListener( "keydown", function(event)
{
	if(event.defaultPrevented)	{ return; }

	switch(event.key)
	{
		case "ArrowRight":		direct('r');
								break;
		
		case "ArrowLeft":		direct('l');
								break;
		
		case "ArrowUp":			direct('u');
								break;
		
		case "ArrowDown":		direct('d');
								break;
	
		default:				return;
	}	event.preventDefault();
	
}, true);

// 		BUG >>  change direction more than once per clock tick
//				limit one direction per clock tick and BEEP rejected keystrokes
//		
//		if levelComplete && host.level < levels.length
//		gameComplete added
