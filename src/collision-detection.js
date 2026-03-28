/*

There is 7 unique cases of shapes collision:
[] - []
O - O
/\ - /\
O - []
O - /\
[] - /\

There will be a function for each case,
so we don't waste performance on switch-case

*/

/* Using SAT. Storing values in seperate variables (not lists) for performance */
export function collideSquares(posAX, posAY, posBX, posBY, halfSize, rotationA, rotationB) {
    const cosA = Math.cos(rotationA);
    const sinA = Math.sin(rotationA);
    const cosB = Math.cos(rotationB);
    const sinB = Math.sin(rotationB);

    // Local axises for each square
    const localAxisA1x = cosA;
    const localAxisA1y = sinA;
    const localAxisA2x = -sinA;
    const localAxisA2y = cosA;

    const localAxisB1x = cosB;
    const localAxisB1y = sinB;
    const localAxisB2x = -sinB;
    const localAxisB2y = cosB;

    // Vector between centers of squares
    const AtoBvectorX = posBX - posAX;
    const AtoBvectorY = posBY - posAY;
    
    // Projection of vector to local A axises
    const localProjectionAx = AtoBvectorX * localAxisA1x + AtoBvectorY * localAxisA1y;
    const localProjectionAy = AtoBvectorX * localAxisA2x + AtoBvectorY * localAxisA2y;

    // Rotation matrix
    // RMatrix[i][j] = dot(AxisA[i], AxisB[j])
    const RMatrix00 = localAxisA1x * localAxisB1x + localAxisA1y * localAxisB1y;
    const RMatrix01 = localAxisA1x * localAxisB2x + localAxisA1y * localAxisB2y;
    const RMatrix10 = localAxisA2x * localAxisB1x + localAxisA2y * localAxisB1y;
    const RMatrix11 = localAxisA2x * localAxisB2x + localAxisA2y * localAxisB2y;

    const absRMatrix00 = Math.abs(RMatrix00);
    const absRMatrix01 = Math.abs(RMatrix01);
    const absRMatrix10 = Math.abs(RMatrix10);
    const absRMatrix11 = Math.abs(RMatrix11);

    let overlap;
    let minOverlap = Infinity;
    let normalX = 0;
    let normalY = 0;

    // SAT
    overlap = halfSize + halfSize * (absRMatrix00 + absRMatrix01) - Math.abs(localProjectionAx);
    if (overlap < 0) return false;
    if (overlap < minOverlap) { // find normal
        minOverlap = overlap;
        normalX = localAxisA1x;
        normalY = localAxisA1y;
        if (localProjectionAx < 0) { normalX = -normalX; normalY = -normalY; }
    }

    overlap = halfSize + halfSize * (absRMatrix10 + absRMatrix11) - Math.abs(localProjectionAy);
    if (overlap < 0) return false;
    if (overlap < minOverlap) { // find normal
        minOverlap = overlap;
        normalX = localAxisA2x;
        normalY = localAxisA2y;
        if (localProjectionAy < 0) { normalX = -normalX; normalY = -normalY; }
    }

    // Projection of vector to local B axises
    const localProjectionBx = localProjectionAx * RMatrix00 + localProjectionAy * RMatrix10;
    overlap = halfSize + halfSize * (absRMatrix00 + absRMatrix10) - Math.abs(localProjectionBx);
    if (overlap < 0) return false;
    if (overlap < minOverlap) { // find normal
        minOverlap = overlap;
        normalX = localAxisB1x;
        normalY = localAxisB1y;
        if (localProjectionBx < 0) { normalX = -normalX; normalY = -normalY; }
    }
    const localProjectionBy = localProjectionAx * RMatrix01 + localProjectionAy * RMatrix11;
    overlap = halfSize + halfSize * (absRMatrix01 + absRMatrix11) - Math.abs(localProjectionBy);
    if (overlap < 0) return false;
    if (overlap < minOverlap) { // find normal
        minOverlap = overlap;
        normalX = localAxisB2x;
        normalY = localAxisB2y;
        if (localProjectionBy < 0) { normalX = -normalX; normalY = -normalY; }
    }

    // If collision, return normal and penetration for resolving
    return {normalX, normalY, minOverlap};
}

export function collideCircles(posAX, posAY, posBX, posBY, diameter) {
    const AtoBvectorX = posBX - posAX;
    const AtoBvectorY = posBY - posAY;

    // We could compare square of distance but we need real distance for correct resolving
    const distance = Math.sqrt(AtoBvectorX * AtoBvectorX + AtoBvectorY * AtoBvectorY);
    const penetration = diameter - distance;
    if (penetration < 0) return false;

    const normalX = AtoBvectorX / distance;
    const normalY = AtoBvectorY / distance;

    return {normalX, normalY, penetration}
}

