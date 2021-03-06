'use strict';

var getById = document.getElementById.bind(document);

// following function written by James Padolsey
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
var query = getParameterByName('s');
if (query === null)
	query = NaN;
var seed = isNaN(query) ? Math.floor((1<<30)*Math.random()) : query;
var prng = new MersenneTwister(seed);
prng = prng.random.bind(prng);

// generte title text
var THIS = rlt.shuffle([
	'amulet',
	'best',
	'orb',
	'blanket',
	'week',
	'quest item',
	'origin',
	'blessing',
	'heart',
	'widget',
	'book',
	'kitchen sink',
	'vision',
	'irony',
	'hall',
	'melody',
	'vestment',
	'affirmation',
	'narwhal',
	'color',
	'game',
	'scroll',
	'element',
	'entropy',
	'world',
	'realm'
], prng)[0];
var THAT = rlt.shuffle([
	'yendor',
	'denory',
	'eternal life',
	'boring ideas',
	'7 days',
	'great value',
	'the sea',
	'kings',
	'vitality',
	'insight',
	'endless plains',
	'music',
	'chance',
	'irony',
	'felicity',
	'ten for got ten',
	'positivity',
	'the ' + THIS + ' shop',
	'fast internet',
	'motivation',
	'grace',
	'green traffic lights',
	'wizardry',
	THIS + 's',
	'ascendance',
	'riches',
	'a hero long-forgotten',
	'wonder',
	'Rodney',
	'"; game.increaseDifficulty();',
	'yes!'
], prng)[0];
var $THISs = document.getElementsByClassName('this');
for (var i = 0; i < $THISs.length; i++) {
	$THISs[i].innerHTML = THIS;
}
var $THATs = document.getElementsByClassName('that');
for (var i = 0; i < $THATs.length; i++) {
	$THATs[i].innerHTML = THAT;
}

// message buffer
var buffer = getById('buffer');
var bufferText;
var bufferClass;
buffer.style.height = buffer.clientHeight + 'px';
var log = function(str) {
	if (!str) {
		buffer.setAttribute('class', {
			age0: 'age1',
			age1: 'age2',
			age2: 'age3',
			age3: 'age4',
			age4: 'age4'
		}[buffer.getAttribute('class')]);
	} else if (buffer.getAttribute('class') === 'age0') {
		buffer.innerHTML += str;
	} else {
		buffer.setAttribute('class', 'age0');
		buffer.innerHTML = str;
	}
	bufferText = buffer.innerHTML;
	bufferClass = buffer.getAttribute('class');
};
var tempLog = function(str) {
	buffer.innerHTML = str;
	buffer.setAttribute('class', 'age0');
};
var lateLog = function(str) {
	buffer.innerHTML += str;
	bufferText = buffer.innerHTML;
};
var revertLog = function() {
	buffer.innerHTML = bufferText;
	buffer.setAttribute('class', bufferClass);
};

// define display
var display = {
	element: getById('display'),
	width: 60,
	height: 28
};
for (var y = 0; y < display.height; y++) {
	var row = document.createElement('div');
	for (var x = 0; x < display.width; x++) {
		var tile = document.createElement('span');
		tile.innerHTML = ' ';
		row.appendChild(tile);
	}
	display.element.appendChild(row);
}
// center it
getById('game').style.width  = getById('display').clientWidth + 1 + 'px';
getById('game').style.height = getById('buffer').clientHeight +
                               getById('display').clientHeight + 
                               getById('stats').clientHeight + 'px';
var displayTile = function(x, y) {
	return display.element.childNodes[y].childNodes[x];
};

// Palette by Arne
var colors = {
	void: 		'#000000',
	ash: 		'#9D9D9D',
	blind: 		'#FFFFFF',
	bloodred: 	'#BE2633',
	pigmeat: 	'#E06F8B',
	oldpoop: 	'#493C2B',
	newpoop: 	'#A46422',
	blaze: 		'#EB8931',
	zornskin: 	'#F7E26B',
	shadegreen: '#2F484E',
	leafgreen: 	'#44891A',
	slimegreen: '#A3CE27',
	nightblue: 	'#1B2632',
	seablue: 	'#005784',
	skyblue: 	'#31A2F2',
	cloudblue: 	'#B2DCEF',
	transparent: 'transparent'
};

var blank = function() {};

var schedule;

var asWall = function(obj) {
	var wall = Object.create({
		color: 'blind',
		passable: false,
		transparent: false,
		description: 'A wall. '
	});
	for (var prop in obj) {
		wall[prop] = obj[prop];
	}
	return wall;
};

var tiles = {
	empty: {
		char: ' ',
		color: 'transparent',
		passable: false,
		transparent: false
	},
	floor: {
		char: '.',
		color: 'blind',
		passable: true,
		transparent: true,
		description: 'The floor.'
	},
	vertical: asWall({
		char: '│'
	}),
	horizontal: asWall({
		char: '─'
	}),
	topRight: asWall({
		char: '┐'
	}),
	topLeft: asWall({
		char: '┌'
	}),
	bottomRight: asWall({
		char: '┘'
	}),
	bottomLeft: asWall({
		char: '└'
	}),
	door: {
		char: '+',
		color: 'cloudblue',
		passable: true,
		transparent: false,
		description: 'A closed iron door. '
	},
	openDoor: {
		char: '/',
		color: 'cloudblue',
		passable: true,
		transparent: true,
		description: 'An open door. '
	},
	corridor: {
		char: '#',
		color: 'ash',
		passable: true,
		transparent: true,
		description: 'A narrow corridor. '
	},
	edge: {
		char: ' ',
		color: 'void',
		passable: false,
		transparent: false,
		description: 'The edge of the world. '
	},
	grass: {
		char: "'",
		color: 'slimegreen',
		passable: true,
		transparent: true,
		description: 'Grass. '
	},
	bush: {
		char: '"',
		color: 'leafgreen',
		passable: true,
		transparent: true,
		description: 'A bush. '
	},
	tree: {
		char: '♠',
		color: 'leafgreen',
		passable: false,
		transparent: false,
		description: 'A tree. '
	}
};

