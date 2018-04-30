function Game() {
    this.load = function (n) {
        [
            undefined,
            this.level1
        ][n]();
    };
}

function end(text, color = "red") {
    Graphics.add(new Title(text, color));
}

Game.prototype.level1 = function () {
    Graphics.clear();
    const player = new Player(-100, 250);
    const p1 = new Platform(-100, 300, 400, 20);

    function spawn(x, y) {
        const p = new Platform(x, y, Math.random() * 200 + 100, 20);
        const enemy = new Enemy(x, y - 50, player);
        Graphics.add(p, enemy);
    }

    spawn(400, 100);
    spawn(650, 350);
    spawn(300, 200);
    spawn(600, 0);
    spawn(200, -100);
    spawn(200, 400);
    spawn(-100, 100);
    let int = setInterval(checkState, 100);

    function checkState() {
        if (!Graphics.sprites.includes(player)) {
            end("You Lose", "red");
            clearInterval(int);
        }
        let done = true;
        Graphics.sprites.forEach(s => {
            if (s.id === "Enemy") {
                done = false;
            }
        });
        if (done) {
            end("You Win", "green");
            clearInterval(int);
        }
    }

    const ground = new Barrier(0, 600, 3000, 200);
    const wall1 = new Barrier(-800, 0, 800, 1000);
    const wall2 = new Barrier(1200, 0, 800, 1000);
    const roof = new Barrier(0, -600, 3000, 800);
    Graphics.background = "lightblue";
    Graphics.center = player.center;
    Graphics.add(Gravity, p1, player, ground, wall1, wall2, roof);
};