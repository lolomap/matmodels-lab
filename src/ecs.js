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
let aabbMinX;
let aabbMaxX;
let aabbMinY;
let aabbMaxY;

/* Entities */
export let squares; export let squaresCount;
export let circles; export let circlesCount;
export let triangles; export let trianglesCount;

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
    aabbMinX = new Float32Array(entitiesCount);
    aabbMinY = new Float32Array(entitiesCount);
    aabbMaxX = new Float32Array(entitiesCount);
    aabbMaxY = new Float32Array(entitiesCount);

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
    aabb();
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

function aabb() {
    for (let i = 0; i < circlesCount; i++) {
        const id = circles[i]

        const x = posX[id]
        const y = posY[id]

        aabbMinX[id] = x - halfSize
        aabbMaxX[id] = x + halfSize
        aabbMinY[id] = y - halfSize
        aabbMaxY[id] = y + halfSize
    }

    for (let i = 0; i < squaresCount; i++) {
        const id = squares[i]

        const x = posX[id]
        const y = posY[id]

        const cos = Math.cos(rotation[id])
        const sin = Math.sin(rotation[id])

        const hX = Math.abs(halfSize*cos) + Math.abs(halfSize*sin)
        const hY = Math.abs(halfSize*sin) + Math.abs(halfSize*cos)

        aabbMinX[id] = x - hX
        aabbMaxX[id] = x + hX
        aabbMinY[id] = y - hY
        aabbMaxY[id] = y + hY
    }

    for (let i = 0; i < trianglesCount; i++) {
        const id = triangles[i]

        const x = posX[id]
        const y = posY[id]

        let minX = Infinity, maxX = -Infinity
        let minY = Infinity, maxY = -Infinity

        const r = rotation[id]

        for (let k=0;k<3;k++) {

            const angle = r + k*2.0943951023931953

            const vx = x + Math.cos(angle)*halfSize
            const vy = y + Math.sin(angle)*halfSize

            if (vx < minX) minX = vx
            if (vx > maxX) maxX = vx
            if (vy < minY) minY = vy
            if (vy > maxY) maxY = vy
        }

        aabbMinX[id] = minX
        aabbMaxX[id] = maxX
        aabbMinY[id] = minY
        aabbMaxY[id] = maxY
    }
}

function collide() {
    sortByMinX(squares, squaresCount)
    sortByMinX(circles, circlesCount)
    sortByMinX(triangles, trianglesCount)

    sweepSame(squares, squaresCount, collideSquares)
    sweepSame(circles, circlesCount, collideCircles)
    sweepSame(triangles, trianglesCount, collideTriangles)

    sweepPairs(circles, circlesCount, squares, squaresCount, collideCircleSquare)
    sweepPairs(circles, circlesCount, triangles, trianglesCount, collideCircleTriangle)
    sweepPairs(squares, squaresCount, triangles, trianglesCount, collideSquareTriangle)

    bounds();
}

/* Helpers */

function collideSquares(A, B) {
    const posAX = posX[A];
    const posAY = posY[A];
    const rotationA = rotation[A];

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

function collideCircles(A, B) {
    const posAX = posX[A];
    const posAY = posY[A];

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

function collideTriangles(A, B) {
    const posAX = posX[A];
    const posAY = posY[A];
    const rotationA = rotation[A];

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

function collideCircleSquare(C, S) {
    const posCX = posX[C];
    const posCY = posY[C];

    const posSX = posX[S];
    const posSY = posY[S];
    const rotationS = rotation[S];

    const result = collision.collideCircleSquare(posCX, posCY, posSX, posSY, halfSize, rotationS);
    if (result) {
        const { normalX, normalY, penetration } = result;
        const correctionX = normalX * penetration * 0.5;
        const correctionY = normalY * penetration * 0.5;
        posX[C] -= correctionX;
        posY[C] -= correctionY;
        posX[S] += correctionX;
        posY[S] += correctionY;

        const tempX = velocityX[C];
        const tempY = velocityY[C];
        velocityX[C] = velocityX[S];
        velocityY[C] = velocityY[S];
        velocityX[S] = tempX;
        velocityY[S] = tempY;
    }
}

function collideCircleTriangle(C, T) {

}

function collideSquareTriangle(S, T) {

}

function bounds() {
    for (let i = 0; i < squaresCount; i++) {
        const A = squares[i];
        const posAX = posX[A];
        const posAY = posY[A];
        const rotationA = rotation[A];

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

function sortByMinX(list, count) {

    for (let i = 1; i < count; i++) {
        const entity = list[i];
        let j = i-1;

        while (j >= 0 && aabbMinX[list[j]] > aabbMinX[entity]) {
            list[j+1] = list[j];
            j--;
        }

        list[j+1] = entity;
    }
}

function sweepSame(list, count, collideFn) {

    for (let i=0; i < count;i++) {

        const A = list[i];

        for (let j = i + 1; j < count; j++) {

            const B = list[j];

            if (aabbMinX[B] > aabbMaxX[A]) break;

            if (aabbMaxY[A] < aabbMinY[B] ||
                aabbMaxY[B] < aabbMinY[A])
                continue;

            collideFn(A,B);
        }
    }
}

function sweepPairs(listA,countA,listB,countB,collideFn){

    let jStart=0

    for(let i=0;i<countA;i++){

        const A=listA[i]

        while(jStart<countB && aabbMaxX[listB[jStart]]<aabbMinX[A]){
            jStart++
        }

        for(let j=jStart;j<countB;j++){

            const B=listB[j]

            if(aabbMinX[B]>aabbMaxX[A]) break

            if(aabbMaxY[A]<aabbMinY[B] ||
               aabbMaxY[B]<aabbMinY[A]) continue

            collideFn(A,B)
        }
    }
}