var newTile = function(tile) {
	return Object.create(tiles[tile]);
}

var distance = function(dx, dy) {
	dx = Math.abs(dx);
	dy = Math.abs(dy);
	return Math.max(dx, dy) + Math.min(dx, dy) / 2;
};

var visibleActorCount = function() {
	var count = 0;
	for (var x = 0; x < display.width; x++) for (var y = 0; y < display.height; y++) {
		if (level[x][y].actor && level[x][y].visible) count++;
	}
	return count;
};

var act = function() {
	if (this.dead) {
		return schedule.advance().act();
	} else {
		return this[this.state]();
	}
};

var sleeping = function() {
	if (level[this.x][this.y].visible) {
		this.goal = {
			x: player.x,
			y: player.y
		};
		this.state = 'hunting';
	}
	schedule.add(this, this.delay);
	return schedule.advance().act();
};

var moldSleeping = function() {
	if (distance(this.x-player.x, this.y-player.y) < 2) {
		return this.attack(player);
	} else {
		schedule.add(this, this.delay);
		return schedule.advance().act();
	}
};

var hunting = function() {
	if (level[this.x][this.y].visible) {
		this.goal = {
			x: player.x,
			y: player.y
		};
	}
	var mx = 0, my = 0;
	var dist = distance(this.x-this.goal.x, this.y-this.goal.y);
	for (var i = 0; i < 8; i++) {
		var dx = rlt.dir8[i][0];
		var dy = rlt.dir8[i][1];
		var newdist = distance(this.x+dx-this.goal.x, this.y+dy-this.goal.y);
		var tile = level[this.x+dx][this.y+dy];
		if (tile.passable && (!tile.actor || tile.actor === player) && newdist < dist) {
			dist = newdist;
			mx = dx;
			my = dy;
		}
	}
	return this.move(mx, my);
};

var batHunting = function() {
	if (prng() < 0.5)
		return hunting.call(this);
	if (level[this.x][this.y].visible) {
		this.goal = {
			x: player.x,
			y: player.y
		};
	}
	var mx = 0, my = 0;
	var dist = 1;
	for (var i = 0; i < 8; i++) {
		var dx = rlt.dir8[i][0];
		var dy = rlt.dir8[i][1];
		var newdist = prng();
		var tile = level[this.x+dx][this.y+dy];
		if (tile.passable && (!tile.actor || tile.actor === player) && newdist < dist) {
			dist = newdist;
			mx = dx;
			my = dy;
		}
	}
	return this.move(mx, my);
};

var rangedHunting = function() {
	if (level[this.x][this.y].visible) {
		this.goal = {
			x: player.x,
			y: player.y
		};
		return this.attack(player);
	} else {
		var mx = 0, my = 0;
		var dist = distance(this.x-this.goal.x, this.y-this.goal.y);
		for (var i = 0; i < 8; i++) {
			var dx = rlt.dir8[i][0];
			var dy = rlt.dir8[i][1];
			var newdist = distance(this.x+dx-this.goal.x, this.y+dy-this.goal.y);
			var tile = level[this.x+dx][this.y+dy];
			if (tile.passable && (!tile.actor || tile.actor === player) && newdist < dist) {
				dist = newdist;
				mx = dx;
				my = dy;
			}
		}
		return this.move(mx, my);
	}
};

var lateHunting = function() {
	if (level[this.x][this.y].visible) {
		this.goal = {
			x: player.lastx,
			y: player.lasty
		};
	}
	var mx = 0, my = 0;
	var dist = distance(this.x-this.goal.x, this.y-this.goal.y);
	for (var i = 0; i < 8; i++) {
		var dx = rlt.dir8[i][0];
		var dy = rlt.dir8[i][1];
		var newdist = distance(this.x+dx-this.goal.x, this.y+dy-this.goal.y);
		var tile = level[this.x+dx][this.y+dy];
		if (tile.passable && (!tile.actor || tile.actor === player) && newdist < dist) {
			dist = newdist;
			mx = dx;
			my = dy;
		}
	}
	return this.move(mx, my);
}

var drunkHunting = function() {
	if (level[this.x][this.y].visible) {
		this.goal = {
			x: player.x,
			y: player.y
		};
	}
	var mx = 0, my = 0;
	var dist = distance(this.x-this.goal.x, this.y-this.goal.y)+3*prng();
	for (var i = 0; i < 8; i++) {
		var dx = rlt.dir8[i][0];
		var dy = rlt.dir8[i][1];
		var newdist = distance(this.x+dx-this.goal.x, this.y+dy-this.goal.y);
		var tile = level[this.x+dx][this.y+dy];
		if (tile.passable && (!tile.actor || tile.actor === player) &&
			newdist + 3 * prng() < dist) {
			dist = newdist;
			mx = dx;
			my = dy;
		}
	}
	return this.move(mx, my);
};

var haunt = function() {
	this.dead = true;
	level[this.x][this.y].actor = undefined;
};

var batHaunt = function() {
	this.dead = true;
	level[this.x][this.y].actor = undefined;
	if (player.blinded) {
		player.blinded.duration = 6;
	} else {
		player.blinded = {
			duration: 6
		};
		getById('blinded').style.display = 'block';
	}
};

var dwarfHaunt = function() {
	this.dead = true;
	level[this.x][this.y].actor = undefined;
	player.confused = 6;
	getById('confused').style.display = 'block';
};

