console.log('[JoaoMello] Flappy Bird')

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

let stopped = false		// jogo parado -> jogador perdeu
let currentScreen = {}
let framesCount = 0
let score = 0
let highScore = 0

// efeitos sonoros
const Sounds = {
	COLISION: new Audio(),
	FALL: new Audio(),
	JUMP: new Audio(),
	POINT: new Audio()
}

// sprites dos objetos
const Sprites = {
	BACKGROUND: new Image(),
	BIRD: {
		UP: new Image(),
		MIDDLE: new Image(),
		DOWN: new Image()
	},
	COIN: {
		COOPER: new Image(),
		GOLD: new Image(),
		SILVER: new Image(),
		WHITE: new Image(),
	},
	GAME_OVER: new Image(),
	GET_READY: new Image(),
	GROUND: new Image(),
	PIPES: {
		BOTTOM: new Image(),
		TOP: new Image()
	}
}

// objetos da tela
const background = {
	width: 275,
	height: 204,
	x: 0,
	y: canvas.height - 204,

	draw() {
		context.fillStyle = '#70c5ce'	// preenche com uma cor
		context.fillRect(0, 0, canvas.width, canvas.height)

		context.drawImage(
			Sprites.BACKGROUND,
			this.x, this.y,
			this.width, this.height
		)

		context.drawImage(
			Sprites.BACKGROUND,
			(this.x + this.width), this.y,
			this.width, this.height
		)
	}
}

const getReadyMessage = {
	width: 174,
	height: 152,
	x: (canvas.width - 174) / 2,
	y: 50,

	draw() {
		context.drawImage(
			Sprites.GET_READY,
			this.x, this.y,
			this.width, this.height,
		)
	}
}

const ground = {
	width: 224,
	height: 112,
	x: 0,
	y: canvas.height - 112,

	init() {
		this.x = 0
		this.y = canvas.height - 112
	},

	draw() {
		context.drawImage(
			Sprites.GROUND,
			this.x, this.y,
			this.width, this.height
		)

		context.drawImage(
			Sprites.GROUND,
			(this.x + this.width), this.y,
			this.width, this.height
		)
	},

	update() {
		this.x -= 1
		this.x %= (this.width / 2)
	}
}

const pipes = {
	width: 52,
	height: 400,
	gap: 90,
	pairs: [],	// pares de canos

	init() {
		this.pairs = []
	},

	draw() {
		this.pairs.forEach((pair)=>{
			const topPipe = { x: pair.x, y: pair.y }
			context.drawImage(
				Sprites.PIPES.TOP,
				topPipe.x, topPipe.y,
				this.width, this.height
			)

			const bottomPipe = {
				x: pair.x, 
				y: this.height + this.gap + pair.y
			}
			context.drawImage(
				Sprites.PIPES.BOTTOM,
				bottomPipe.x, bottomPipe.y,
				this.width, this.height
			)

			pair.gap = {
				topLimit: topPipe.y + this.height,
				bottomLimit: bottomPipe.y
			}
		})
	},

	update() {
		if(framesCount % 100 == 0) 
			this.pairs.push({
				x: canvas.width,
				y: (-150) * (Math.random() + 1)
			})

		this.pairs.forEach((pair)=>{
			pair.x -= 2	// movementa 2px para a esquerda

			if(flappyBird.pipeColision(pair)) {
				Sounds.COLISION.play()
				stopped = true
				setTimeout(()=>{
					switchScreen(screens.GAME_OVER)
				}, 500)
				return
			}

			if(pair.x <= -this.width)
				this.pairs.shift()
		})
	}
}

