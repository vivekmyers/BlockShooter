window.onload = main;

function main() {
    const g = new Game();
    g.load(1);
    window.fps = 60;
    Graphics.start(fps);
}