var flee = function(x, y) {
	var bestdx = 0;
	var bestdy = 0;
	var dist = distance(this.x-x, this.y-y);
	for (var i = 0; i < 8; i++) {
		var newx = this.x + rlt.dir8[i][0];
		var newy = this.y + rlt.dir8[i][1];
		var newDist = distance(newx-x, newy-y);
		if (level[newx][newy].passable &&
			!level[newx][newy].actor && newDist > dist) {
			dist = newDist;
			bestdx = rlt.dir8[i][0];
			bestdy = rlt.dir8[i][1];
		}
	}
	if (bestdx === 0 && bestdy === 0) {
		bestdx = rlt.clamp(x-this.x, -1, 1);
		bestdy = rlt.clamp(y-this.y, -1, 1);
		return attack.call(this, level[this.x+bestdx][this.y+bestdy].actor);
	}
	return requestAnimationFrame(this.move.bind(this, bestdx, bestdy));
}

var attack = function(actor) {
	var type = actor.gainHp(-this.dmg);
	if (this === player) {
		log('You ' + type + ' the ' + actor.name + '. ');
	} else if (actor === player) {
		log('The ' + this.name + ' ' + type + 's you. ');
	}
	schedule.add(this, this.attackDelay);
	return schedule.advance().act();
};

var rangedAttack = function(actor) {
	if (distance(this.x-actor.x, this.y-actor.y) < 2) {
		if (visibleActorCount() < 3) {
			return attack.call(this, actor);
		} else {
			return this.flee(player.x, player.y);
		}
	}
	var heuristic = prng();
	var x = actor.x;
	var y = actor.y;
	for (var i = 0; i < 9; i++) {
		var newHeuristic = prng();
		var newx = actor.x + rlt.dir9[i][0];
		var newy = actor.y + rlt.dir9[i][1];
		if (level[newx][newy].passable &&
			(!level[newx][newy].actor || level[newx][newy].actor === actor) &&
			newHeuristic < heuristic) {
			var heuristic = newHeuristic;
			var x = newx;
			var y = newy;
		}
	}
	animationQueue.push(function(callback) {
		var major = Math.max(Math.abs(this.x-x), Math.abs(this.y-y));
		var dx = (x - this.x) / major;
		var dy = (y - this.y) / major;
		var step = function(i) {
			var tempx = Math.round(this.x + i * dx);
			var tempy = Math.round(this.y + i * dy);
			if (i === major) {
				if (level[tempx][tempy].visible) {
					displayTile(tempx, tempy).innerHTML = level[tempx][tempy].actor ?
						level[tempx][tempy].actor.char :
						level[tempx][tempy].char;
					displayTile(tempx, tempy).style.color = level[tempx][tempy].actor ?
						colors[level[tempx][tempy].actor.color] :
						colors[level[tempx][tempy].color];
				} else {
					displayTile(tempx, tempy).innerHTML = ' ';
				}
				return callback();
			}
			if (level[tempx][tempy].visible) {
				displayTile(tempx, tempy).innerHTML = level[tempx][tempy].actor ?
					level[tempx][tempy].actor.char :
					level[tempx][tempy].char;
				displayTile(tempx, tempy).style.color = level[tempx][tempy].actor ?
					colors[level[tempx][tempy].actor.color] :
					colors[level[tempx][tempy].color];
			} else {
				displayTile(tempx, tempy).innerHTML = ' ';
			}
			i++;
			tempx = Math.round(this.x + i * dx);
			tempy = Math.round(this.y + i * dy);
			displayTile(tempx, tempy).innerHTML = '*';
			displayTile(tempx, tempy).style.color = colors['blind'];
			setTimeout(step.bind(this, i), 60);
		};
		step.call(this, 0);
	}.bind(this));
	if (x === actor.x && y === actor.y) {
		var type = actor.gainHp(-this.dmg).replace('hit', 'shoot');
		if (this === player) {
			log('You ' + type + ' the ' + actor.name + '. ');
		} else if (actor === player) {
			log('The ' + this.name + ' ' + type + 's you. ');
		}
	} else {
		if (this === player) {
			log('You miss the ' + actor.name + '. ');
		} else if (actor === player) {
			log('The ' + this.name + ' misses you. ');
		}
	}
	schedule.add(this, this.attackDelay);
	return schedule.advance().act();
};

var gainHp = function(hp) {
	var type = 'hit';
	this.hp += hp;
	if (hp < 0 && this.hp > 0) {
		animationQueue.push(function(callback) {
			var tile = display.element.childNodes[this.y].childNodes[this.x];
			tile.setAttribute('class', 'damaged' + this.color);
			setTimeout(tile.setAttribute.bind(tile, 'class', ''), 500);
			callback();
		}.bind(this));
	}
	if (this.hp > this.maxHp) {
		this.hp = this.maxHp;
	}
	if (this.hp <= 0) {
		this.hp = 0;
		this.die();
		type = 'kill';
	}
	if (this === player) {
		var hpStr = '' + this.hp;
		if (hpStr.length === 1) hpStr = ' ' + hpStr;
		getById('hp').innerHTML = hpStr;
	}
	return type;
};

var move = function(dx, dy) {
	if (dx === 0 && dy === 0) {
		schedule.add(this, this.delay);
		return schedule.advance().act();
	} else if (level[this.x+dx][this.y+dy].actor) {
		return this.attack(level[this.x+dx][this.y+dy].actor);
	} else if (level[this.x+dx][this.y+dy].passable) {
		level[this.x][this.y].actor = undefined;
		this.x += dx;
		this.y += dy;
		level[this.x][this.y].actor = this;
		schedule.add(this, this.delay);
		return schedule.advance().act();
	}
};

var die = function() {
	this.dead = true;
	level[this.x][this.y].actor = undefined;
};

