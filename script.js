console.log('[JoaoMello] Flappy Bird')

const hitSound = new Audio()
hitSound.src = "sound/hit.wav"

const sprites = new Image()
sprites.src = 'images/sprites.png'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

let currentScreen = {}

const vGlobal = {}

const background = {
	spriteX: 390,
	spriteY: 0,
	width: 275,
	height: 204,
	x: 0,
	y: canvas.height - 204,

	draw() {
		context.fillStyle = '#70c5ce'
		context.fillRect(0, 0, canvas.width, canvas.height)

		context.drawImage(
			sprites,
			background.spriteX, background.spriteY,
			background.width, background.height,
			background.x, background.y,
			background.width, background.height
		)

		context.drawImage(
			sprites,
			background.spriteX, background.spriteY,
			background.width, background.height,
			(background.x + background.width), background.y,
			background.width, background.height
		)
	}
}

const floor = {
	spriteX: 0,
	spriteY: 610,
	width: 224,
	height: 112,
	x: 0,
	y: canvas.height - 112,

	draw() {
		context.drawImage(
			sprites,
			floor.spriteX, floor.spriteY,
			floor.width, floor.height,
			floor.x, floor.y,
			floor.width, floor.height
		)

		context.drawImage(
			sprites,
			floor.spriteX, floor.spriteY,
			floor.width, floor.height,
			(floor.x + floor.width), floor.y,
			floor.width, floor.height
		)
	}
}

const getReadyMessage = {
	spriteX: 134,
	spriteY: 0,
	width: 174,
	height: 152,
	x: (canvas.width - 174) / 2,
	y: 50,

	draw() {
		context.drawImage(
			sprites,
			getReadyMessage.spriteX, getReadyMessage.spriteY, // Sprite X, Sprite Y
			getReadyMessage.width, getReadyMessage.height, // Tamanho do recorte na sprite
			getReadyMessage.x, getReadyMessage.y,
			getReadyMessage.width, getReadyMessage.height,
		)
	}
}

const screens = {
	START: {
		init() {
			vGlobal.flappyBird = newFlappyBird()
		},

		draw() {
			background.draw()
			floor.draw()
			vGlobal.flappyBird.draw()
			getReadyMessage.draw()
		},

		update() {
			
		},

		click() {
			switchScreen(screens.GAME)
		}
	},
	
	GAME: {
		draw() {
			background.draw()
			floor.draw()
			vGlobal.flappyBird.draw()
		},
		
		update() {
			vGlobal.flappyBird.update()
		},

		click() {
			vGlobal.flappyBird.jump()
		}
	}
}

function newFlappyBird() {
	const flappyBird = {
		spriteX: 0,
		spriteY: 0,
		width: 33,
		height: 24,
		x: 10,
		y: 50,
		speed: 0,
		gravity: 0.25,
		jumpValue: 4.6,
	
		draw() {
			context.drawImage(
				sprites,
				flappyBird.spriteX, flappyBird.spriteY, // Sprite X, Sprite Y
				flappyBird.width, flappyBird.height, // Tamanho do recorte na sprite
				flappyBird.x, flappyBird.y,
				flappyBird.width, flappyBird.height,
			)
		},
	
		update() {
			if(colision(flappyBird, floor)) {
				console.log('Fez colisão')
				hitSound.play()
				setTimeout(()=>{
					switchScreen(screens.START)
				}, 500)
				return
			}
	
			flappyBird.speed += flappyBird.gravity
			flappyBird.y += flappyBird.speed
		},
	
		jump() {
			flappyBird.speed = -flappyBird.jumpValue 
		}
	}

	return flappyBird
}

function colision(elem1, elem2) {
	return (elem1.y + elem1.height >= elem2.y)
}

function switchScreen(newScreen) {
	currentScreen = newScreen
	if(currentScreen.init)
	currentScreen.init()
}

function loop() {
	currentScreen.draw()
	currentScreen.update()
	
	requestAnimationFrame(loop)
}

window.addEventListener('click', ()=>{
	if(currentScreen.click)
		currentScreen.click()
})

switchScreen(screens.START)
loop()