const flappyBird = {
	width: 33,
	height: 24,
	x: 10,
	y: 50,
	speed: 0,		// velocidade atual
	gravity: 0.2,	// aceleracao para baixo
	jumpValue: 4.6,	// aceleracao para cima
	sprites: [Sprites.BIRD.UP, Sprites.BIRD.MIDDLE, Sprites.BIRD.DOWN],

	init() {
		this.x = 10
		this.y = 50
		this.speed = 0
	},

	draw() {
		let index = Math.floor(framesCount / 5) % 3
		context.drawImage(
			this.sprites[index],
			this.x, this.y,
			this.width, this.height,
		)
	},

	update() {
		if(this.groundColision()) {
			Sounds.COLISION.play()
			stopped = true
			setTimeout(()=>{
				switchScreen(screens.GAME_OVER)
			}, 500)
			return
		}

		this.speed += this.gravity
		this.y += this.speed
	},

	jump() {
		this.speed = -this.jumpValue
		Sounds.JUMP.play()
	},

	groundColision() {
		return (this.y + this.height > ground.y)
	},

	pipeColision(pair) {
		const H_ERROR = 2	// tolerancia de erro vertical
		const V_ERROR = 2	// tolerancia de erro vertical
		if(this.x + this.width - H_ERROR >= pair.x && this.x + H_ERROR <= pair.x + pipes.width) {
			if(this.y + V_ERROR <= pair.gap.topLimit)
				return true			
			if(this.y + this.height - V_ERROR >= pair.gap.bottomLimit)
				return true			
		}

		if(this.x > pair.x + pipes.width) {	// passou do cano
			Sounds.POINT.play()
			score += 0.2
		}

		return false
	}
}

const gameOverMessage = {
	width: 226,
	height: 200,
	x: (canvas.width - 226) / 2,
	y: 50,

	draw() {
		context.drawImage(
			Sprites.GAME_OVER,
			this.x, this.y,
			this.width, this.height
		)
		
		coin.draw(score)
	},
}

const coin = {
	width: 44,
	height: 44,
	x: 26 + gameOverMessage.x,
	y: 86 + gameOverMessage.y,
	
	draw(point) {
		point /= 5
		// 1 - 5
		sprite = Sprites.COIN.GOLD
		console.log(score)
		if(point <= 5)
			sprite = Sprites.COIN.WHITE
		else if(point <= 10)
			sprite = Sprites.COIN.COOPER
		else if(point <= 20)
			sprite = Sprites.COIN.SILVER
		
		context.drawImage(
			sprite,
			this.x, this.y,
			this.width, this.height
		)
	}
}

const screens = {
	START: {
		init() {
			ground.init()
			pipes.init()
			flappyBird.init()
			highScore = Math.max(highScore, score)
			score = 0
		},

		draw() {
			background.draw()
			ground.draw()
			flappyBird.draw()
			getReadyMessage.draw()
		},
		
		update() {
			ground.update()
		},
		
		click() {
			switchScreen(screens.GAME)
		}
	},
	
	GAME: {
		draw() {
			background.draw()
			pipes.draw()
			ground.draw()
			flappyBird.draw()
		},

		update() {
			flappyBird.update()
			ground.update()
			pipes.update()
		},

		click() {
			flappyBird.jump()
		}
	},

	GAME_OVER: {
		draw() {
			gameOverMessage.draw()
		},

		click() {
			stopped = false
			switchScreen(screens.START)
		}
	}
}

function initSounds() {
	Sounds.COLISION.src = 'sound/colision.wav'
	Sounds.FALL.src = 'sound/fall.wav'
	Sounds.JUMP.src = 'sound/jump.wav'
	Sounds.POINT.src = 'sound/point.wav'
}

function initSprites() {
	Sprites.BACKGROUND.src = 'images/background.png'
	
	Sprites.BIRD.UP.src = 'images/bird_up.png'
	Sprites.BIRD.MIDDLE.src = 'images/bird_middle.png'
	Sprites.BIRD.DOWN.src = 'images/bird_down.png'
	
	Sprites.COIN.COOPER.src = 'images/coin_cooper.png'
	Sprites.COIN.GOLD.src = 'images/coin_gold.png'
	Sprites.COIN.SILVER.src = 'images/coin_silver.png'
	Sprites.COIN.WHITE.src = 'images/coin_white.png'
	
	Sprites.GAME_OVER.src = 'images/game_over.png'
	Sprites.GET_READY.src = 'images/get_ready.png'
	Sprites.GROUND.src = 'images/ground.png'
	
	Sprites.PIPES.BOTTOM.src = 'images/pipe_bottom.png'
	Sprites.PIPES.TOP.src = 'images/pipe_top.png'
}

function switchScreen(newScreen) {
	currentScreen = newScreen
	if(currentScreen.init)
		currentScreen.init()
}

function loop() {
	currentScreen.draw()
	if(!stopped) {
		currentScreen.update()
	}

	framesCount++
	requestAnimationFrame(loop)
}

canvas.addEventListener('click', ()=>{
	if(currentScreen.click)
		currentScreen.click()
})

initSounds()
initSprites()

switchScreen(screens.START)
loop()