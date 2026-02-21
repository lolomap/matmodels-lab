import * as ecs from './ecs.js';
import * as render from './render.js';

let size, halfSize;
const TARGET_FPS = 60;
const gameState = {
    lastTick: performance.now(),
    tickLength: 1000 / TARGET_FPS,
    stopCycle: null
};

(function () {
    document.getElementById('restart').onclick = restart;
})();

function restart() {
    cancelAnimationFrame(gameState.stopCycle);

    size = document.getElementById('size').value;
    halfSize = size / 2;

    ecs.init(
        document.getElementById('total').value,
        size,
        render.canvasWidth,
        render.canvasHeight,
        document.getElementById('minSpeed').value,
        document.getElementById('maxSpeed').value,
        document.getElementById('minAngleSpeed').value,
        document.getElementById('maxAngleSpeed').value,
    );
    requestAnimationFrame(run);
}

function run(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame(run);

    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame >= nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
    }
    queueUpdates(numTicks);
    draw(tFrame);
    gameState.lastRender = tFrame;
}

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick = gameState.lastTick + gameState.tickLength;
        ecs.systems(gameState.tickLength / 1000);
    }
}

function draw(tFrame) {
    const alpha = (tFrame - gameState.lastTick) / gameState.tickLength;

    render.clear();
    
    for (let i = 0; i < ecs.squaresCount; i++) {
        const entityId = ecs.squares[i];

        // interpolate position (I really don't feel any difference)
        // const x = ecs.prevPosX[entityId] + (ecs.posX[entityId] - ecs.prevPosX[entityId]) * alpha;
        // const y = ecs.prevPosY[entityId] + (ecs.posY[entityId] - ecs.prevPosY[entityId]) * alpha;

        render.drawSquare(
            ecs.posX[entityId],
            ecs.posY[entityId],
            size,
            ecs.rotation[entityId],
            ecs.color[entityId]
        );
    }

    for (let i = 0; i < ecs.trianglesCount; i++) {
        const entityId = ecs.triangles[i];
        render.drawTriangle(
            ecs.posX[entityId],
            ecs.posY[entityId],
            size,
            ecs.rotation[entityId],
            ecs.color[entityId]
        )
    }

    render.reset();

    for (let i = 0; i < ecs.circlesCount; i++) {
        const entityId = ecs.circles[i];
        render.drawCircle(
            ecs.posX[entityId],
            ecs.posY[entityId],
            halfSize,
            ecs.color[entityId]
        )
    }
}