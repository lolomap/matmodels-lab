import * as collision from './collision-detection.js';

let total = 0;
let size = 0;
let halfSize = 0;
let width = 0, height = 0;

/* Components */
export let posX;
export let posY;
export let prevPosX; // interpolation
export let prevPosY; // interpolation
let velocityX;
let velocityY;
export let rotation;
let rotationVelocity;
export let color;
// let squareHalfSize;
// let circleRadius;

/* Entities */
export let squares; export let squaresCount;
export let circles; export let circlesCount;
export let triangles; export let trianglesCount; // Why we still here? Just to suffer? Triangles are the worst

export function init(entitiesCount, shapeSize, maxX, maxY, minSpeed, maxSpeed, minAngleSpeed, maxAngleSpeed) {
    total = entitiesCount;
    size = shapeSize;
    halfSize = shapeSize / 2;
    width = maxX;
    height = maxY;

    posX = new Float32Array(entitiesCount);
    posY = new Float32Array(entitiesCount);
    prevPosX = new Float32Array(entitiesCount);
    prevPosY = new Float32Array(entitiesCount);
    velocityX = new Float32Array(entitiesCount);
    velocityY = new Float32Array(entitiesCount);
    rotation = new Float32Array(entitiesCount);
    rotationVelocity = new Float32Array(entitiesCount);
    color = new Uint32Array(entitiesCount);
    // squareHalfSize = new Uint8Array(entitiesCount);
    // circleRadius = new Uint8Array(entitiesCount);

    squares = new Uint32Array(entitiesCount); squaresCount = 0;
    circles = new Uint32Array(entitiesCount); circlesCount = 0;
    triangles = new Uint32Array(entitiesCount); trianglesCount = 0;

    initShapes(minSpeed, maxSpeed, minAngleSpeed, maxAngleSpeed);

    console.log('created %d shapes', entitiesCount);
}

function initShapes(minSpeed, maxSpeed, minAngleSpeed, maxAngleSpeed) {
    console.log('respawning...');
    for (let entityId = 0; entityId < total; entityId++) {
        posX[entityId] = halfSize + Math.floor(Math.random() * (width - size));
        posY[entityId] = halfSize + Math.floor(Math.random() * (height - size));

        const velocityAngle = Math.random() * Math.PI * 2;
        const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        const angleSpeed = minAngleSpeed + Math.random() * (maxAngleSpeed - minAngleSpeed);

        velocityX[entityId] = Math.cos(velocityAngle) * speed;
        velocityY[entityId] = Math.sin(velocityAngle) * speed;

        rotationVelocity[entityId] = (Math.random() < 0.5 ? -1 : 1) * angleSpeed;

        color[entityId] = Math.floor(Math.random() * 0xFFFFFF);

        const shapeType = Math.floor(Math.random() * 2);
        switch (shapeType) {
            case 0:
                addSquare(entityId);
                break;
            case 1:
                addCircle(entityId);
                break;
            case 2:
                addTriangle(entityId);
                break;
        }
    }
}

function addSquare(entity) {
    //squareHalfSize[entity] = halfSize;
    squares[squaresCount] = entity;
    squaresCount++;
}

function addCircle(entity) {
    //circleRadius[entity] = radius;
    circles[circlesCount] = entity;
    circlesCount++;
}

function addTriangle(entity) {
    triangles[trianglesCount] = entity;
    trianglesCount++;
}


/* Systems */

export function systems(deltaTime) {
    move(deltaTime);
    collide();
}

function move(deltaTime) {
    for (let entityId = 0; entityId < total; entityId++) {
        prevPosX[entityId] = posX[entityId];
        prevPosY[entityId] = posY[entityId];

        posX[entityId] += velocityX[entityId] * deltaTime;
        posY[entityId] += velocityY[entityId] * deltaTime;
    }

    for (let i = 0; i < squaresCount; i++) {
        const entityId = squares[i];
        rotation[entityId] += rotationVelocity[entityId] * deltaTime;
        if (rotation[entityId] >= 360 || rotation[entityId] <= -360) rotation[entityId] %= 360;
    }

    for (let i = 0; i < trianglesCount; i++) {
        const entityId = triangles[i];
        rotation[entityId] += rotationVelocity[entityId] * deltaTime;
        if (rotation[entityId] >= 360 || rotation[entityId] <= -360) rotation[entityId] %= 360;
    }
}

