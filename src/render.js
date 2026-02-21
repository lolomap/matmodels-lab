const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;

const colorCache = new Map();

function colorToString(color) {
    let str = colorCache.get(color);
    if (!str) {
        str = "#" + color.toString(16).padStart(6, "0");
        colorCache.set(color, str);
    }
    return str;
}

export function clear() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
}

export function reset() {
    context.setTransform(1, 0, 0, 1, 0, 0);
}

export function drawSquare(posX, posY, size, rotation, color) {
    const rad = rotation * Math.PI / 180;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(posX, posY);
    context.rotate(rad);

    context.fillStyle = colorToString(color);
    context.fillRect(-size / 2, -size / 2, size, size);
}

export function drawCircle(posX, posY, radius, color) {
    context.beginPath();
    context.fillStyle = colorToString(color);
    context.arc(posX, posY, radius, 0, 2 * Math.PI);
    context.fill();
}

export function drawTriangle(posX, posY, size, rotation, color) {
    const rad = rotation * Math.PI / 180;
    const height = size * 0.866;//Math.sqrt(3) / 2;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(posX, posY);
    context.rotate(rad);

    context.fillStyle = colorToString(color);

    context.beginPath();
    context.moveTo(0, -height / 2);
    context.lineTo(-size / 2, height / 2);
    context.lineTo(size / 2, height / 2);
    context.closePath();

    context.fill();
}