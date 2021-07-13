"use strict";
class Sound {
    static sounds = [];
    static audio(src) {
        const a = new Audio(src);
        //a.volume = Sound.volume * (1 / Sound.maxVolume);
        this.sounds.push(a);
        return a;
    }
    static laserShoot = [];
    static laserShootCount = 0;
    static laserShootPlay() {
        Sound.laserShoot[Sound.laserShootCount].play();
        if (++Sound.laserShootCount == Sound.laserShoot.length)
            Sound.laserShootCount = 0;
    }
    static droneExplode = [];
    static droneExplodeCount = 0;
    static droneExplodePlay() {
        Sound.droneExplode[++Sound.droneExplodeCount % Sound.laserShoot.length].play();
    }
    static shipBounce = [];
    static shipBounceCount = 0;
    static shipBouncePlay() {
        Sound.shipBounce[++Sound.shipBounceCount % Sound.shipBounce.length].play();
    }
    static Sound = (() => {
        // const laserSound = "./sounds/science_fiction_laser_001.mp3";
        const laserSound = "./sounds/Synth_Basic_Laser1_14.mp3";
        for (let i = 0; i < 6; ++i) {
            Sound.laserShoot.push(Sound.audio(laserSound));
        }
        const droneExplode = "./sounds/explode1.mp3";
        for (let i = 0; i < 6; ++i)
            Sound.droneExplode.push(Sound.audio(droneExplode));
        const shipBounce = "./sounds/bounce.mp3";
        for (let i = 0; i < 2; ++i)
            Sound.shipBounce.push(Sound.audio(shipBounce));
    })();
}
class GamePad {
    static GamePad = (() => {
        addEventListener("gamepadconnected", (event) => {
            GamePad.isConnected = true;
            // console.log("CONNECT");
        });
        addEventListener("gamepaddisconnected", (event) => {
            GamePad.isConnected = false;
            // console.log("DISCON");
        });
        // console.log("Listening for gamepads . . .");
    })();
    static isConnected = false;
    static current = null;
    static previous = null;
    static update() {
        if (GamePad.isConnected) {
            GamePad.previous = GamePad.current;
            GamePad.current = navigator.getGamepads()[0];
        }
    }
    static refresh() {
        if (GamePad.isConnected) {
            GamePad.update();
            // if (GamePad.current == null) GamePad.update();
            if (GamePad.current?.buttons[1].pressed &&
                (GamePad.previous == null || !GamePad.previous?.buttons[1].pressed)) {
                GamePad.fire = true;
            }
            if (!GamePad.current?.buttons[1].pressed) {
                GamePad.fire = false;
            }
            //if (GamePad.isPressed(12)) game.ship.angle = 1.5 * Math.PI;
            //if (GamePad.isPressed(13)) game.ship.angle = 0.5 * Math.PI;
            if (GamePad.current?.buttons[14].pressed)
                game.ship.angle -= 0.05; // Math.PI;
            if (GamePad.current?.buttons[15].pressed)
                game.ship.angle += 0.05;
        }
    }
    static isPressed(button) {
        if (GamePad.current == null || GamePad.previous == null)
            return false;
        else
            return (GamePad.current.buttons[button].pressed &&
                !GamePad.previous.buttons[button].pressed);
    }
    static fire = false;
    static get isFire() {
        const fired = GamePad.fire;
        GamePad.fire = false;
        return fired;
    }
    static get angle() {
        if (GamePad.current != null) {
            const x = GamePad.current.axes[0];
            const y = GamePad.current.axes[1];
            if (!(x > -0.15 && x < 0.15 && y > -0.15 && y < 0.15)) {
                const ang = Math.atan2(y, x);
                return ang;
            }
        }
        return null;
    }
    static get thrust() {
        if (GamePad.current != null) {
            return GamePad.current.buttons[7].value;
        }
        return 0;
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
        // Game.View.font = "30px Lucida Console";
        Game.View.fillStyle = "white";
        // if (GamePad.thrust != null)
        //   Game.View.fillText(
        //     `${game.ship.dx}  ${game.ship.dy}`,
        //     width * 0.32,
        //     height * 0.45
        //   );
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
    tip = null;
    static maxAngle = Math.PI * 2;
    bounce = 0;
    update(progress, counter) {
        const a = GamePad.angle;
        if (a != null)
            this.angle = a;
        if (counter == 1) {
            const thrustFactor = 0.1;
            if (GamePad.thrust > 0) {
                this.dx += GamePad.thrust * thrustFactor * Math.cos(this.angle);
                this.dy += GamePad.thrust * thrustFactor * Math.sin(this.angle);
            }
            else {
                this.dx *= 0.99;
                this.dy *= 0.99;
                if (this.dx > 0 && this.dx < 0.2)
                    this.dx = 0;
                if (this.dx < 0 && this.dx > -0.2)
                    this.dx = 0;
                if (this.dy > 0 && this.dy < 0.2)
                    this.dy = 0;
                if (this.dy < 0 && this.dy > -0.2)
                    this.dy = 0;
            }
        }
        const maxSpeed = 5;
        if (this.dx < -maxSpeed)
            this.dx = -maxSpeed;
        if (this.dx > maxSpeed)
            this.dx = maxSpeed;
        if (this.dy < -maxSpeed)
            this.dy = -maxSpeed;
        if (this.dy > maxSpeed)
            this.dy = maxSpeed;
        const minX = this.radius + 2;
        const minY = this.radius + 2;
        const maxX = Game.Canvas.width - this.radius - 6;
        const maxY = Game.Canvas.height - this.radius - 6;
        if (this.x < minX || this.x > maxX) {
            this.dx = -this.dx;
            Sound.shipBouncePlay();
            this.bounce = 8;
        }
        if (this.y < minY || this.y > maxY) {
            this.dy = -this.dy;
            Sound.shipBouncePlay();
            this.bounce = 8;
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
            Sound.shipBouncePlay();
            this.bounce = 8;
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
            Sound.shipBouncePlay();
            this.bounce = 8;
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
        Game.View.beginPath();
        Game.View.arc(this.x, this.y, this.radius / 3, 0, 2 * Math.PI);
        Game.View.fill();
        const backLeftAngle = this.angle + (3 / 9) * (2 * Math.PI);
        const blx = this.radius * Math.cos(backLeftAngle);
        const bly = this.radius * Math.sin(backLeftAngle);
        const backRightAngle = this.angle - (3 / 8) * (2 * Math.PI);
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
        if (this.bounce > 0) {
            if (this.bounce % 2 == 0) {
                Game.View.beginPath();
                Game.View.arc(this.x, this.y, this.radius + 2, 0, 2 * Math.PI);
                Game.View.stroke();
            }
            this.bounce -= 1;
        }
    }
    calcTip() {
        const cx = this.radius * Math.cos(this.angle);
        const cy = this.radius * Math.sin(this.angle);
        this.tip = { x: this.x + cx, y: this.y + cy };
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
    speed;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = Game.rand(2, 20);
        this.dx = this.speed * Math.cos(Math.random() * 2 * Math.PI);
        this.dy = this.speed * Math.sin(Math.random() * 2 * Math.PI);
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
            const fillStyle = `rgba(255, 255, 255, ${this.ttl / 10})`;
            Game.View.fillStyle = fillStyle;
            if (this.size == 0)
                Game.View.fillRect(this.x, this.y, 4, 4);
            if (this.size == 1)
                Game.View.fillRect(this.x, this.y, 2, 2);
            if (this.size == 2)
                Game.View.fillRect(this.x - 1, this.y - 1, 3, 3);
        }
    }
    detect() {
        game.drones.forEach((drone) => {
            if (Game.isCollision(this, drone)) {
                drone.damage -= this.ttl;
                this.ttl = 0;
                if (drone.damage < 0) {
                    drone.isAlive = false;
                    Sound.droneExplodePlay();
                    for (let i = 0; i < 32; ++i)
                        game.debris.push(new Debris(drone.x, drone.y));
                }
            }
        });
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
            // Game.View.beginPath();
            // Game.View.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            // Game.View.fill();
            Game.View.fillRect(this.x - 1, this.y - 1, 3, 3);
        }
    }
    detect() {
        game.drones.forEach((drone) => {
            if (Game.isCollision(this, drone)) {
                drone.damage -= this.ttl;
                this.ttl = 0;
                if (drone.damage < 0) {
                    drone.isAlive = false;
                    Sound.droneExplodePlay();
                    for (let i = 0; i < 32; ++i)
                        game.debris.push(new Debris(drone.x, drone.y));
                }
            }
        });
    }
}
class Drone {
    x;
    y;
    radius;
    angle = 0;
    speed = 2;
    mode = 0;
    modes = 4;
    top;
    right;
    bottom;
    left;
    isAlive = true;
    damage = 100;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
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
            Game.View.beginPath();
            Game.View.arc(this.x, this.y, this.radius * 1.6, this.angle, this.angle + 2 * Math.PI);
            Game.View.lineTo(this.x, this.y);
            Game.View.stroke();
            if (this.damage > 0) {
                Game.View.beginPath();
                const fillStyle = `rgba(255, 255, 255, ${this.damage / 100})`;
                Game.View.fillStyle = fillStyle;
                Game.View.arc(this.x, this.y, this.radius, this.angle, this.angle + 2 * Math.PI);
                Game.View.fill();
            }
        }
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
    island = new Island();
    ship = new Ship();
    laserBolts = [];
    drones = [];
    debris = [];
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
    update() {
        if (GamePad.isFire && this.laserBolts.length < 6) {
            this.laserBolts.push(new LaserBolt());
            Sound.laserShootPlay();
        }
        const totalUpdates = 5;
        let counter = 1;
        const progress = 1 / totalUpdates;
        while (counter <= totalUpdates) {
            this.ship.update(progress, counter);
            this.drones.forEach((drone) => {
                drone.update(progress, counter);
            });
            this.laserBolts.forEach((bolt) => bolt.update(progress));
            this.laserBolts.forEach((bolt) => bolt.detect());
            this.debris.forEach((d) => d.update(progress));
            this.debris.forEach((d) => d.detect());
            counter += 1;
        }
    }
    draw() {
        const height = Game.Canvas.height;
        const width = Game.Canvas.width;
        Game.View.clearRect(0, 0, width, height);
        this.island.draw();
        this.ship.draw();
        this.drones.forEach((drone) => {
            drone.draw();
        });
        this.laserBolts.forEach((bolt) => bolt.draw());
        this.debris.forEach((d) => d.draw());
    }
    step(timestamp) {
        const framesPerSecond = 25;
        const delay = 1000 / framesPerSecond;
        const elapsed = timestamp - this.#previousTimestamp;
        if (elapsed > delay) {
            Game.frameCounter += 1;
            GamePad.refresh();
            this.drones = this.drones.filter((drone) => drone.isAlive);
            this.laserBolts = this.laserBolts.filter((bolt) => bolt.ttl > 0);
            this.debris = this.debris.filter((d) => d.ttl > 0);
            this.update();
            this.draw();
            this.#previousTimestamp = timestamp;
        }
        requestAnimationFrame(Game.animate);
    }
    start() {
        Game.Canvas.height = window.innerHeight - 5;
        Game.Canvas.width = window.innerWidth - 1;
        Island.calculatePosition();
        //this.drones.push(new Drone(1250, 525));
        // this.drones.push(new Drone(1150, 525));
        // this.drones.push(new Drone(1200, 500));
        // this.drones.push(new Drone(1100, 500));
        // this.drones.push(new Drone(1150, 475));
        // this.drones.push(new Drone(1100, 450));
        // this.drones.push(new Drone(1050, 425));
        // this.drones.push(new Drone(1050, 475));
        // this.drones.push(new Drone(1000, 400));
        const swarmSize = 20;
        for (let i = 0; i < swarmSize; ++i) {
            this.drones.push(new Drone(Game.rand(950, 1200), Game.rand(400, 550)));
        }
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