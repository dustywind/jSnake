/**
 *	Written by Nguyen, Dustin
 *	Feel free to use the code
*/

var Snake = null;

$(function() {

	Snake = new function() {

		this.SnakeBody = function(x, y) {
			this.x = x, this.y = y;
		};

		this.Apple = function(x, y) {
			this.x = x, this.y = y;
		};

		this.getRandomInt = function(min, max) {
			return Math.floor(Math.random() * (max - min) + min);
		};

		var gamefield = null;
		var x = 0, y = 0;
		var field = null;

		var loop = null;
		var paused = false;

        // UPDATE --> speed in milliseconds
		var UPDATE = 150;

		var snake = [];
		var apple = null;

		var eaten = [];

		// keycodes from $(window).keypress()
		var DIRECTION = {	LEFT:	37,
							UP:		38,
							RIGHT:	39,
							DOWN:	40,
							isDirection: function(key) {
								switch(key) {
									case DIRECTION.LEFT:
									case DIRECTION.UP:
									case DIRECTION.RIGHT:
									case DIRECTION.DOWN:
										return true;
								}
								return false;
							}
						};
		var direction = DIRECTION.DOWN;
		var courseCorrection = null;
		
		var CONTROL =	{	ESC:	27,
							isControl:	function(key) {
								switch(key) {
									case CONTROL.ESC:
									case CONTROL.SPACE:
										return true;
								}
								return false;
							}
						};

		var GROUND_BLOCK = function() { return $('<div class="ground snakeField"></div>'); }
		var SNAKE_BLOCK = function() { return $('<div class="snake snakeField"></div>'); }
		var APPLE_BLOCK = function() { return $('<div class="apple snakeField"></div>'); }

		// get the reference to a DOM-Obj
		var toGroundBlock = function(jqObj) {
			// remove the other possible classes
			if(jqObj.hasClass('snakeField') == false)
				jqObj.addClass('snakeField');
			if(jqObj.hasClass('ground'))
				return jqObj;
			return jqObj.removeClass('snake').removeClass('apple').addClass('ground');
		};

		var toSnakeBlock = function(jqObj) {
			if(jqObj.hasClass('snakeField') == false)
				jqObj.addClass('snakeField');
			if(jqObj.hasClass('snake'))
				return jqObj;
			return jqObj.removeClass('ground').removeClass('apple').addClass('snake');
		};
		var toAppleBlock = function(jqObj) {
			if(jqObj.hasClass('snakeField') == false)
				jqObj.addClass('snakeField');
			if(jqObj.hasClass('apple'))
				return jqObj;
			return jqObj.removeClass('ground').removeClass('snake').addClass('apple');
		};

		var draw = function() {
			// reset the field
			for(var i = 0; i < x; i++)
				for(var k = 0; k < y; k++)
					toGroundBlock(field[i][k]);

			// insert the snake
			for(var i = 0; i < snake.length; i++)
				toSnakeBlock(field[snake[i].x][snake[i].y]);

			// insert the apple
			toAppleBlock(field[apple.x][apple.y]);
		};

		var spawnApple = function() {
			if(apple !== null && apple !== undefined)
				return apple;	// nothing to do yet
			// otherwise:
			// find a free (random) space
			var rx = 0, ry = 0;
			var next;
			do {
				next = false
				rx = Snake.getRandomInt(0, x);
				ry = Snake.getRandomInt(0, y);

				for(var i = 0; i < snake.length; i++)
					if(snake[i].x === rx && snake[i].y === ry)
						next = true;
			} while(next);
			return new Snake.Apple(rx, ry);
		};

		var eat = function() {
			eaten.push( { 'iterations': snake.length, 'apple': apple } );
			apple = null;
			apple = spawnApple();
		};

		var grow = function(ax, ay) {
			snake.push(new Snake.SnakeBody(ax, ay));
		}

		var stomach = function() {
			var tmp = []
			for(var i = 0; i < eaten.length; i++) {
				if(eaten[i].iterations >= 0) {
					eaten[i].iterations--;
					tmp.push(eaten[i]);
				}
			}

			eaten = tmp;

			for(var i = 0; i < eaten.length; i++) {
				if(eaten[i].iterations < 0) {
					grow(eaten[i].apple.x, eaten[i].apple.y);
				}
			}
		};

		var move = function() {

			if(courseCorrection !== null) {
				// if the new direction is the opposit of the current,
				// then ignore it. Otherwise the snake will crawl in herself
				if (Math.abs( courseCorrection - direction ) === 2)
					;	// nothing
				else	// set the new direction
					direction = courseCorrection;
			}

			// get the head
			var sHead = snake.shift();
			// var get the tail
			var sTail = snake.pop();
			// move the last element of the list to the head
			// (if there is a last element)
			if( sTail !== undefined) {
				sTail.x = sHead.x;
				sTail.y = sHead.y;
				snake.unshift(sTail);
			}
			// move the head towards the given direction
			switch(direction) {
				case DIRECTION.UP:
					sHead.y = sHead.y -1;
					if(sHead.y < 0)
						sHead.y = y -1;
					break;
				case DIRECTION.RIGHT:
					sHead.x = sHead.x +1;
					if(sHead.x >= x)
						sHead.x = 0;
					break;
				case DIRECTION.DOWN:
					sHead.y = sHead.y +1;
					if(sHead.y >= y)
						sHead.y = 0;
					break;
				case DIRECTION.LEFT:
					sHead.x = sHead.x -1;
					if(sHead.x < 0)
						sHead.x = x -1;
					break;
			}
			// did the snake hit herself?
			for( var i = 0; i < snake.length; i++) 
				if(sHead.x === snake[i].x && sHead.y  === snake[i].y)
					throw 'DEAD';

			// add the head to the tail (again)
			snake.unshift(sHead);

			// or maybe even an apple? :D
			if(sHead.x === apple.x && sHead.y === apple.y)
				eat();
		};

		var gameOver = function() {
			clearInterval(loop);
			alert('You failed!\nYour score: ' + (snake.length + eaten.length) );
		};

		var mainloop = function() {
			try{
				move();
				stomach();
				draw();
			} catch(e) {
				gameOver();
			}
		};

		this.init = function(xp, yp, gamefieldp) {
			x = xp;
			y = yp;
			gamefield = $('#' + gamefieldp);

			gamefield.css('display', 'block');

			// create the field
			field = new Array(x);
			for(var i = 0; i < x; i++) {
				field[i] = new Array(y);
				for(var k = 0; k < y; k++) {
					field[i][k] = $('<div class="snakeField"></div>')
				}
			}

			// draw everything
			for(var i = 0; i < x; i++) {
				var column = $('<div class="column"></div>');
				for(var k = 0; k < y; k++)
					column.append(field[i][k]);
				gamefield.append(column);
			}

			// initialize the snake
			// push the snake-head
			snake.push( new Snake.SnakeBody(1, 0),
						new Snake.SnakeBody(0, 0) );

			// init the apple
			apple = spawnApple();

			// set a timer, which calls continuously a function
			loop = setInterval(mainloop, UPDATE);
			
			// set a listener, to get the keyboard input
			$(document).keydown(function(keydownEvent) {
				var key = keydownEvent.keyCode;
				// shall the snake move?
				if( DIRECTION.isDirection(key) )
					courseCorrection = key;
				// or stop its movement for a while
				if( CONTROL.isControl(key) ) {
					if(paused) {
						paused = false;
						loop = setInterval(mainloop, UPDATE);
					}
					else {
						paused = true;
						clearInterval(loop);
					}
				}
			});

			// draw everything
			draw();
		};

	};
});