var exitDoor = function(dx, dy) {
	var room = level[this.x][this.y].room;
	if (level[this.x+dx][this.y+dy].char === '#') {
		level[this.x][this.y] = newTile('openDoor');
		level[this.x][this.y].room = room;
		this.enterDoor = enterRoom;
	} else {
		level[this.x][this.y] = newTile('door');
		level[this.x][this.y].room = room;
		this.enterDoor = enterCorridor;
		// destroy past stuff
		var oldCurrentRoom = currentRoom;
		for (var x = 0; x < display.width; x++) for (var y = 0; y < display.height; y++) {
			var tile = level[x][y];
			if (tile.room !== room) {
				if (tile.actor)
					tile.actor.haunt();
				if (level[x][y].room === currentRoom)
					currentRoom = room;
				level[x][y] = newTile('empty');
			}
		}
		if (currentRoom !== oldCurrentRoom) {
			if (player.hasGoal)
				progress--;
			else
				progress++;
			getById('progress').innerHTML = progress;
			updateDiscovered();
		}
		if (player.hasGoal && progress === 0) {
			player.enterDoor = enterOutside;
		}
	}
};

var exitDungeon = function() {
	player.enterDoor = blank;
	player.exitDoor = blank;
	log('You escape the dungeon, the ' + THIS + ' of ' + THAT + ' in hand. ' + seed);
}

var enterRoom = function() {
	if (progress >= 11 && !player.hasGoal) {
		var room = level[this.x][this.y].room;
		var dist = 0;
		var bestx = 0;
		var besty = 0;
		for (var x = room.x + 1; x < room.x + room.w - 1; x++) {
			for (var y = room.y + 1; y < room.y + room.h - 1; y++) {
				var newDist = distance(this.x-x, this.y-y);
				if (newDist > dist) {
					dist = newDist;
					bestx = x;
					besty = y;
				}
			}
		}
		level[bestx][besty].actor = goal;
		goal.x = bestx;
		goal.y = besty;
	} else if (player.hasGoal && progress === 1) {
		// yay
	} else {
		addMonsters(level[this.x][this.y].room);
	}
};

var enterCorridor = function() {
	var thisRoom = level[this.x][this.y].room;
	// find facing
	var facing;
	if (level[this.x-1][this.y].char === '.') {
		facing = 'right';
	} else if (level[this.x+1][this.y].char === '.') {
		facing = 'left';
	} else if (level[this.x][this.y-1].char === '.') {
		facing = 'bottom';
	} else {
		facing = 'top';
	}
	var opposite = {
		top: 'bottom',
		bottom: 'top',
		left: 'right',
		right: 'left'
	};
	var orientation = {
		top: 'vertical',
		bottom: 'vertical',
		left: 'horizontal',
		right: 'horizontal'
	};
	// make a new room and add monsters
	var width = rlt.random(6, 9, prng);
	var height = rlt.random(6, 9, prng);
	if (facing === 'bottom') {
		var xpos = rlt.random(0, display.width-width, prng);
		var ypos = rlt.random(this.y+2, display.height-height, prng);
	} else if (facing === 'top') {
		var xpos = rlt.random(0, display.width-width, prng);
		var ypos = rlt.random(0, this.y-height-1, prng);
	} else if (facing === 'right') {
		var xpos = rlt.random(this.x+2, display.width-width, prng);
		var ypos = rlt.random(0, display.height-height, prng);
	} else {
		var xpos = rlt.random(0, this.x-width-1, prng);
		var ypos = rlt.random(0, display.height-height, prng);
	}
	makeRoom(xpos, ypos, width, height);
	// add doors
	var chance = {};
	if (xpos > 10) chance.left = 2/3;
	if (ypos > 10) chance.top = 2/3;
	if (xpos+width < display.width-9) chance.right = 2/3;
	if (ypos+height < display.height-9) chance.bottom = 2/3;
	chance[opposite[facing]] = 1;
	var doors = addDoors(xpos, ypos, width, height, chance);
	// add a corridor
	makeCorridor(this, doors[opposite[facing]], orientation[facing]);
};

var enterOutside = function() {
	player.exitDoor = exitDungeon;
	var room = level[this.x][this.y].room;
	for (var x = 0; x < display.width; x++) for (var y = 0; y < display.height; y++) {
		if (level[x][y].char === ' ') {
			if (x === 0 || y === 0 || x === display.width-1 || y === display.height-1) {
				level[x][y] = newTile('edge');
			} else {
				if (prng() < 2/3) level[x][y] = newTile('grass');
				else if (prng() < 2/3) level[x][y] = newTile('bush');
				else level[x][y] = newTile('tree');
			}
		}
	}
}

var asActor = function(obj) {
	var actor = Object.create({
		color: 'blind',
		delay: 100,
		attackDelay: 100,
		state: 'sleeping',
		act: act,
		move: move,
		sleeping: sleeping,
		attack: attack,
		hunting: hunting,
		haunt: haunt,
		gainHp: gainHp,
		die: die,
		flee: flee,
		hp: 2,
		maxHp: 2,
		dmg: 1,
		chance: 0,
		distribution: function() {
			return prng() < this.chance;
		}
	});
	for (var prop in obj) {
		actor[prop] = obj[prop];
	}
	return actor;
};

var animationQueue = [];
var animate = function() {
	return animationQueue[0] ? animationQueue.shift()(animate) : blank;
};

var canRun = function(dx, dy) {
	var char = level[player.x+dx][player.y+dy].char;
	return char === '#' || char === '+' || char === '/';
};