export function collideCircleSquare(posCircleX, posCircleY, posSquareX, posSquareY, halfSize, squareRotation) {
    const cos = Math.cos(squareRotation);
    const sin = Math.sin(squareRotation);

    const distanceX = posCircleX - posSquareX;
    const distanceY = posCircleY - posSquareY;
    
    // Translate circle center to local square axises
    const localPosCircleX = distanceX * cos + distanceY * sin;
    const localPosCircleY = -distanceX * sin + distanceY * cos;

    // Closest point of square to circle center
    const closestPointX = Math.min(Math.max(localPosCircleX, -halfSize), halfSize);
    const closestPointY = Math.min(Math.max(localPosCircleY, -halfSize), halfSize);

    const localDistanceX = localPosCircleX - closestPointX;
    const localDistanceY = localPosCircleY - closestPointY;
    // We could compare square of distance but we need real distance for correct resolving
    const localDistance = Math.sqrt(localDistanceX * localDistanceX + localDistanceY * localDistanceY);
    if (localDistance > halfSize) return false;

    if (localDistance === 0) {
        return {
            normalX: cos,
            normalY: sin,
            penetration: halfSize
        };
    }

    const normalXRotated = localDistanceX / localDistance;
    const normalYRotated = localDistanceY / localDistance;

    const normalX = normalXRotated * cos - normalYRotated * sin;
    const normalY = normalXRotated * sin + normalYRotated * cos;

    const penetration = halfSize - localDistance;

    return {normalX: -normalX, normalY: -normalY, penetration};
}

/* Collisions with canvas bounds */

export function boundSquare(posX, posY, halfSize, rotation, width, height) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    
    const hX = Math.abs(halfSize * cos) + Math.abs(halfSize * sin);
    const hY = Math.abs(halfSize * sin) + Math.abs(halfSize * cos);

    const minX = posX - hX;
    const maxX = posX + hX;
    const minY = posY - hY;
    const maxY = posY + hY;

    let boundX = 1, boundY = 1;
    if (minX <= 0) boundX = -1;
    if (maxX >= width) boundX = -1;
    if (minY <= 0) boundY = -1;
    if (maxY >= height) boundY = -1;

    if (boundX > 0 && boundY > 0)
    {
        return false;
    }
    else
    {
        const penetrationLeft = Math.max(0, -minX);
        const penetrationRight = Math.max(0, maxX - width);
        const penetrationTop = Math.max(0, -minY);
        const penetrationBottom = Math.max(0, maxY - height);

        let penetrationX = 0;
        let penetrationY = 0;

        if (penetrationLeft > 0)   penetrationX = penetrationLeft;
        if (penetrationRight > 0)  penetrationX = -penetrationRight;

        if (penetrationTop > 0)    penetrationY = penetrationTop;
        if (penetrationBottom > 0) penetrationY = -penetrationBottom;

        return {boundX, boundY, penetrationX, penetrationY};
    }
}

export function boundCircle(posX, posY, radius, width, height) {
    let boundX = 1, boundY = 1;
    if (posX - radius <= 0) boundX = -1;
    if (posX + radius >= width) boundX = -1;
    if (posY - radius <= 0) boundY = -1;
    if (posY + radius >= height) boundY = -1;

    if (boundX > 0 && boundY > 0)
    {
        return false;
    }
    else
    {
        const penetrationLeft = Math.max(0, radius - posX);
        const penetrationRight = Math.max(0, posX + radius - width);
        const penetrationTop = Math.max(0, radius - posY);
        const penetrationBottom = Math.max(0, posY + radius - height);

        let penetrationX = 0;
        let penetrationY = 0;

        if (penetrationLeft > 0)   penetrationX = penetrationLeft;
        if (penetrationRight > 0)  penetrationX = -penetrationRight;

        if (penetrationTop > 0)    penetrationY = penetrationTop;
        if (penetrationBottom > 0) penetrationY = -penetrationBottom;

        return {boundX, boundY, penetrationX, penetrationY};
    }
}



