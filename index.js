// Class definations
class Game {
  constructor(width, height, element, enemyDefeatLine) {
    this.height = height;
    this.width = width;
    this.context = element.getContext("2d");
    this.enemyDefeatLine = enemyDefeatLine;
    this.enemies = [];
    this.enemyInterval = 2000;
    this.enemyTimer = 0;
    this.score = 0;
  }
  #addEnemy() {
    this.enemies.push(new Enemy(this, 20, Math.random() * 30 + 30));
  }
  update(deltaTime) {
    if (this.enemyTimer > this.enemyInterval) {
      this.#addEnemy();
      this.enemyTimer = 0;
    } else {
      this.enemyTimer = this.enemyTimer + deltaTime;
    }
    this.enemies = this.enemies.filter((object) => !object.markedForDeletion);
    this.enemies.forEach((object) => object.update(deltaTime));
  }
  draw() {
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.width, this.height);
    this.enemies.forEach((object) => {
      object.draw();
    });
  }
}
class Enemy {
  constructor(game, width, height) {
    this.game = game; // to access game properties inside enemy
    this.xpos = this.game.width;
    this.ypos = this.game.height - height;
    this.xvel = Math.random() * 0.02 + 0.1;
    this.width = width;
    this.height = height;
    this.markedForDeletion = false;
    this.hasBeenJumped = false;
  }
  draw() {
    this.game.context.fillStyle = "red";
    this.game.context.fillRect(this.xpos, this.ypos, this.width, this.height);
  }
  update(deltaTime) {
    this.xpos = this.xpos - this.xvel * deltaTime;
    if (this.xpos < 0 - this.width) {
      this.markedForDeletion = true;
    }
    if (!this.hasBeenJumped && this.xpos < this.game.enemyDefeatLine) {
      this.hasBeenJumped = true;
      this.game.score++;
    }
  }
}
class Player {
  constructor(game, Xpostion) {
    this.game = game;
    this.width = 20;
    this.height = 30;
    this.xpos = Xpostion;
    this.ypos = this.game.height - this.height;
    this.yvel = 0.3;
    this.isJumping = false;
  }
  update(deltaTime) {
    const jumpHeight = 140;
    if (this.isJumping && this.ypos > this.game.height - jumpHeight) {
      this.ypos -= this.yvel * deltaTime;
    }
    if (this.ypos <= this.game.height - jumpHeight) {
      this.isJumping = false;
    }
  }
  draw() {
    this.game.context.fillStyle = "green";
    this.game.context.fillRect(this.xpos, this.ypos, this.width, this.height);
  }
  jump() {
    this.isJumping = true;
  }
  falling() {
    this.isJumping = false;
  }
}

const PLAYER_SPAWN_POSITION = 30;
//frame is already defiend using id in HTML
frame.width = 300;
frame.height = 300;
let GAME_INSTANCE;
let PLAYER_INSTANCE;

// helper functions
const gravity = (deltaTime) => {
  if (PLAYER_INSTANCE.ypos < GAME_INSTANCE.height - PLAYER_INSTANCE.height) {
    PLAYER_INSTANCE.ypos += deltaTime * 0.1;
  }
};
const displayScore = () => {
  GAME_INSTANCE.context.fillStyle = "white";
  GAME_INSTANCE.context.font = "20px serif";
  GAME_INSTANCE.context.fillText(`Score: ${GAME_INSTANCE.score}`, 10, 20);
};
const isCollision = () => {
  const playerLeft = PLAYER_INSTANCE.xpos;
  const playerRight = PLAYER_INSTANCE.xpos + PLAYER_INSTANCE.width;
  const playerBottom = PLAYER_INSTANCE.ypos + PLAYER_INSTANCE.height;
  let flag = false;
  GAME_INSTANCE.enemies.forEach((enemy) => {
    const enemyLeft = enemy.xpos;
    const enemyRight = enemy.xpos + enemy.width;
    const enemyTop = enemy.ypos;
    if (
      enemyLeft < playerRight &&
      enemyRight > playerLeft &&
      enemyTop < playerBottom
    ) {
      flag = true;
    }
  });
  return flag;
};
function Animate(timeStamp) {
  let deltaTime = timeStamp - lastTimeStamp;
  lastTimeStamp = timeStamp;
  GAME_INSTANCE.context.clearRect(
    0,
    0,
    GAME_INSTANCE.width,
    GAME_INSTANCE.height
  );
  if (isNaN(deltaTime)) {
    deltaTime = 16;
  }
  GAME_INSTANCE.update(deltaTime);
  PLAYER_INSTANCE.update(deltaTime);
  GAME_INSTANCE.draw();
  PLAYER_INSTANCE.draw();
  PLAYER_INSTANCE.draw();
  displayScore();
  if (isCollision()) {
    gameEnd();
    return;
  }
  gravity(deltaTime);
  score = GAME_INSTANCE.score;
  // recursive call to Animate() creating game loop
  requestAnimationFrame(Animate);
}

const gameStart = () => {
  GAME_INSTANCE = new Game(300, 300, frame, PLAYER_SPAWN_POSITION);
  lastTimeStamp = 0;
  PLAYER_INSTANCE = new Player(GAME_INSTANCE, PLAYER_SPAWN_POSITION);

  const handleJumpPress = (e) => {
    if (
      (e.key == " " || e.key == "ArrowUp") &&
      PLAYER_INSTANCE.ypos >= GAME_INSTANCE.height - PLAYER_INSTANCE.height
    ) {
      PLAYER_INSTANCE.isJumping = true;
    }
  };
  // eventListener to listen for Jump event
  document.body.addEventListener("keydown", handleJumpPress);
  document.body.addEventListener("touchstart", () =>
    handleJumpPress((e = { key: " " }))
  );

  Animate();
};

const gameEnd = () => {
  scoreElement.innerText = `Score: ${GAME_INSTANCE.score}`;
  info.classList.remove("hide");
  document.addEventListener("keydown", handleStartPress, { once: true });
  document.addEventListener("touchstart", handleStartPress, { once: true });
};

// eventListener to listen for GameStart event
const handleStartPress = () => {
  info.classList.add("hide");
  gameStart();
};
document.addEventListener("keydown", handleStartPress, { once: true });
document.addEventListener("touchstart", handleStartPress, { once: true });
