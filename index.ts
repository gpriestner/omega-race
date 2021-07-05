addEventListener("resize", resizeGameArea);

const canvas = document.querySelector("canvas");
const ctx = canvas!.getContext("2d");

function resizeGameArea(): void {
  canvas!.height = window.innerHeight - 5;
  canvas!.width = window.innerWidth - 1;
}

class Island {
  draw(): void {
    const height = canvas!.height;
    const width = canvas!.width;

    ctx!.strokeStyle = "white";
    ctx!.strokeRect(width * 0.33, height * 0.33, width * 0.37, height * 0.37);

    ctx!.font = "30px Lucida Console";
    ctx!.fillStyle = "white";
    ctx!.fillText(Game.frameCounter.toString(), 500, 500);
  }
}

class Game {
  #previousTimestamp: number = 0;
  static frameCounter = 0;
  island: Island = new Island();

  step(timestamp: number): void {
    const elapsed = timestamp - this.#previousTimestamp;
    if (elapsed > 30) {
      Game.frameCounter += 1;
      this.draw();
    }
    requestAnimationFrame(Game.animate);
  }
  start(): void {
    canvas!.height = window.innerHeight - 5;
    canvas!.width = window.innerWidth - 1;
    requestAnimationFrame(Game.animate);
  }

  static animate = (timestamp: number) => game.step(timestamp);

  draw(): void {
    const height = canvas!.height;
    const width = canvas!.width;
    ctx!.clearRect(0, 0, width, height);

    this.island.draw();
  }
}

var game = new Game();
game.start();