var player = asActor({
	char: '@',
	enterDoor: enterCorridor,
	exitDoor: exitDoor,
	hp: 12,
	maxHp: 12,
	description: 'This is you!'
});
player.act = function() {
	log();
	blinded:if (this.blinded) {
		this.blinded.duration--;
		if (this.blinded.duration < 0) {
			this.blinded = undefined;
			getById('blinded').style.display = 'none';
			break blinded;
		}
		for (var x = 0; x < display.width; x++) for (var y = 0; y < display.height; y++) {
			if (distance(this.x-x, this.y-y)-0.5 >
				[8, 5, 3, 2, 1, 1, 1, 1][this.blinded.duration]) {
				level[x][y].visible = false;
			}
		}
	}
	draw();
	animate();
	running:if (this.running) {
		if (visibleActorCount() > 1 || this.stopRunning) {
			this.running = false;
			this.stopRunning = false;
			break running;
		}
		var dx = this.running.x;
		var dy = this.running.y;
		if (canRun(dx+dy, dy+dx)) {
			return setTimeout(player.run.bind(this, dx+dy, dy+dx, dy, dx), 60);
		} else if (canRun(dx-dy, dy-dx)) {
			return setTimeout(player.run.bind(this, dx-dy, dy-dx, -dy, -dx), 60);
		} else if (canRun(dx, dy)) {
			return setTimeout(player.run.bind(this, dx, dy, dx, dy), 60);
		} else if (canRun(dy, dx)) {
			return setTimeout(player.run.bind(this, dy, dx, dy, dx), 60);
		} else if (canRun(dy, -dx)) {
			return setTimeout(player.run.bind(this, -dy, -dx, -dy, -dx), 60);
		} else {
			this.running = false;
		}
	}
	asleep:if (this.asleep && this.asleep > 0) {
		if (visibleActorCount() > 1) {
			this.alseep = 0;
			break asleep;
		}
		requestAnimationFrame(this.sleep.bind(this, false));
	}
	if (this.slowed) {
		this.slowed--;
		if (this.slowed === 0) {
			this.delay = 100;
			getById('slow').style.display = 'none';
		}
	}
	if (this.confused) {
		this.confused--;
		if (this.confused === 0) {
			getById('confused').style.display = 'none';
		}
	}
};
player.see = function() {
	for (var x = 0; x < display.width; x++) for (var y = 0; y < display.height; y++) {
		level[x][y].visible = false;
	}
	rlt.shadowcast(player.x, player.y, function(x, y) {
		return level[x][y].transparent;
	}, function(x, y) {
		level[x][y].visible = true;
	});
}
player.move = function(dx, dy) {
	this.lastx = this.x;
	this.lasty = this.y;
	if (dx === 0 && dy === 0) {
		this.see();
		schedule.add(this, this.delay);
		return schedule.advance().act();
	} else {
		if (this.confused && prng() < 0.5) {
			if (dx === 0)
				dx = prng() < 0.5 ? -1 : 1;
			else if (dy === 0)
				dy = prng() < 0.5 ? -1 : 1;
			else if (prng() < 0.5)
				dx = 0;
			else
				dy = 0;
		}
		if (level[this.x+dx][this.y+dy].actor) {
			this.see();
			return this.attack(level[this.x+dx][this.y+dy].actor);
		} else if (level[this.x+dx][this.y+dy].passable) {
			level[this.x][this.y].actor = undefined;
			if (level[this.x][this.y].char === '+' ||
				level[this.x][this.y].char === '/') {
				this.exitDoor(dx, dy);
			}
			this.x += dx;
			this.y += dy;
			level[this.x][this.y].actor = this;
			if (level[this.x][this.y].char === '+') {
				this.enterDoor();
			}
			this.see();
			schedule.add(this, this.delay);
			return schedule.advance().act();
		}
	}
};
player.run = function(dx, dy, newdx, newdy) {
	if (dx === 0 && dy === 0) {
		this.running = false;
		return;
	}
	if (typeof newdx === 'undefined') {
		this.running = {
			x: dx,
			y: dy
		};
	} else {
		this.running = {
			x: newdx,
			y: newdy
		};
	}
	return this.move(dx, dy);
};
player.sleep = function(fallAsleep) {
	this.asleep = fallAsleep ? 60 : this.asleep;
	this.asleep--;
	this.see();
	schedule.add(this, this.delay);
	return schedule.advance().act();
};
player.die = function() {
	draw();
	window.removeEventListener('keydown', gameKeydown);
	window.removeEventListener('keyup', gameKeyup);
	window.addEventListener('keydown', deadKeydown, false);
	animationQueue.push(lateLog.bind(null, 'You die... <br>Press Space to restart. '));
};

// the quest itme
var goal = {
	name: 'the ' + THIS + ' of ' + THAT,
	char: '±',
	color: 'blind',
	description: 'the ' + THIS + ' of ' + THAT,
	gainHp: function() {
		level[this.x][this.y].actor = player;
		level[player.x][player.y].actor = undefined;
		player.x = this.x;
		player.y = this.y;
		player.hp = 12;
		player.dmg = 2;
		getById('hp').innerHTML = player.hp;
		player.hasGoal = true;
		return 'pick up';
	},
	haunt: function() {
		console.log([this.x, this.y]);
	}
};

// number of molds to add next room
var molds = 0;

