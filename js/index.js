"use strict";
addEventListener("resize", resizeGameArea);
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
function resizeGameArea() {
    canvas.height = window.innerHeight - 5;
    canvas.width = window.innerWidth - 1;
}
class Island {
    draw() {
        const height = canvas.height;
        const width = canvas.width;
        ctx.strokeStyle = "white";
        ctx.strokeRect(width * 0.33, height * 0.33, width * 0.37, height * 0.37);
        ctx.font = "30px Lucida Console";
        ctx.fillStyle = "white";
        ctx.fillText(Game.frameCounter.toString(), 50, 50);
    }
}
class Game {
    #previousTimestamp = 0;
    static frameCounter = 0;
    island = new Island();
    step(timestamp) {
        const elapsed = timestamp - this.#previousTimestamp;
        if (elapsed > 30) {
            Game.frameCounter += 1;
            this.draw();
        }
        requestAnimationFrame(Game.animate);
    }
    start() {
        canvas.height = window.innerHeight - 5;
        canvas.width = window.innerWidth - 1;
        requestAnimationFrame(Game.animate);
    }
    static animate = (timestamp) => game.step(timestamp);
    draw() {
        const height = canvas.height;
        const width = canvas.width;
        ctx.clearRect(0, 0, width, height);
        this.island.draw();
    }
}
var game = new Game();
game.start();
//# sourceMappingURL=index.js.map