/* Triangles */
/* SAT */
export function collideTriangles(posAX, posAY, posBX, posBY, halfSize, rotationA, rotationB) {

    const cosA = Math.cos(rotationA);
    const sinA = Math.sin(rotationA);
    const cosB = Math.cos(rotationB);
    const sinB = Math.sin(rotationB);

    const A0x = posAX + cosA * halfSize;
    const A0y = posAY + sinA * halfSize;

    const A1x = posAX + Math.cos(rotationA + 2.0943951023931953) * halfSize;
    const A1y = posAY + Math.sin(rotationA + 2.0943951023931953) * halfSize;

    const A2x = posAX + Math.cos(rotationA + 4.1887902047863905) * halfSize;
    const A2y = posAY + Math.sin(rotationA + 4.1887902047863905) * halfSize;

    const B0x = posBX + cosB * halfSize;
    const B0y = posBY + sinB * halfSize;

    const B1x = posBX + Math.cos(rotationB + 2.0943951023931953) * halfSize;
    const B1y = posBY + Math.sin(rotationB + 2.0943951023931953) * halfSize;

    const B2x = posBX + Math.cos(rotationB + 4.1887902047863905) * halfSize;
    const B2y = posBY + Math.sin(rotationB + 4.1887902047863905) * halfSize;

    let minOverlap = Infinity;
    let normalX = 0;
    let normalY = 0;

    function testAxis(axisX, axisY) {
        const length = Math.hypot(axisX, axisY);
    if (length === 0) return true;

    axisX /= length;
    axisY /= length;

        let minA = Infinity;
        let maxA = -Infinity;

        let projection = A0x * axisX + A0y * axisY;
        minA = maxA = projection;

        projection = A1x * axisX + A1y * axisY;
        if (projection < minA) minA = projection;
        if (projection > maxA) maxA = projection;

        projection = A2x * axisX + A2y * axisY;
        if (projection < minA) minA = projection;
        if (projection > maxA) maxA = projection;

        let minB = Infinity;
        let maxB = -Infinity;

        projection = B0x * axisX + B0y * axisY;
        minB = maxB = projection;

        projection = B1x * axisX + B1y * axisY;
        if (projection < minB) minB = projection;
        if (projection > maxB) maxB = projection;

        projection = B2x * axisX + B2y * axisY;
        if (projection < minB) minB = projection;
        if (projection > maxB) maxB = projection;

        const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
        if (overlap < 0) return false;

        if (overlap < minOverlap) {
            minOverlap = overlap;
            normalX = axisX;
            normalY = axisY;

            const centerVectorX = posBX - posAX;
            const centerVectorY = posBY - posAY;

            if (centerVectorX * normalX + centerVectorY * normalY < 0) {
                normalX = -normalX;
                normalY = -normalY;
            }
        }

        return true;
    }

    let edgeX = A1x - A0x;
    let edgeY = A1y - A0y;
    if (!testAxis(-edgeY, edgeX)) return false;

    edgeX = A2x - A1x;
    edgeY = A2y - A1y;
    if (!testAxis(-edgeY, edgeX)) return false;

    edgeX = A0x - A2x;
    edgeY = A0y - A2y;
    if (!testAxis(-edgeY, edgeX)) return false;

    edgeX = B1x - B0x;
    edgeY = B1y - B0y;
    if (!testAxis(-edgeY, edgeX)) return false;

    edgeX = B2x - B1x;
    edgeY = B2y - B1y;
    if (!testAxis(-edgeY, edgeX)) return false;

    edgeX = B0x - B2x;
    edgeY = B0y - B2y;
    if (!testAxis(-edgeY, edgeX)) return false;

    return { normalX, normalY, minOverlap };
}

export function boundTriangle(posX, posY, halfSize, rotation, width, height) {
    const angles = [
        rotation,
        rotation + (2 * Math.PI / 3),
        rotation + (4 * Math.PI / 3)
    ];

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < 3; ++i) {
        const x = posX + halfSize * Math.cos(angles[i]);
        const y = posY + halfSize * Math.sin(angles[i]);

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    let boundX = 1, boundY = 1;
    if (minX <= 0) boundX = -1;
    if (maxX >= width) boundX = -1;
    if (minY <= 0) boundY = -1;
    if (maxY >= height) boundY = -1;

    if (boundX > 0 && boundY > 0) {
        return false;
    } else {
        const penetrationLeft   = Math.max(0, -minX);
        const penetrationRight  = Math.max(0, maxX - width);
        const penetrationTop    = Math.max(0, -minY);
        const penetrationBottom = Math.max(0, maxY - height);

        let penetrationX = 0;
        let penetrationY = 0;

        if (penetrationLeft > 0)   penetrationX = penetrationLeft;
        if (penetrationRight > 0)  penetrationX = -penetrationRight;

        if (penetrationTop > 0)    penetrationY = penetrationTop;
        if (penetrationBottom > 0) penetrationY = -penetrationBottom;

        return { boundX, boundY, penetrationX, penetrationY };
    }
}