var monsters = {
	archer: asActor({
		name: 'archer',
		char: 'a',
		description: 'An archer that can shoot you from afar. ',
		attack: rangedAttack,
		hunting: rangedHunting,
		attackDelay: 200
	}),
	bat: asActor({ // haunt restricts player's fov
		name: 'bat',
		char: 'b',
		color: 'newpoop',
		hunting: batHunting,
		haunt: batHaunt,
		description: 'A bat. Haunt: restricts vision for 6 turns. '
	}),
	giant: asActor({
		name: 'giant',
		char: 'G',
		color: 'slimegreen',
		dmg: 2,
		hp: 5,
		maxHp: 5,
		attackDelay: 200,
		description: 'A giant. When it dies, you gain 6 health. ',
		die: function() {
			player.gainHp(6);
			this.dead = true;
			level[this.x][this.y].actor = undefined;
		}
	}),
	titan: asActor({ // blocks fov, destroys things once it reaches a doorway
		name: 'titan',
		char: 'T',
		delay: 200
	}),
	worm: asActor({ // unrestricted by walls, not killed by haunt
		name: 'worm',
		char: 'W',
		delay: 200
	}),
	ogre: asActor({
		name: 'ogre',
		char: 'O',
		color: 'zornskin',
		attackDelay: 200,
		dmg: 2,
		hp: 5,
		maxHp: 5,
		hunting: lateHunting,
		haunt: function() {
			this.dead = true;
			level[this.x][this.y].actor = undefined;
			player.slowed = 4;
			player.delay = 200;
			getById('slow').style.display = 'block';
		},
		description: 'A ogre. It aims for the space you were in last turn. ',
		chance: 0.5
	}),
	dwarf: asActor({
		name: 'dwarf',
		char: 'd',
		color: 'blaze',
		hunting: drunkHunting,
		haunt: dwarfHaunt,
		description: 'A drunk dwarf. Haunt: you are confused. ',
		chance: 1
	}),
	mold: asActor({
		name: 'mold',
		char: 'm',
		sleeping: moldSleeping,
		die: function() {
			this.dead = true;
			level[this.x][this.y].actor = undefined;
			molds--;
		},
		description: 'An immobile mold. Haunt: spawn 2 molds in the next room. '
	})
};
var undiscovered = [
	'bat',
	'giant',
	'archer',
	'mold',
	'dwarf',
	'ogre'
];
var discovered = [];
var currentRoom;
var progress = 0;

var updateDiscovered = function() {
	if (discovered.length === 0 || undiscovered.length > 1 && prng() < 2/3) {
		var index = Math.round(prng() * 5/6);
		discovered.push(undiscovered.splice(index, 1)[0]);
	} else if (undiscovered.length === 1) {
		discovered.push(undiscovered.pop());
	}
};

// maps from character to sprite location
var char2spriteX = {
	' ': 0,
	'.': 1,
	'@': 6,
	'#': 3,
	'┌': 9,
	'└': 9,
	'┐': 11,
	'┘': 11,
	'─': 10,
	'│': 10,
	'+': 12,
	'/': 0,
	'b': 1,
	'r': 4
};
var char2spriteY = {
	' ': 4,
	'.': 4,
	'@': 4,
	'#': 4,
	'┌': 4,
	'└': 5,
	'┐': 4,
	'┘': 5,
	'─': 4,
	'│': 5,
	'+': 4,
	'/': 5,
	'b': 2,
	'r': 3
};

// define level
var level = [];
for (var x = 0; x < display.width; x++) {
	level[x] = [];
}

var draw = function() {
	for (var y = 0; y < display.height; y++) {
		var $row = display.element.childNodes[y];
		for (var x = 0; x < display.width; x++) {
			var $tile = $row.childNodes[x];
			var tile = level[x][y];
			if (tile.visible) {
				if (tile.actor && !tile.actor.dead)
					tile = tile.actor;
				if ($tile.innerHTML = tile.char)
					$tile.innerHTML = tile.char;
				$tile.style.color = colors[tile.color];
			} else {
				$tile.style.color = 'transparent';
			}
		}
 	}
};

var makeRoom = function(x, y, w, h) {
	var room = {
		x: x,
		y: y,
		w: w,
		h: h
	};
	for (var dx = 1; dx < w-1; dx++) {
		level[x+dx][y] = newTile('horizontal');
		level[x+dx][y+h-1] = newTile('horizontal');
		for (var dy = 1; dy < h-1; dy++) {
			level[x+dx][y+dy] = newTile('floor');
		}
	}
	for (var dy = 1; dy < h-1; dy++) {
		level[x][y+dy] = newTile('vertical');
		level[x+w-1][y+dy] = newTile('vertical');
	}
	level[x    ][y    ] = newTile('topLeft');
	level[x+w-1][y    ] = newTile('topRight');
	level[x    ][y+h-1] = newTile('bottomLeft');
	level[x+w-1][y+h-1] = newTile('bottomRight');
	for (var dx = 0; dx < w; dx++) for (var dy = 0; dy < h; dy++) {
		level[x+dx][y+dy].room = room;
	}
	return room;
};

var makeCorridor = function(a, b, type) {
	if (type === 'vertical') {
		var temp = a;
		a = a.y < b.y ? a : b;
		b = temp.y >= b.y ? temp : b;
		var ymid = rlt.random(a.y+1, b.y-1, prng);
		for (var y = a.y+1; y < ymid; y++) {
			level[a.x][y] = newTile('corridor');
		}
		for (var y = ymid+1; y < b.y; y++) {
			level[b.x][y] = newTile('corridor');
		}
		var xmin = Math.min(a.x, b.x);
		var xmax = Math.max(a.x, b.x);
		for (var x = xmin; x <= xmax; x++) {
			level[x][ymid] = newTile('corridor');
		}
	} else {
		var temp = a;
		a = a.x < b.x ? a : b;
		b = temp.x >= b.x ? temp : b;
		var xmid = rlt.random(a.x+1, b.x-1, prng);
		for (var x = a.x+1; x < xmid; x++) {
			level[x][a.y] = newTile('corridor');
		}
		for (var x = xmid+1; x < b.x; x++) {
			level[x][b.y] = newTile('corridor');
		}
		var ymin = Math.min(a.y, b.y);
		var ymax = Math.max(a.y, b.y);
		for (var y = ymin; y <= ymax; y++) {
			level[xmid][y] = newTile('corridor');
		}
	}
};

