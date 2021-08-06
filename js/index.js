"use strict";
class Snippet {
    constructor(fileName, size) {
        for (let i = 0; i < size; ++i)
            this.sound.push(Snippet.audio(fileName));
    }
    static sounds = [];
    static audio(src) {
        const a = new Audio(src);
        //a.volume = Sound.volume * (1 / Sound.maxVolume);
        Snippet.sounds.push(a);
        return a;
    }
    sound = [];
    count = 0;
    play() {
        this.sound[++this.count % this.sound.length].play();
    }
}
class Sound {
    static shipHit = new Snippet("./sounds/ship_hit.mp3", 6);
    static droneShoot = new Snippet("./sounds/drone_shoot.mp3", 12);
    static laserShoot = new Snippet("./sounds/Synth_Basic_Laser1_14.mp3", 6);
    static droneExplode = new Snippet("./sounds/explode1.mp3", 6);
    static shipBounce = new Snippet("./sounds/bounce.mp3", 2);
    static droneHit = new Snippet("./sounds/drone_hit.mp3", 8);
    static thrust = Snippet.audio("./sounds/thrust.mp3");
    static pulsate = Snippet.audio("./sounds/pulsate.mp3");
    static spinnerBounce = new Snippet("./sounds/spinner_bounce_6.mp3", 4);
    static spinnerExplode = new Snippet("./sounds/spinner_explode.mp3", 2);
    static shipExplode = Snippet.audio("./sounds/ship_blast_2.mp3");
    static mineExplode = new Snippet("./sounds/mine_explode_4.mp3", 6);
}
class GamePad {
    static isConnected = false;
    static current = null;
    static previous = null;
    static GamePad = (() => {
        addEventListener("gamepadconnected", (event) => {
            GamePad.current = navigator.getGamepads()[0];
            GamePad.previous = GamePad.current;
            GamePad.isConnected = true;
        });
        addEventListener("gamepaddisconnected", (event) => {
            GamePad.isConnected = false;
        });
    })();
    static update() {
        if (GamePad.isConnected) {
            GamePad.previous = GamePad.current;
            GamePad.current = navigator.getGamepads()[0];
        }
    }
    static isDown(button) {
        return GamePad.isConnected && GamePad.current.buttons[button].pressed;
    }
    static isPressed(button) {
        return (GamePad.isConnected &&
            GamePad.current.buttons[button].pressed &&
            !GamePad.previous.buttons[button].pressed);
    }
    static value(button) {
        if (!GamePad.isConnected)
            return 0;
        else
            return GamePad.current.buttons[button].value;
    }
    static get angle() {
        if (GamePad.isConnected) {
            const x = GamePad.current.axes[0];
            const y = GamePad.current.axes[1];
            if (!(x > -0.15 && x < 0.15 && y > -0.15 && y < 0.15)) {
                const ang = Math.atan2(y, x);
                return ang;
            }
        }
        return null;
    }
}
class KeyState {
    isPressed;
    isReleased;
    constructor(isPressed, isReleased) {
        this.isPressed = isPressed;
        this.isReleased = isReleased;
    }
}
class Keyboard {
    static Keyboard = (() => {
        addEventListener("keydown", Keyboard.keyDown);
        addEventListener("keyup", Keyboard.keyUp);
    })();
    static state = {};
    static keyDown(event) {
        const state = Keyboard.state[event.code];
        if (state === undefined)
            Keyboard.state[event.code] = new KeyState(true, true);
        else
            state.isPressed = true;
    }
    static keyUp(event) {
        const state = Keyboard.state[event.code];
        state.isPressed = false;
        state.isReleased = true;
    }
    static isDown(key) {
        // returns true while the key is in the down position
        const state = Keyboard.state[key];
        if (state === undefined)
            return false;
        else
            return state.isPressed;
    }
    static isPressed(key) {
        // returns true only once when first depressed
        // must be released and re-pressed before returning true again
        const state = Keyboard.state[key];
        if (state === undefined)
            return false;
        if (state.isPressed && state.isReleased) {
            state.isReleased = false;
            return true;
        }
        else
            return false;
    }
}
class GameInput {
    static get isRotateRight() {
        return Keyboard.isDown("KeyX") || GamePad.isDown(15 /* RightJoyPad */);
    }
    static get isRotateLeft() {
        return Keyboard.isDown("KeyZ") || GamePad.isDown(14 /* LeftJoyPad */);
    }
    static get angle() {
        return 0;
    }
    static get isFire() {
        return Keyboard.isPressed("Enter") || GamePad.isPressed(1 /* Right */);
    }
    static get thrust() {
        if (Keyboard.isDown("ShiftRight"))
            return 1;
        else
            return GamePad.value(7 /* RightTrigger */);
    }
    static get isHyperSpace() {
        return Keyboard.isPressed("Space") || GamePad.isPressed(2 /* Left */);
    }
    static get isPaused() {
        return Keyboard.isPressed("KeyP") || GamePad.isPressed(9 /* Pause */);
    }
}
class Island {
    static position = null;
    static calculatePosition() {
        const canvasHeight = Game.Canvas.height;
        const canvasWidth = Game.Canvas.width;
        const x = canvasWidth * 0.3;
        const y = canvasHeight * 0.38;
        const width = canvasWidth * 0.4;
        const height = canvasHeight * 0.24;
        Island.position = {
            x,
            y,
            width,
            height,
            right: x + width,
            bottom: y + height,
            midX: canvasWidth / 2,
            midY: canvasHeight / 2,
        };
    }
    draw() {
        const height = Game.Canvas.height;
        const width = Game.Canvas.width;
        Game.View.strokeStyle = "white";
        Game.View.strokeRect(Island.position.x, Island.position.y, Island.position.width, Island.position.height);
        const damage = game.ship.damage < 0 ? 0 : game.ship.damage;
        const shieldRatio = damage / game.ship.initDamage;
        Game.View.strokeRect(Island.position.x + 20, Island.position.y + 50, 200, 20);
        Game.View.fillStyle = "rgba(255, 255, 255, 1)";
        Game.View.fillRect(Island.position.x + 20, Island.position.y + 50, shieldRatio * 200, 20);
        Game.View.font = "30px Lucida Console";
        Game.View.fillText(`SCORE ${game.ship.score}  SWARM ${Swarm.generation} (${game.swarm?.count})`, width * 0.32, height * 0.45);
    }
    isInside(point) {
        return (point.x >= Island.position.x &&
            point.x <= Island.position.right &&
            point.y >= Island.position.y &&
            point.y <= Island.position.bottom);
    }
}
class Ship {
    x = 50;
    y = 50;
    angle = 0.0;
    dx = 0;
    dy = 0;
    radius = 20;
    speed = 0;
    isAlive = true;
    score = 0;
    tip = null;
    initDamage = 800;
    damage = this.initDamage;
    static maxAngle = Math.PI * 2;
    shield = 0;
    hyperCount = 0;
    update(progress, counter) {
        if (!this.isAlive)
            return;
        const a = GamePad.angle;
        if (a != null)
            this.angle = a;
        const thrust = GameInput.thrust;
        for (let i = 0; i < thrust * 10; ++i)
            game.exhaust.push(new Thrust(thrust * 5 + 5));
        if (counter == 1) {
            if (this.hyperCount > 0)
                this.hyperCount -= 1;
            if (this.hyperCount == 20)
                this.shield = 20;
            if (GameInput.isFire && game.laserBolts.length < Game.maxLaserBolts)
                game.laserBolts.push(new LaserBolt());
            if (GameInput.isRotateLeft)
                this.angle -= 0.1;
            if (GameInput.isRotateRight)
                this.angle += 0.1;
            if (GameInput.isHyperSpace)
                this.hyperSpace();
            const thrustFactor = 0.1;
            if (thrust > 0) {
                this.dx += thrust * thrustFactor * Math.cos(this.angle);
                this.dy += thrust * thrustFactor * Math.sin(this.angle);
                Sound.thrust.volume = thrust;
                Sound.thrust.play();
            }
            else {
                // if (this.dx > 0.1) this.dx -= 0.1;
                // if (this.dx < -0.1) this.dx += 0.1;
                // if (this.dy > 0.1) this.dy -= 0.1;
                // if (this.dy < -0.1) this.dy += 0.1;
                // if (this.dx > 0 && this.dx <= 0.1) this.dx = 0;
                // if (this.dx < 0 && this.dx >= -0.1) this.dx = 0;
                // if (this.dy > 0 && this.dy <= 0.1) this.dy = 0;
                // if (this.dy < 0 && this.dy >= -0.1) this.dy = 0;
                Sound.thrust.pause();
            }
        }
        const maxSpeed = 6;
        if (this.dx < -maxSpeed)
            this.dx = -maxSpeed;
        if (this.dx > maxSpeed)
            this.dx = maxSpeed;
        if (this.dy < -maxSpeed)
            this.dy = -maxSpeed;
        if (this.dy > maxSpeed)
            this.dy = maxSpeed;
        // calculate coords at extreme edge of arena
        const minX = this.radius + 2;
        const minY = this.radius + 2;
        const maxX = Game.Canvas.width - this.radius - 6;
        const maxY = Game.Canvas.height - this.radius - 6;
        if (this.x < minX || this.x > maxX) {
            this.dx = -this.dx;
            Sound.shipBounce.play();
            this.shield = 8;
        }
        if (this.y < minY || this.y > maxY) {
            this.dy = -this.dy;
            Sound.shipBounce.play();
            this.shield = 8;
        }
        if (this.x > Island.position.x &&
            this.x < Island.position.right &&
            ((this.dy > 0 &&
                this.y + this.radius >= Island.position.y &&
                !(this.y + this.radius >= Island.position.bottom)) ||
                (this.dy < 0 &&
                    this.y - this.radius <= Island.position.bottom &&
                    !(this.y + this.radius <= Island.position.y)))) {
            this.dy = -this.dy;
            Sound.shipBounce.play();
            this.shield = 8;
        }
        if (this.y > Island.position.y &&
            this.y < Island.position.bottom &&
            ((this.dx > 0 &&
                this.x + this.radius >= Island.position.x &&
                !(this.x + this.radius >= Island.position.right)) ||
                (this.dx < 0 &&
                    this.x - this.radius <= Island.position.right &&
                    !(this.x + this.radius <= Island.position.x)))) {
            this.dx = -this.dx;
            Sound.shipBounce.play();
            this.shield = 8;
        }
        this.x += this.dx * progress;
        this.y += this.dy * progress;
        /*
        if (this.x < minX) this.x = minX;
        if (this.x > maxX) this.x = maxX - 10;
        if (this.y < minY) this.y = minY;
        if (this.y > maxY) this.y = maxY - 10;
    */
        this.calcTip();
    }
    draw() {
        if (!this.isAlive)
            return;
        if (this.hyperCount == 0) {
            //const fillStyle = "rgba(255, 255, 255, 0.5)";
            //Game.View.fillStyle = fillStyle;
            Game.View.beginPath();
            Game.View.arc(this.x, this.y, this.radius / 3, 0, 2 * Math.PI);
            Game.View.fill();
            //Game.View.fillStyle = "rgba(255, 255, 255, 1)";
            const backLeftAngle = this.angle + (3 / 7.7) * (2 * Math.PI);
            const blx = this.radius * Math.cos(backLeftAngle);
            const bly = this.radius * Math.sin(backLeftAngle);
            const backRightAngle = this.angle - (3 / 7.7) * (2 * Math.PI);
            const brx = this.radius * Math.cos(backRightAngle);
            const bry = this.radius * Math.sin(backRightAngle);
            Game.View.beginPath();
            // Game.View.moveTo(this.x, this.y);
            Game.View.moveTo(this.tip.x, this.tip.y);
            Game.View.lineTo(this.x + blx, this.y + bly);
            Game.View.lineTo(this.x, this.y);
            Game.View.lineTo(this.x + brx, this.y + bry);
            Game.View.lineTo(this.tip.x, this.tip.y);
            Game.View.fill();
        }
        if (this.shield > 0) {
            if (this.shield % 2 == 0) {
                Game.View.beginPath();
                Game.View.arc(this.x + 1, this.y + 1, this.radius + 2, 0, 2 * Math.PI);
                Game.View.stroke();
            }
            this.shield -= 1;
        }
    }
    calcTip() {
        const cx = this.radius * Math.cos(this.angle);
        const cy = this.radius * Math.sin(this.angle);
        this.tip = { x: this.x + cx, y: this.y + cy };
    }
    hit(damage) {
        if (this.isAlive) {
            this.shield = 6;
            this.damage -= damage;
            if (this.damage <= 0) {
                this.damage = 0;
                this.isAlive = false;
                Sound.shipExplode.play();
                Game.Explode(this.x, this.y, 256);
            }
            else {
                Sound.shipHit.play();
            }
        }
    }
    isOverlappedCircles(x, y, r) {
        const actDistanceSquare = (this.x - x) ** 2 + (this.y - y) ** 2;
        const minDistanceSquare = (this.radius + r) ** 2;
        const collide = actDistanceSquare <= minDistanceSquare;
        return collide;
    }
    addHealth(health) {
        this.damage += health;
        if (this.damage > this.initDamage)
            this.damage = this.initDamage;
    }
    hyperSpace() {
        if (this.damage > 100 && this.hyperCount == 0) {
            this.damage -= 100;
            this.hyperCount = 80;
            this.dx = 0;
            this.dy = 0;
            this.speed = 0;
            while (true) {
                const x = Game.rand(30, Game.width - 30);
                const y = Game.rand(30, Game.height - 30);
                if (!game.island.isInside({ x, y })) {
                    this.x = x;
                    this.y = y;
                    break;
                }
            }
        }
    }
}
class Thrust {
    x;
    y;
    dx;
    dy;
    ttl = 10;
    size = 5;
    constructor(speed) {
        this.x = game.ship.x;
        this.y = game.ship.y;
        const flare = 5; // bigger flare gives narrower flame
        const offset = 0.5 / flare; // subtracting offset will give +ve & -ve values
        const flame = Math.random() / flare - offset;
        const angle = game.ship.angle + Math.PI + flame;
        this.dx = speed * Math.cos(angle) + game.ship.dx;
        this.dy = speed * Math.sin(angle) + game.ship.dy;
    }
    update(progress) {
        if (this.ttl > 0) {
            this.ttl -= progress;
            this.x += this.dx * progress;
            this.y += this.dy * progress;
            if (game.island.isInside(this))
                this.ttl = 0;
        }
    }
    draw() {
        if (this.ttl > 0) {
            Game.View.fillStyle = `rgba(255, 255, 255, ${this.ttl / 25})`;
            Game.View.fillRect(this.x - 2, this.y - 2, this.size, this.size);
        }
    }
}
class Debris {
    x;
    y;
    dx;
    dy;
    ttl = 10;
    size;
    static sizeCounter = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 20;
        this.dx = speed * Math.cos(angle);
        this.dy = speed * Math.sin(angle);
        this.size = ++Debris.sizeCounter % 3;
    }
    update(progress) {
        if (this.ttl > 0) {
            this.ttl -= progress;
            this.x += this.dx * progress;
            this.y += this.dy * progress;
            if (game.island.isInside(this))
                this.ttl = 0;
        }
    }
    draw() {
        if (this.ttl > 0) {
            const fillStyle = `rgba(255, 255, 255, ${this.ttl / 25})`;
            // const fillStyle = "rgba(255, 255, 255, 1)";
            Game.View.fillStyle = fillStyle;
            Game.View.fillRect(this.x, this.y, this.size + 2, this.size + 2);
        }
    }
    detect() {
        // game.swarm?.drones.forEach((drone) => {
        //   if (Game.isCollision(this, drone)) {
        //     drone.damage -= this.ttl;
        //     this.ttl = 0;
        //     if (drone.damage < 0) {
        //       drone.isAlive = false;
        //       Sound.droneExplode.play();
        //       // for (let i = 0; i < 32; ++i)
        //       //   game.debris.push(new Debris(drone.x, drone.y));
        //       Game.Explode(this.x, this.y, 32);
        //     } else {
        //       Sound.droneHit.play();
        //     }
        //   }
        // });
    }
}
class LaserBolt {
    x;
    y;
    dx;
    dy;
    radius;
    ttl = 80;
    constructor() {
        this.x = game.ship.tip.x;
        this.y = game.ship.tip.y;
        this.radius = game.ship.radius / 8;
        const speed = 12;
        this.dx = speed * Math.cos(game.ship.angle);
        this.dy = speed * Math.sin(game.ship.angle);
        this.dx += game.ship.dx;
        this.dy += game.ship.dy;
        Sound.laserShoot.play();
    }
    update(progress) {
        if (this.ttl > 0) {
            this.ttl -= progress;
            this.x += this.dx * progress;
            this.y += this.dy * progress;
            if (game.island.isInside(this))
                this.ttl = 0;
        }
    }
    draw() {
        if (this.ttl > 0) {
            const fillStyle = `rgba(255, 255, 255, ${this.ttl / 80})`;
            Game.View.fillStyle = fillStyle;
            Game.View.fillRect(this.x - 1, this.y - 1, 3, 3);
        }
    }
    detect() {
        game.swarm?.drones.forEach((drone) => {
            if (this.ttl > 0 && Game.isCollision(this, drone)) {
                drone.hit(this.ttl);
                this.ttl = 0;
            }
        });
        if (game?.swarm?.spinner != null &&
            Game.isCollision(this, game.swarm.spinner)) {
            game.ship.score += 150;
            game.swarm.spinner.hit();
        }
        for (let i = 0; i < game.mines.length; ++i) {
            const mine = game.mines[i];
            if (mine.isCollision(this)) {
                this.ttl = 0;
                game.ship.addHealth(10);
                break;
            }
        }
    }
}
class Mine {
    x;
    y;
    radius;
    isAlive = true;
    speed = 0.01;
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    update(progress, counter) {
        if (this.isAlive && game.ship.isAlive) {
            if (counter == 1 && this.speed < 1)
                this.speed += 0.001;
            const tx = game.ship.x - this.x;
            const ty = game.ship.y - this.y;
            const angle = Math.atan2(ty, tx);
            const dx = this.speed * Math.cos(angle);
            const dy = this.speed * Math.sin(angle);
            this.x += dx * progress;
            this.y += dy * progress;
            if (game.island.isInside(this)) {
                this.isAlive = false;
                Game.Explode(this.x, this.y, 64);
                Sound.mineExplode.play();
            }
        }
    }
    draw() {
        if (this.isAlive) {
            Game.View.beginPath();
            Game.View.moveTo(this.x + this.radius, this.y);
            Game.View.lineTo(this.x, this.y + this.radius);
            Game.View.lineTo(this.x - this.radius, this.y);
            Game.View.lineTo(this.x, this.y - this.radius);
            Game.View.lineTo(this.x + this.radius, this.y);
            Game.View.lineTo(this.x - this.radius, this.y);
            Game.View.stroke();
        }
    }
    detect() {
        if (game.ship.isAlive &&
            game.ship.hyperCount == 0 &&
            this.isCollision(game.ship)) {
            game.ship.hit(100);
        }
    }
    isCollision(other) {
        if (!this.isAlive)
            return false;
        const collide = (this.x - other.x) ** 2 + (this.y - other.y) ** 2 <=
            (this.radius + other.radius) ** 2;
        if (collide) {
            this.isAlive = false;
            Game.Explode(this.x, this.y, 64);
            Sound.mineExplode.play();
        }
        return collide;
    }
}
class DroneBolt {
    x;
    y;
    dx;
    dy;
    //radius: number;
    ttl = 50;
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        //this.radius = game.ship.radius / 8;
        const speed = 12;
        this.dx = speed * Math.cos(angle);
        this.dy = speed * Math.sin(angle);
        // this.x += this.dx;
        // this.y += this.dy;
    }
    update(progress) {
        if (this.ttl > 0) {
            this.ttl -= progress;
            this.x += this.dx * progress;
            this.y += this.dy * progress;
            if (game.island.isInside(this))
                this.ttl = 0;
        }
    }
    draw() {
        if (this.ttl > 0) {
            const fillStyle = `rgba(255, 255, 255, ${this.ttl / 25})`;
            Game.View.fillStyle = fillStyle;
            Game.View.fillRect(this.x, this.y, 3, 3);
        }
    }
    detect() {
        if (game.ship.hyperCount == 0 && Game.isCollision(this, game.ship)) {
            game.ship.hit(this.ttl);
            // //game.ship.isAlive = false;
            // game.ship.shield = 6;
            // game.ship.damage -= this.ttl;
            this.ttl = 0;
            // if (game.ship.damage <= 0) game.ship.isAlive = false;
            // if (game.ship.isAlive) {
            //   Sound.shipHit.play();
            // } else {
            //   Sound.shipExplode.play();
            //   for (let i = 0; i < 256; ++i)
            //     game.debris.push(new Debris(game.ship.x, game.ship.y));
            // }
            //Sound.droneExplode.play();
        }
        // game.drones.forEach((drone) => {
        //   if (Game.isCollision(this, drone)) {
        //     drone.damage -= this.ttl;
        //     this.ttl = 0;
        //     if (drone.damage < 0) {
        //       drone.isAlive = false;
        //       Sound.droneExplode.play();
        //       for (let i = 0; i < 32; ++i)
        //         game.debris.push(new Debris(drone.x, drone.y));
        //     } else {
        //       Sound.droneHit.play();
        //     }
        //   }
        // });
    }
}
class Drone {
    x;
    y;
    radius;
    maxRaduis = 10;
    angle = Math.random() * 2 * Math.PI;
    speed = 2;
    mode = 0;
    modes = 4;
    top;
    right;
    bottom;
    left;
    isAlive = true;
    damage = 100;
    opacity = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.top = Game.height - this.y;
        this.left = Game.width - this.x;
        this.right = this.x;
        this.bottom = this.y;
    }
    update(progress, counter) {
        if (this.isAlive) {
            if (counter == 1) {
                this.angle += 0.2;
                if (this.angle >= 2 * Math.PI)
                    this.angle = 0;
                if (this.radius < this.maxRaduis)
                    this.radius += 0.05;
                if (this.radius > this.maxRaduis)
                    this.radius = this.maxRaduis;
                if (Math.random() > 0.99)
                    this.fire();
            }
            if (this.mode == 0) {
                this.x -= this.speed * progress;
                if (this.x <= this.left) {
                    this.x = this.left;
                    this.mode = 1;
                }
            }
            else if (this.mode == 1) {
                this.y -= this.speed * progress;
                if (this.y <= this.top) {
                    this.y = this.top;
                    this.mode = 2;
                }
            }
            else if (this.mode == 2) {
                this.x += this.speed * progress;
                if (this.x >= this.right) {
                    this.x = this.right;
                    this.mode = 3;
                }
            }
            else if (this.mode == 3) {
                this.y += this.speed * progress;
                if (this.y >= this.bottom) {
                    this.y = this.bottom;
                    // if (this.speed < 20) this.speed += 2;
                    this.mode = 0;
                }
            }
        }
    }
    draw() {
        if (this.isAlive) {
            // this.drawDrone();
            this.drawDrone();
        }
    }
    drawSpinner() {
        Game.View.beginPath();
        Game.View.arc(this.x, this.y, this.radius * 0.7, this.angle, this.angle + 2 * Math.PI);
        Game.View.fill();
        const w = Game.View.lineWidth;
        Game.View.lineWidth - 5;
        const third = 2 * Math.PI * 0.333;
        const a1 = this.angle;
        const a2 = this.angle + third; // a1 + third;
        const a3 = a2 + third; // a2 + third;
        const r = this.radius + 4;
        const x1 = this.x + r * Math.cos(a1);
        const y1 = this.y + r * Math.sin(a1);
        const x2 = this.x + r * Math.cos(a2);
        const y2 = this.y + r * Math.sin(a2);
        const x3 = this.x + r * Math.cos(a3);
        const y3 = this.y + r * Math.sin(a3);
        const v = Game.View;
        v.beginPath();
        v.lineWidth = 5;
        v.moveTo(this.x, this.y);
        v.lineTo(x1, y1);
        v.moveTo(this.x, this.y);
        v.lineTo(x2, y2);
        v.moveTo(this.x, this.y);
        v.lineTo(x3, y3);
        v.stroke();
        v.lineWidth = w;
    }
    drawDrone() {
        if (this.opacity < 1) {
            this.opacity += 0.003;
            if (this.opacity > 1)
                this.opacity = 1;
        }
        const style = `rgba(255, 255, 255, ${this.opacity})`;
        // Game.View.fillStyle = style;
        // Game.View.strokeStyle = style;
        // draw outer circle
        Game.View.lineWidth = 2;
        Game.View.beginPath();
        Game.View.arc(this.x, this.y, this.radius * 1.6, this.angle, this.angle + 2 * Math.PI);
        Game.View.stroke();
        // draw radial lines
        // Game.View.lineTo(this.x, this.y);
        Game.View.beginPath();
        const w = Game.View.lineWidth;
        Game.View.lineWidth = 5;
        const quarter = 0.5 * Math.PI;
        const a1 = this.angle;
        const a2 = this.angle + quarter;
        const a3 = a2 + quarter;
        const a4 = a3 + quarter;
        const r = this.radius + 4;
        const x1 = this.x + r * Math.cos(a1);
        const y1 = this.y + r * Math.sin(a1);
        const x2 = this.x + r * Math.cos(a2);
        const y2 = this.y + r * Math.sin(a2);
        const x3 = this.x + r * Math.cos(a3);
        const y3 = this.y + r * Math.sin(a3);
        const x4 = this.x + r * Math.cos(a4);
        const y4 = this.y + r * Math.sin(a4);
        //Game.View.fillStyle = style;
        Game.View.moveTo(x1, y1);
        Game.View.lineTo(x3, y3);
        Game.View.moveTo(x2, y2);
        Game.View.lineTo(x4, y4);
        Game.View.stroke();
        Game.View.lineWidth = w;
        if (this.damage > 0) {
            // draw inner filled circle (fainter if damaged)
            Game.View.beginPath();
            const fillStyle = `rgba(255, 255, 255, ${this.damage / 100})`;
            //if (this.opacity < 1) Game.View.fillStyle = style;
            //else
            Game.View.fillStyle = fillStyle;
            Game.View.arc(this.x, this.y, this.radius + 1, this.angle, this.angle + 2 * Math.PI);
            Game.View.fill();
        }
    }
    fire() {
        if (game.ship.isAlive && game.ship.hyperCount == 0) {
            const tx = game.ship.x - this.x;
            const ty = game.ship.y - this.y;
            const angle = Math.atan2(ty, tx);
            const bolt = new DroneBolt(this.x, this.y, angle);
            game.droneBolts.push(bolt);
            Sound.droneShoot.play();
        }
    }
    promote() {
        this.isAlive = false;
        return new Spinner(this.x, this.y, this.radius);
    }
    hit(damage) {
        this.damage -= damage;
        if (this.damage <= 0) {
            this.isAlive = false;
            game.ship.score += 100;
            Sound.droneExplode.play();
            Game.Explode(this.x, this.y, 32);
        }
        else {
            Sound.droneHit.play();
        }
    }
}
class Spinner {
    x;
    y;
    dx;
    dy;
    radius;
    angle = Math.random() * 2 * Math.PI;
    isAlive = true;
    speed = 0.3;
    initialShotCount = 50;
    shotCount = this.initialShotCount;
    constructor(x, y, radius = 10) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        const speed = 10;
        if (Math.random() > 0.5)
            this.dx = speed;
        else
            this.dx = -10;
        if (Math.random() > 0.5)
            this.dy = speed;
        else
            this.dy = -10;
        if (Math.random() > 0.5)
            this.speed = -this.speed;
    }
    update(progress, counter) {
        if (this.isAlive) {
            if (counter == 1) {
                this.angle += this.speed;
                if (--this.shotCount < 0) {
                    this.fire();
                    this.shotCount = this.initialShotCount;
                }
                if (game.ship.isAlive && Math.random() > 0.95)
                    game.mines.push(new Mine(this.x, this.y, 7));
            }
            // calculate coords at extreme edge of arena
            const minX = this.radius + 2;
            const minY = this.radius + 2;
            const maxX = Game.Canvas.width - this.radius - 6;
            const maxY = Game.Canvas.height - this.radius - 6;
            if (this.x < minX || this.x > maxX) {
                this.dx = -this.dx;
                Sound.spinnerBounce.play();
            }
            if (this.y < minY || this.y > maxY) {
                this.dy = -this.dy;
                Sound.spinnerBounce.play();
            }
            if (this.x > Island.position.x &&
                this.x < Island.position.right &&
                ((this.dy > 0 &&
                    this.y + this.radius >= Island.position.y &&
                    !(this.y + this.radius >= Island.position.bottom)) ||
                    (this.dy < 0 &&
                        this.y - this.radius <= Island.position.bottom &&
                        !(this.y + this.radius <= Island.position.y)))) {
                this.dy = -this.dy;
                Sound.spinnerBounce.play();
            }
            if (this.y > Island.position.y &&
                this.y < Island.position.bottom &&
                ((this.dx > 0 &&
                    this.x + this.radius >= Island.position.x &&
                    !(this.x + this.radius >= Island.position.right)) ||
                    (this.dx < 0 &&
                        this.x - this.radius <= Island.position.right &&
                        !(this.x + this.radius <= Island.position.x)))) {
                this.dx = -this.dx;
                Sound.spinnerBounce.play();
            }
            this.x += this.dx * progress;
            this.y += this.dy * progress;
        }
    }
    draw() {
        if (this.isAlive) {
            Game.View.beginPath();
            Game.View.arc(this.x, this.y, this.radius * 0.7, this.angle, this.angle + 2 * Math.PI);
            Game.View.fill();
            const w = Game.View.lineWidth;
            Game.View.lineWidth - 5;
            const third = 2 * Math.PI * 0.333;
            const a1 = this.angle;
            const a2 = this.angle + third; // a1 + third;
            const a3 = a2 + third; // a2 + third;
            const r = this.radius + 4;
            const x1 = this.x + r * Math.cos(a1);
            const y1 = this.y + r * Math.sin(a1);
            const x2 = this.x + r * Math.cos(a2);
            const y2 = this.y + r * Math.sin(a2);
            const x3 = this.x + r * Math.cos(a3);
            const y3 = this.y + r * Math.sin(a3);
            const v = Game.View;
            v.beginPath();
            v.lineWidth = 5;
            v.moveTo(this.x, this.y);
            v.lineTo(x1, y1);
            v.moveTo(this.x, this.y);
            v.lineTo(x2, y2);
            v.moveTo(this.x, this.y);
            v.lineTo(x3, y3);
            v.stroke();
            v.lineWidth = w;
        }
    }
    hit() {
        this.isAlive = false;
        Sound.spinnerExplode.play();
        for (let i = 0; i < 64; ++i)
            game.debris.push(new Debris(this.x, this.y));
        game.swarm.spinner = null;
    }
    isHitShip() { }
    isInsideRect(top, right, bottom, left, x, y) {
        return x >= left && x <= right && y >= top && y <= bottom;
    }
    isOverlappedCircles(x, y, r) {
        const dx = Math.abs(this.x - x);
        const dy = Math.abs(this.y - y);
        const actDistanceSquare = dx * dx + dy * dy;
        const minDistance = this.radius + r;
        const minDistanceSquare = minDistance * minDistance;
        const collide = actDistanceSquare <= minDistanceSquare;
        return collide;
    }
    fire() {
        if (game.ship.isAlive && game.ship.hyperCount == 0) {
            const tx = game.ship.x - this.x;
            const ty = game.ship.y - this.y;
            const angle = Math.atan2(ty, tx);
            const bolt = new DroneBolt(this.x, this.y, angle);
            game.droneBolts.push(bolt);
            Sound.droneShoot.play();
        }
    }
}
class Swarm {
    static generation = 0;
    gapCounter = 500;
    size;
    drones = [];
    spinner = null;
    counter = 1;
    constructor() {
        this.size = ++Swarm.generation * 4;
        const top = Game.height * 0.7 + 30;
        const left = Game.width * 0.7 + 30;
        const right = Game.width - 30;
        const bottom = Game.height - 30;
        for (let i = 0; i < this.size; ++i) {
            this.drones.push(new Drone(Game.rand(left, right), Game.rand(top, bottom)));
        }
    }
    get count() {
        let count = this.drones.filter((d) => d.isAlive).length;
        if (this.spinner)
            ++count;
        return count;
    }
    update(progress, counter) {
        if (counter == 1)
            this.counter += 1;
        this.drones = this.drones.filter((drone) => drone.isAlive);
        this.spinner?.update(progress, counter);
        if (this.spinner != null &&
            game.ship.isAlive &&
            game.ship.hyperCount == 0 &&
            this.spinner.isOverlappedCircles(game.ship.x, game.ship.y, game.ship.radius)) {
            this.spinner?.hit();
            game.ship.hit(100);
        }
        this.drones.forEach((drone) => {
            drone.update(progress, counter);
            if (game.ship.isAlive &&
                game.ship.isOverlappedCircles(drone.x, drone.y, drone.radius)) {
                game.ship.hit(drone.damage);
                drone.hit(drone.damage + 1);
            }
        });
        if (this.counter % 500 == 0 &&
            this.spinner == null &&
            this.drones.length > 0) {
            this.spinner = this.drones[0].promote();
        }
        if (this.count == 0)
            this.gapCounter -= 1;
    }
    draw() {
        this.spinner?.draw();
        this.drones.forEach((drone) => drone.draw());
    }
    get isSwarming() {
        return this.gapCounter > 0;
    }
}
class Game {
    static Canvas = document.querySelector("canvas");
    static View = Game.Canvas.getContext("2d");
    static Game = (() => {
        addEventListener("resize", Game.resize);
    })();
    #previousTimestamp = 0;
    static frameCounter = 0;
    static isPaused = false;
    island = new Island();
    ship = new Ship();
    laserBolts = [];
    debris = [];
    droneBolts = [];
    swarm = null;
    mines = [];
    exhaust = [];
    constructor() {
        Swarm.generation = 0;
    }
    static resize() {
        Game.Canvas.height = window.innerHeight - 5;
        Game.Canvas.width = window.innerWidth - 1;
        Island.calculatePosition();
    }
    static get height() {
        return Game.Canvas.height;
    }
    static get width() {
        return Game.Canvas.width;
    }
    static isCollision(bolt, drone) {
        if (bolt.ttl < 1 || !drone.isAlive)
            return false;
        else {
            const dx = Math.abs(bolt.x - drone.x);
            const dy = Math.abs(bolt.y - drone.y);
            return dx < drone.radius - 1 && dy < drone.radius - 1;
        }
    }
    static Explode(x, y, fragments) {
        for (let i = 0; i < fragments; ++i)
            game.debris.push(new Debris(x, y));
    }
    static maxLaserBolts = 10;
    update() {
        GamePad.update();
        if (GamePad.isPressed(8 /* Restart */))
            game = new Game();
        if (Keyboard.isPressed("KeyS"))
            game.swarm = new Swarm();
        if (GameInput.isPaused)
            Game.isPaused = true;
        const totalUpdates = 5;
        let counter = 1;
        const progress = 1 / totalUpdates;
        while (counter <= totalUpdates) {
            this.ship.update(progress, counter);
            this.swarm?.update(progress, counter);
            this.mines.forEach((mine) => mine.update(progress, counter));
            this.mines.forEach((mine) => mine.detect());
            this.laserBolts.forEach((bolt) => bolt.update(progress));
            this.laserBolts.forEach((bolt) => bolt.detect());
            this.debris.forEach((d) => d.update(progress));
            this.debris.forEach((d) => d.detect());
            this.droneBolts.forEach((bolt) => bolt.update(progress));
            this.droneBolts.forEach((bolt) => bolt.detect());
            this.exhaust.forEach((ex) => ex.update(progress));
            counter += 1;
        }
        if (!this.swarm?.isSwarming)
            this.swarm = new Swarm();
    }
    draw() {
        const height = Game.Canvas.height;
        const width = Game.Canvas.width;
        Game.View.clearRect(0, 0, width, height);
        this.island.draw();
        this.ship.draw();
        this.swarm?.draw();
        this.laserBolts.forEach((bolt) => bolt.draw());
        this.debris.forEach((d) => d.draw());
        this.droneBolts.forEach((bolt) => bolt.draw());
        this.mines.forEach((mine) => mine.draw());
        this.exhaust.forEach((ex) => ex.draw());
    }
    step(timestamp) {
        if (Game.isPaused) {
            // check for resume
            GamePad.update();
            if (GameInput.isPaused)
                Game.isPaused = false;
        }
        else {
            const framesPerSecond = 25;
            const delay = 1000 / framesPerSecond;
            const elapsed = timestamp - this.#previousTimestamp;
            if (elapsed > delay) {
                Game.frameCounter += 1;
                this.laserBolts = this.laserBolts.filter((bolt) => bolt.ttl > 0);
                this.debris = this.debris.filter((d) => d.ttl > 0);
                this.droneBolts = this.droneBolts.filter((bolt) => bolt.ttl > 0);
                this.mines = this.mines.filter((mine) => mine.isAlive);
                this.exhaust = this.exhaust.filter((ex) => ex.ttl > 0);
                this.update();
                this.draw();
                this.#previousTimestamp = timestamp;
            }
        }
        requestAnimationFrame(Game.animate);
    }
    start() {
        Game.Canvas.height = window.innerHeight - 5;
        Game.Canvas.width = window.innerWidth - 1;
        Island.calculatePosition();
        Sound.pulsate.loop = true;
        Sound.pulsate.volume = 0.1;
        Sound.pulsate.play();
        this.swarm = new Swarm();
        requestAnimationFrame(Game.animate);
    }
    static animate = (timestamp) => game.step(timestamp);
    static rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
var game = new Game();
game.start();
//# sourceMappingURL=index.js.map