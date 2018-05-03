function Game() {
    this.load = function (n) {
        [
            this.level0,
            this.level1
        ][n].call(this);
    };
}

function end(text, color = "red") {
    Graphics.add(new Title(text, color));
}

Game.prototype.level0 = function () {
    Graphics.stop();

    function Tmp(x, y) {
        this.ax = x;
        this.ay = y;
        this.x = x;
        this.y = y;
        this.alpha = 1.0;
        this.color = "black";
        const that = this;

        this.update = function () {
            this.shape = {
                rectangles: [
                    {width: 8, height: 8, color: that.color}
                ],
                bounds: [
                    {width: 8, height: 8}
                ]
            };
            this.x = Graphics.center.x + that.ax;
            this.y = Graphics.center.y + that.ay;
            this.color = "black";

        };
        this.collision = function () {
            this.color = "blue";
        }
    }

    for (let i = -10; i < 10; i++) {
        for (let j = -10; j < 10; j++) {
            Graphics.add(new Tmp(10 * i, 100 + 10 * j));
        }
    }

    const player = new Player(-100, 200);
    const p1 = new Platform(-50, 350, 300, 20);

    let i = 0;

    function spawn(x, y) {
        const p = new Platform(x, y, Math.random() * 150 + 150, 20);
        const enemy = new Enemy(x, y - 50, player);
        Graphics.add(p);
        if (!i++) {
            Graphics.add(enemy);
        }
    }

    let int = setInterval(checkState, 100);
    spawn(400, 50);
    spawn(650, 250);
    spawn(220, 170);
    spawn(600, -100);
    spawn(200, -150);
    spawn(350, 400);
    spawn(-100, 0);

    function checkState() {
        if (!Graphics.sprites.includes(player)) {
            end("Game Over", "red");
            clearInterval(int);
        }
        let done = true;
        Graphics.sprites.forEach(s => {
            if (s.id === "Enemy") {
                done = false;
            }
        });
        if (done) {
            end("Victory", "green");
            clearInterval(int);
        }
    }

    const ground = new Barrier(0, 750, 3000, 200);
    const hill1 = new Barrier(200, 700, 300, 300);
    const hill2 = new Barrier(700, 700, 220, 300);
    const hill3 = new Barrier(-300, 700, 220, 300);
    const wall1 = new Barrier(-800, 0, 800, 2000);
    const wall2 = new Barrier(1200, 0, 800, 2000);
    const roof = new Barrier(0, -800, 3000, 800);
    Graphics.background = "lightblue";
    Graphics.center = player.center;
    Graphics.add(Gravity, p1, player, ground, wall1, wall2, roof, hill1, hill2, hill3);
};

Game.prototype.level1 = function reload() {
    Graphics.stop();

    const intro = new Intro("BlockShooter");
    const player = new Player(-50, 315);
    const p1 = new Platform(-50, 350, 200, 20);

    function spawn(x, y) {
        const p = new Platform(x, y, Math.random() * 150 + 150, 20);
        const enemy = new Enemy(x, y - 35, player);
        Graphics.add(p, enemy);
    }

    spawn(400, 50);
    spawn(650, 250);
    spawn(220, 170);
    spawn(600, -100);
    spawn(200, -150);
    spawn(300, 400);
    spawn(-100, 0);

    let paused = false;
    let over = false;

    function checkState() {
        if (over && action['r']) {
            clearInterval(int);
            over = true;
            reload();
            Graphics.start(fps);
        }
        else if (!over) {
            if (action['p'] && !paused) {
                paused = true;
                Graphics.add(new Intro("Paused"));
                Graphics.after(1, () => paused = false);
            }
            if (!Graphics.sprites.includes(player)) {
                end("Game Over", "red");
                over = true;
            }
            let done = true;
            Graphics.sprites.forEach(s => {
                if (s.id === "Enemy") {
                    done = false;
                }
            });
            if (done) {
                end("Victory", "green");
                over = true;
            }
        }
    }

    let int = setInterval(checkState, 100);

    const ground = new Barrier(0, 750, 3000, 200);
    const hill1 = new Barrier(200, 700, 300, 300);
    const hill2 = new Barrier(700, 700, 220, 300);
    const hill3 = new Barrier(-300, 700, 220, 300);
    const wall1 = new Barrier(-800, 0, 800, 2000);
    const wall2 = new Barrier(1200, 0, 800, 2000);
    const roof = new Barrier(0, -800, 3000, 800);

    Graphics.center = player.center;
    Graphics.add(Gravity, p1, player, ground, wall1, wall2, roof, hill1, hill2, hill3, intro, new Background());
};