(function load() {
    let can = document.getElementById("game");
    can.width = 800;
    can.height = 600;
    const graphics = document.createElement("script");
    graphics.src = "https://rawgit.com/vivekmyers/BlockShooter/master/graphics.js";
    const sprites = document.createElement("script");
    sprites.src = "https://rawgit.com/vivekmyers/BlockShooter/master/sprites.js";
    const game = document.createElement("script");
    game.src = "https://rawgit.com/vivekmyers/BlockShooter/master/game.js";
    const run = document.createElement("script");
    run.src = "https://rawgit.com/vivekmyers/BlockShooter/master/main.js";
    document.head.appendChild(graphics);
    document.head.appendChild(sprites);
    document.head.appendChild(game);
    document.head.appendChild(run);
    window.onload = main;
})();