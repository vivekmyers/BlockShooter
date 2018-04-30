(function () {
    window.action = '';
    document.addEventListener('keydown', e => {
        window.action = e.key.toLowerCase();
    });

    document.addEventListener('keyup', () => {
        window.action = '';
    });
})();

Gravity = function () {
    let targets = [];
    return {
        apply: x => targets.push(x),
        update: function () {
            targets.forEach(s => {
                s.dy += 1000 / Graphics.step;
            });
        }
    }
}();

function Player(x, y) {
    Shooter.call(this, x, y);
    this.color = "darkblue";
    this.act = function () {
        if (action === 'd') {
            this.right();
        }
        else if (action === 'a') {
            this.left();
        }
        else if (action === '') {
            this.none();
        }
        else if (action === 'w') {
            this.jump();
        }
        else if (action === ' ') {
            this.shoot.call(this, Graphics.step);
        }
    };
}

Player.prototype = Object.create(Shooter.prototype);
Player.prototype.constructor = Player;
Player.prototype.die = function (o) {
    Shooter.prototype.die.call(this, o);
};

function Enemy(x, y, target) {
    Shooter.call(this, x, y);
    this.color = "darkred";
    this.id = "Enemy";
    let toAct = true;
    const execute = function () {
        if (Math.abs(this.y - target.y) < 30 &&
            this.scaleX * this.x < this.scaleX * target.x &&
            Graphics.sprites.includes(target))
            this.shoot(Graphics.step);
        switch (Math.floor(Math.random() * 5)) {
            case 0:
                this.right();
                break;
            case 1:
                this.left();
                break;
            case 2:
                this.jump();
                break;
            case 3:
                this.none();
                break;
            default:
                break;
        }
    };
    this.act = function () {
        if (toAct && Graphics.sprites.includes(this)) {
            execute.call(this);
            toAct = false;
            Graphics.after(0.5, () => toAct = true);
        }
    }
}

Enemy.prototype = Object.create(Shooter.prototype);
Enemy.prototype.constructor = Enemy;

function Shooter(x, y) {
    if (new.target === Shooter) {
        return new Object(undefined);
    }
    Gravity.apply(this);
    this.speed = 200;
    this.dy = 0;
    this.dx = 0;
    this.x = x;
    this.y = y;
    const that = this;
    this.center = {
        get x() {
            return that.x;
        },
        get y() {
            return that.y - 100
        }
    };
    this.alpha = 1.0;
    this.loaded = true;
    this.scaleX = 1;
    this.direction = 1;
    this.legPosition = 0;
    this.onGround = false;
    this.color = "black";
    this.start = this.reposition.bind(this, 0);
    this.right = function () {
        this.scaleX = 1;
        this.dx = this.speed;
    };
    this.left = function () {
        this.scaleX = -1;
        this.dx = -this.speed;
    };
    this.none = function () {
        this.dx = 0;
    };
    this.jump = function () {
        if (this.onGround)
            this.dy = -this.speed * 3.5;
    };
    this.shoot = function (step) {
        if (this.loaded) {
            this.loaded = false;
            Graphics.after.call(this, 1, () => this.loaded = true);
            const p = new Bullet(this.x + 22 * this.scaleX, this.y, this.dx + 400 * this.scaleX, (this.dy - 1000 / step) / 4);
            Graphics.add(p);
        }
    };
}

Shooter.prototype.reposition = function (x) {
    this.shape = {
        rectangles: [
            {width: 20, height: 4, y: 3, color: "tan"},
            {width: 6, height: 3, y: 2, x: 8, color: "black"},
            {width: 10, height: 10, y: 15, x: -8 - x / 2, color: "tan"},
            {width: 10, height: 10, y: 15, x: 5 - x / 2 * 0.8, color: "tan"},
            {width: 10, height: 20, y: -2.5, color: this.color},
            {width: 18, height: 18, y: -18, color: "tan"},
            {width: 3, height: 3, y: -12, x: -5, color: "black"},
            {width: 3, height: 3, y: -12, x: 5, color: "black"},
            {width: 18, height: 2, y: -18, color: "brown"},
            {width: 13.5, height: 2, y: -18.5, color: "brown"},
            {width: 9, height: 2, y: -19, color: "brown"}
        ]
    };
    this.shape.bounds = this.shape.rectangles;
};