var addDoors = function(x, y, w, h, chance) {
	var room = level[x][y].room;
	var doorTop    = false;
	var doorRight  = false;
	var doorBottom = false;
	var doorLeft   = false;
	chance = chance || {};
	chance.top    = chance.top    || 0;
	chance.right  = chance.right  || 0;
	chance.bottom = chance.bottom || 0;
	chance.left   = chance.left   || 0;
	for (var dx = 1; dx < w-1; dx++) {
		if (!doorTop && prng() < chance.top * dx / (w-2)) {
			level[x+dx][y] = newTile('door');
			level[x+dx][y].room = room;
			doorTop = {x: x+dx, y: y};
		}
		if (!doorBottom && prng() < chance.bottom * dx / (w-2)) {
			level[x+dx][y+h-1] = newTile('door');
			level[x+dx][y+h-1].room = room;
			doorBottom = {x: x+dx, y: y+h-1};
		}
	}
	for (var dy = 1; dy < h-1; dy++) {
		if (!doorLeft && prng() < chance.left * dy / (h-2)) {
			level[x][y+dy] = newTile('door');
			level[x][y+dy].room = room;
			doorLeft = {x: x, y: y+dy};
		}
		if (!doorRight && prng() < chance.right * dy / (h-2)) {
			level[x+w-1][y+dy] = newTile('door');
			level[x+w-1][y+dy].room = room;
			doorRight = {x: x+w-1, y: y+dy};
		}
	}
	return {
		top: doorTop,
		bottom: doorBottom,
		left: doorLeft,
		right: doorRight
	};
};

var addMonsters = function(room) {
	if (discovered.length === 0) {
		return;
	}
	molds *= 2;
	for (var i = 0; i < molds; i++) {
		var monster = Object.create(monsters.mold);
		var x = 0;
		var y = 0;
		while (!level[x][y].passable || level[x][y].actor) {
			x = rlt.random(room.x+1, room.x+room.w-1, prng);
			y = rlt.random(room.y+1, room.y+room.h-1, prng);
		}
		monster.x = x;
		monster.y = y;
		level[x][y].actor = monster;
		schedule.add(monster, 1);
	}
	var n = prng();
	var monsterCount;
	if (n < 0.2) monsterCount = 3;
	else if (n < 0.7) monsterCount = 2;
	else if (n < 0.9) monsterCount = 1;
	else if (player.hasGoal) monsterCount = 4;
	else monsterCount = 0;
	while (monsterCount--) {
		var i = Math.floor(discovered.length * prng());
		var monster = Object.create(monsters[discovered[i]]);
		if (monster.name === 'mold') {
			molds++;
		}
		var x = 0;
		var y = 0;
		while (!level[x][y].passable || level[x][y].actor) {
			x = rlt.random(room.x+1, room.x+room.w-1, prng);
			y = rlt.random(room.y+1, room.y+room.h-1, prng);
		}
		monster.x = x;
		monster.y = y;
		level[x][y].actor = monster;
		schedule.add(monster, 1);
	}
};

// start game
var start = function() {
	for (var x = 0; x < display.width; x++) for (var y = 0; y < display.height; y++) {
		level[x][y] = newTile('empty');
	}

	currentRoom = makeRoom(26, 11, 7, 7);
	addDoors(26, 11, 7, 7, {
		top: 1,
		right: 1,
		bottom: 1,
		left: 1
	});

	updateDiscovered();

	player.x = rlt.random(27, 31, prng);
	player.y = rlt.random(12, 16, prng);
	level[player.x][player.y].actor = player;

	player.see();

	schedule = rlt.Schedule();
	schedule.add(player, 0);
	schedule.advance().act();
};

