function Game() {
    this.load = function (n) {
        [
            undefined,
            this.level1
        ][n]();
    };
}

Game.prototype.level1 = function () {
    Graphics.clear();
    const player = new Player(-100, 250);
    function combo(x, y) {
        const p = new Platform (x, y, Math.random() * 200 + 100, 20);
        const enemy = new Enemy (x, y - 50, player);
        Graphics.add(p, enemy);
    }
    combo(400, 100);
    combo(650, 350);
    combo(300, 200);
    combo(600, 0);
    combo(200, -100);
    combo(200, 400);
    combo(-100, 100);
    const p1 = new Platform(-100, 300, 400, 20);
    const ground = new Barrier(0, 600, 3000, 200);
    const wall1 = new Barrier(-800, 0, 800, 1000);
    const wall2 = new Barrier(1200, 0, 800, 1000);
    const roof = new Barrier(0, -600, 3000, 800);
    Graphics.background = "lightblue";
    Graphics.center = player.center;
    Graphics.add(Gravity, p1, player, ground, wall1, wall2, roof);
};