Shooter.prototype.act = () => {
};

Shooter.prototype.update = function () {
    if (this.dx !== 0) {
        if (this.direction) {
            this.legPosition += this.direction * 50 / Graphics.step;
            this.reposition(this.legPosition);
            if (this.legPosition > 10 || this.legPosition < 0) {
                this.direction *= -1;
            }
        }
    }
    const that = this;
    this.act(Graphics.step);
    this.onGround = false;
};

Shooter.prototype.collision = function (o, t) {
    if (t === "Bullet") {
        this.die(o);
    }
    if (t === "Left") {
        if (this.dx > 0) {
            this.x -= this.dx / Graphics.step;
            this.dx = 0;
        }
    }
    if (t === "Right") {
        if (this.dx < 0) {
            this.x -= this.dx / Graphics.step;
            this.dx = 0;
        }
    }
    if (t === "Bottom") {
        if (this.dy < 0) {
            this.y -= this.dy / Graphics.step;
            this.dy = 0;
        }
    }
    if (t === "Ground") {
        this.onGround = true;
        this.y -= this.dy / Graphics.step;
        this.dy = 0;
    }
};

Shooter.prototype.die = function (o) {
    Graphics.explosion(o, "red");
    Graphics.delete(o, 0.5);
    this.dx = this.dx / 5 + o.dx / 20;
    this.dy = this.dy / 5;
    Graphics.toBack(Graphics.delete(this, 0.8));
};

function Title(text, color = "black") {
    this.content = text;
    this.alpha = 0.01;
    this.start = () => {
        Graphics.fade(this, 0.8, 3);
    };
    this.update = () => {
        Graphics.toFront(this);
    };
    this.shape = {
        rectangles: [
            {width: 2000, height: 2000, color: "lightblue"}
        ],
        text: [
            {string: text, color: color, size: 80, color: color}
        ]
    }
}

Title.prototype = {
    get x() {
        return Graphics.center.x - 20 * this.content.length;
    },
    get y() {
        return Graphics.center.y + 20;
    }
};

function Platform(x, y, width, height) {
    Barrier.call(this, x, y, width, height);
    this.x = x;
    this.y = y;
    this.alpha = 1.0;
    this.start = Graphics.blink.bind(null, this, 0.5);
    const colors = [
        "red",
        "green",
        "blue",
        "yellow",
        "purple",
        "white",
        "brown",
        "black",
        "violet",
        "cyan",
        "magenta"
    ];
    this.shape.rectangles[0].color = colors[Math.floor(Math.random() * colors.length)];
}

function Barrier(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.alpha = 1.0;
    this.shape = {
        rectangles: [
            {width: width, height: height, color: "gray"}
        ],
        bounds: [
            {width: width, height: height / 2, y: -height / 2, id: "Ground"},
            {width: width, height: height, id: "Barrier"},
            {width: width - 5, height: 5, y: -height / 2, id: "Top"},
            {width: width - 5, height: 5, y: height / 2, id: "Bottom"},
            {width: 5, height: height - 5, x: width / 2, id: "Right"},
            {width: 5, height: height - 5, x: -width / 2, id: "Left"}
        ]
    };
    const that = this;
    this.start = function () {
        Graphics.toFront(that);
    }
}

function Bullet(x, y, dx, dy) {
    this.id = "Bullet";
    this.dx = dx;
    this.dy = dy;
    this.x = x;
    this.y = y;
    this.alpha = 0.8;
    this.shape = {
        rectangles: [
            {width: 5, height: 5, color: "black"}
        ],
        bounds: [
            {width: 5, height: 5}
        ]
    };
    this.effect = function () {
        if (Graphics.sprites.includes(this)) {
            Graphics.explosion(this, "black", 0.03, 4);
            Graphics.after(0.02, this.effect.bind(this));
        }
    };
    this.update = function () {
        Graphics.explosion(this, "black", 0.03, 4);
    };
    this.start = function () {
        Graphics.after(2, () => Graphics.delete(this, 0.5));
    };
    this.collision = function (o, t) {
        if (t === "Barrier") {
            Graphics.delete(this, 0.1);
        }
    }
}