function collide() {
    for (let i = 0; i < squaresCount; i++) {
        const A = squares[i];
        const posAX = posX[A];
        const posAY = posY[A];
        const rotationA = rotation[A];

        for (let j = i+1; j < squaresCount; j++) {
            const B = squares[j];
            const posBX = posX[B];
            const posBY = posY[B];
            const rotationB = rotation[B];

            const result = collision.collideSquares(posAX, posAY, posBX, posBY, halfSize, rotationA, rotationB);
            if (result)
            {
                const { normalX, normalY, minOverlap } = result;
                const correctionX = normalX * minOverlap * 0.5;
                const correctionY = normalY * minOverlap * 0.5;
                posX[A] -= correctionX;
                posY[A] -= correctionY;
                posX[B] += correctionX;
                posY[B] += correctionY;

                const tempX = velocityX[A];
                const tempY = velocityY[A];
                velocityX[A] = velocityX[B];
                velocityY[A] = velocityY[B];
                velocityX[B] = tempX;
                velocityY[B] = tempY;
            }
        }

        const result = collision.boundSquare(posAX, posAY, halfSize, rotationA, width, height);
        if (result) {
            const {boundX, boundY, penetrationX, penetrationY} = result;
            posX[A] += penetrationX;
            posY[A] += penetrationY;
            velocityX[A] *= boundX;
            velocityY[A] *= boundY; 
        }
    }

    for (let i = 0; i < circlesCount; i++) {
        const A = circles[i];
        const posAX = posX[A];
        const posAY = posY[A];

        for (let j = i + 1; j < circlesCount; j++) {
            const B = circles[j];
            const posBX = posX[B];
            const posBY = posY[B];

            const result = collision.collideCircles(posAX, posAY, posBX, posBY, size);
            if (result) {
                const { normalX, normalY, penetration } = result;
                const correctionX = normalX * penetration * 0.5;
                const correctionY = normalY * penetration * 0.5;
                posX[A] -= correctionX;
                posY[A] -= correctionY;
                posX[B] += correctionX;
                posY[B] += correctionY;

                const tempX = velocityX[A];
                const tempY = velocityY[A];
                velocityX[A] = velocityX[B];
                velocityY[A] = velocityY[B];
                velocityX[B] = tempX;
                velocityY[B] = tempY;
            }
        }

        // different entities, so start from 0 but not i+1
        for (let j = 0; j < squaresCount; j++) {
            const S = squares[j];
            const posSX = posX[S];
            const posSY = posY[S];
            const rotationS = rotation[S];

            const result = collision.collideCircleSquare(posAX, posAY, posSX, posSY, halfSize, rotationS);
            if (result) {
                const { normalX, normalY, penetration } = result;
                const correctionX = normalX * penetration * 0.5;
                const correctionY = normalY * penetration * 0.5;
                posX[A] -= correctionX;
                posY[A] -= correctionY;
                posX[S] += correctionX;
                posY[S] += correctionY;

                const tempX = velocityX[A];
                const tempY = velocityY[A];
                velocityX[A] = velocityX[S];
                velocityY[A] = velocityY[S];
                velocityX[S] = tempX;
                velocityY[S] = tempY;
            }
        }

        const result = collision.boundCircle(posAX, posAY, halfSize, width, height);
        if (result) {
            const {boundX, boundY, penetrationX, penetrationY} = result;
            posX[A] += penetrationX;
            posY[A] += penetrationY;
            velocityX[A] *= boundX;
            velocityY[A] *= boundY; 
        }
    }

    for (let i = 0; i < trianglesCount; i++) {
        const A = triangles[i];
        const posAX = posX[A];
        const posAY = posY[A];
        const rotationA = rotation[A];

        for (let j = i+1; j < trianglesCount; j++) {
            const B = triangles[j];
            const posBX = posX[B];
            const posBY = posY[B];
            const rotationB = rotation[B];

            const result = collision.collideTriangles(posAX, posAY, posBX, posBY, halfSize, rotationA, rotationB);
            if (result)
            {
                const { normalX, normalY, minOverlap } = result;
                const correctionX = normalX * minOverlap * 0.5;
                const correctionY = normalY * minOverlap * 0.5;
                posX[A] -= correctionX;
                posY[A] -= correctionY;
                posX[B] += correctionX;
                posY[B] += correctionY;

                const tempX = velocityX[A];
                const tempY = velocityY[A];
                velocityX[A] = velocityX[B];
                velocityY[A] = velocityY[B];
                velocityX[B] = tempX;
                velocityY[B] = tempY;
            }
        }

        const result = collision.boundTriangle(posAX, posAY, halfSize, rotationA, width, height);
        if (result) {
            const {boundX, boundY, penetrationX, penetrationY} = result;
            posX[A] += penetrationX;
            posY[A] += penetrationY;
            velocityX[A] *= boundX;
            velocityY[A] *= boundY; 
        }
    }
}