// player input
var keyCodes = {
	'13': 'Enter',
    '27': 'Escape',
    '32': ' ',
    '37': 'ArrowLeft',
    '38': 'ArrowUp',
    '39': 'ArrowRight',
    '40': 'ArrowDown',
    '65': 'a',
    '66': 'b',
    '67': 'c',
    '68': 'd',
    '69': 'e',
    '70': 'f',
    '71': 'g',
    '72': 'h',
    '73': 'i',
    '74': 'j',
    '75': 'k',
    '76': 'l',
    '77': 'm',
    '78': 'n',
    '79': 'o',
    '80': 'p',
    '81': 'q',
    '82': 'r',
    '83': 's',
    '84': 't',
    '85': 'u',
    '86': 'v',
    '87': 'w',
    '88': 'x',
    '89': 'y',
    '90': 'z',
    '96': '0',
    '97': '1',
    '98': '2',
    '99': '3',
    '100': '4',
    '101': '5',
    '102': '6',
    '103': '7',
    '104': '8',
    '105': '9',
    '190': '.',
    '191': '/'
};
var inputState = {
	pressed: '',
	movedDiagonally: false
};
var directionPressed = function(mode, key, callback) {
    'use strict';
    if (key === '1' || key === '!') {
        callback.call(player, -1, 1);
    }
    else if (key === '2' || key === '@') {
        callback.call(player, 0, 1);
    }
    else if (key === '3' || key === '#') {
        callback.call(player, 1, 1);
    }
    else if (key === '4' || key === '$') {
        callback.call(player, -1, 0);
    }
    else if (key === '5' || key === '%' || key === 'z') {
        callback.call(player, 0, 0);
    }
    else if (key === '6' || key === '^') {
        callback.call(player, 1, 0);
    }
    else if (key === '7' || key === '&') {
        callback.call(player, -1, -1);
    }
    else if (key === '8' || key === '*') {
        callback.call(player, 0, -1);
    }
    else if (key === '9' || key === '(') {
        callback.call(player, 1, -1);
    }

    else if (key === 'Up' || key === 'ArrowUp') {
        if (mode.pressed === '') {
                mode.pressed = 'up';
        } else if (mode.pressed === 'left') {
                mode.movedDiagonally = true;
                callback.call(player, -1, -1);
        } else if (mode.pressed === 'right') {
                mode.movedDiagonally = true;
                callback.call(player, 1, -1);
        } else if (mode.pressed === 'down') {
                mode.movedDiagonally = true;
        }
    }
    else if (key === 'Left' || key === 'ArrowLeft') {
        if (mode.pressed === '') {
                mode.pressed = 'left';
        } else if (mode.pressed === 'up') {
                mode.movedDiagonally = true;
                callback.call(player, -1, -1);
        } else if (mode.pressed === 'down') {
                mode.movedDiagonally = true;
                callback.call(player, -1, 1);
        } else if (mode.pressed === 'right') {
                mode.movedDiagonally = true;
        }
    }
    else if (key === 'Down' || key === 'ArrowDown') {
        if (mode.pressed === '') {
                mode.pressed = 'down';
        } else if (mode.pressed === 'left') {
                mode.movedDiagonally = true;
                callback.call(player, -1, 1);
        } else if (mode.pressed === 'right') {
                mode.movedDiagonally = true;
                callback.call(player, 1, 1);
        } else if (mode.pressed === 'up') {
                mode.movedDiagonally = true;
        }
    }
    else if (key === 'Right' || key === 'ArrowRight') {
        if (mode.pressed === '') {
                mode.pressed = 'right';
        } else if (mode.pressed === 'up') {
                mode.movedDiagonally = true;
                callback.call(player, 1, -1);
        } else if (mode.pressed === 'down') {
                mode.movedDiagonally = true;
                callback.call(player, 1, 1);
        } else if (mode.pressed === 'left') {
                mode.movedDiagonally = true;
        }
    }
};
var directionReleased = function(mode, key, callback) {
    'use strict';
    if (mode.pressed === 'up' && (key === 'Up' || key === 'ArrowUp')) {
        mode.pressed = '';
        if (!mode.movedDiagonally) {
                callback.call(player, 0, -1);
        }
        mode.movedDiagonally = false;
    }
    else if (mode.pressed === 'left' && (key === 'Left' || key === 'ArrowLeft')) {
        mode.pressed = '';
        if (!mode.movedDiagonally) {
                callback.call(player, -1, 0);
        }
        mode.movedDiagonally = false;
    }
    else if (mode.pressed === 'down' && (key === 'Down' || key === 'ArrowDown')) {
        mode.pressed = '';
        if (!mode.movedDiagonally) {
                callback.call(player, 0, 1);
        }
        mode.movedDiagonally = false;
    }
    else if (mode.pressed === 'right' && (key === 'Right' || key === 'ArrowRight')) {
        mode.pressed = '';
        if (!mode.movedDiagonally) {
                callback.call(player, 1, 0);
        }
        mode.movedDiagonally = false;
    }
};
var gameKeydown = function(e) {
	try {
		player.asleep = 0;
		if (player.running)
			player.stopRunning = true;
		var key = keyCodes[e.keyCode] || e.key;
		var move = e.shiftKey ? player.run : player.move;
		if (key === '%' || key === 'Z' ||
			e.shiftKey && key === '5' ||
			e.shiftKey && key === 'z') {
			move = player.sleep.bind(player, true);
		}
		directionPressed(inputState, key, move);
		if (key === '?' || key === '/') {
			getById('help').style.display = 'block';
			window.removeEventListener('keydown', gameKeydown);
			window.removeEventListener('keyup', gameKeyup);
			window.addEventListener('keydown', helpKeydown, false);
		}
	} catch (ex) {
		console.log(ex);
	}
};
var gameKeyup = function(e) {
	try {
		var key = keyCodes[e.keyCode] || e.key;
		var move = e.shiftKey ? player.run : player.move;
		directionReleased(inputState, key, move);
	} catch (ex) {
		console.log(ex);
	}
};
var helpKeydown = function(e) {
	var key = keyCodes[e.keyCode] || e.key;
	if (key === 'Escape' || key === '?' || key === '/') {
		getById('help').style.display = 'none';
		window.removeEventListener('keydown', helpKeydown);
		window.addEventListener('keydown', gameKeydown, false);
		window.addEventListener('keyup', gameKeyup, false);
	}
};
var helpClick = function(e) {
	getById('help').style.display = 'block';
	window.removeEventListener('keydown', gameKeydown);
	window.removeEventListener('keyup', gameKeyup);
	window.addEventListener('keydown', helpKeydown, false);
}
var titleKeydown = function() {
	getById('title').style.display = 'none';
	window.removeEventListener('keydown', titleKeydown);
	window.addEventListener('keydown', gameKeydown, false);
	window.addEventListener('keyup', gameKeyup, false);
};
window.addEventListener('keydown', titleKeydown, false);

var deadKeydown = function(e) {
	var key = keyCodes[e.keyCode] || e.key;
	if (key === 'Enter' || key === ' ') {
		location.reload(false);
	}
};

// descriptions
var mouseenter = function(x, y, e) {
	var tile = level[x][y];
	if (tile.visible && tile.actor) {
		tempLog(tile.actor.description);
	} else if (tile.visible && tile.description) {
		tempLog(tile.description);
	} else {
		revertLog();
	}
};
for (var y = 0; y < display.element.childNodes.length; y++) {
	var row = display.element.childNodes[y];
	for (var x = 0; x < row.childNodes.length; x++) {
		var tile = row.childNodes[x];
		tile.addEventListener('mouseenter', mouseenter.bind(tile, x, y), false);
	}
}
display.element.addEventListener('mouseleave', revertLog, false);

getById('blinded').addEventListener('mouseenter', tempLog.bind(null, 'Your vision is limited because of a bat haunting you. '), false);
getById('blinded').addEventListener('mouseleave', revertLog, false);
getById('confused').addEventListener('mouseenter', tempLog.bind(null, 'You sometimes move drunkenly because of a dwarf haunting you. '), false);
getById('confused').addEventListener('mouseleave', revertLog, false);
getById('slow').addEventListener('mouseenter', tempLog.bind(null, 'You move twice as slowly because of an ogre haunting you. '), false);
getById('slow').addEventListener('mouseleave', revertLog, false);

start();
