import {
  collideSquares,
  collideCircles,
  collideCircleSquare,
  boundSquare,
  boundCircle,
} from '../src/collision-detection.js';

describe('collideSquares', () => {
  const halfSize = 10;

  test('объекты не касаются', () => {
    expect(
      collideSquares(0, 0, 50, 50, halfSize, 0, 0)
    ).toBe(false);
  });

  test('объекты касаются сторонами', () => {
    // расстояние по X = 2 * halfSize
    expect(
      collideSquares(0, 0, 20, 0, halfSize, 0, 0)
    ).not.toBe(false);
  });

  test('объекты касаются углами', () => {
    expect(
      collideSquares(0, 0, 20, 20, halfSize, 0, 0)
    ).not.toBe(false);
  });

  test('объекты пересекаются частично', () => {
    expect(
      collideSquares(0, 0, 15, 0, halfSize, 0, 0)
    ).not.toBe(false);
  });

  test('объект 1 внутри объекта 2', () => {
    expect(
      collideSquares(0, 0, 0, 0, halfSize, 0, 0)
    ).not.toBe(false);
  });

  test('объект 2 внутри объекта 1', () => {
    expect(
      collideSquares(0, 0, 5, 5, halfSize, 0, 0)
    ).not.toBe(false);
  });

  test('с учётом поворота', () => {
    expect(
      collideSquares(0, 0, 14, 0, halfSize, Math.PI / 4, 0)
    ).not.toBe(false);
  });
});

describe('collideCircles', () => {
  const diameter = 20;
  const radius = diameter / 2;

  test('объекты не касаются', () => {
    expect(
      collideCircles(0, 0, 50, 0, diameter)
    ).toBe(false);
  });

  test('объекты касаются сторонами', () => {
    expect(
      collideCircles(0, 0, 2 * radius, 0, diameter)
    ).not.toBe(false);
  });

  test('объекты пересекаются частично', () => {
    expect(
      collideCircles(0, 0, 15, 0, diameter)
    ).not.toBe(false);
  });

  test('объект 1 внутри объекта 2', () => {
    expect(
      collideCircles(0, 0, 0, 0, diameter)
    ).not.toBe(false);
  });

  test('объект 2 внутри объекта 1', () => {
    expect(
      collideCircles(0, 0, 5, 0, diameter)
    ).not.toBe(false);
  });
});

describe('collideCircleSquare', () => {
  const halfSize = 10;
  const diameter = 20;

  test('объекты не касаются', () => {
    expect(
      collideCircleSquare(50, 50, 0, 0, halfSize, 0)
    ).toBe(false);
  });

  test('касаются стороной', () => {
    expect(
      collideCircleSquare(20, 0, 0, 0, halfSize, 0)
    ).not.toBe(false);
  });

  test('касаются углом', () => {
    expect(
      collideCircleSquare(10, 20, 5, 5, halfSize, 0)
    ).not.toBe(false);
  });

  test('пересекаются частично', () => {
    expect(
      collideCircleSquare(15, 0, 0, 0, halfSize, 0)
    ).not.toBe(false);
  });

  test('круг внутри квадрата', () => {
    expect(
      collideCircleSquare(0, 0, 0, 0, halfSize, 0)
    ).not.toBe(false);
  });

  test('квадрат внутри круга', () => {
    expect(
      collideCircleSquare(0, 0, 0, 0, halfSize, 0)
    ).not.toBe(false);
  });

  test('с поворотом квадрата', () => {
    expect(
      collideCircleSquare(14, 0, 0, 0, halfSize, Math.PI / 4)
    ).not.toBe(false);
  });
});

describe('boundSquare', () => {
  const width = 100;
  const height = 100;
  const halfSize = 10;

  test('внутри границ', () => {
    expect(
      boundSquare(50, 50, halfSize, 0, width, height)
    ).toBe(false);
  });

  test('касается левой границы', () => {
    expect(
      boundSquare(10, 50, halfSize, 0, width, height)
    ).not.toBe(false);
  });

  test('касается правой границы', () => {
    expect(
      boundSquare(90, 50, halfSize, 0, width, height)
    ).not.toBe(false);
  });

  test('касается верхней границы', () => {
    expect(
      boundSquare(50, 10, halfSize, 0, width, height)
    ).not.toBe(false);
  });

  test('касается нижней границы', () => {
    expect(
      boundSquare(50, 90, halfSize, 0, width, height)
    ).not.toBe(false);
  });
});

describe('boundCircle', () => {
  const width = 100;
  const height = 100;
  const radius = 10;

  test('внутри границ', () => {
    expect(
      boundCircle(50, 50, radius, width, height)
    ).toBe(false);
  });

  test('касается левой границы', () => {
    expect(
      boundCircle(10, 50, radius, width, height)
    ).not.toBe(false);
  });

  test('касается правой границы', () => {
    expect(
      boundCircle(90, 50, radius, width, height)
    ).not.toBe(false);
  });

  test('касается верхней границы', () => {
    expect(
      boundCircle(50, 10, radius, width, height)
    ).not.toBe(false);
  });

  test('касается нижней границы', () => {
    expect(
      boundCircle(50, 90, radius, width, height)
    ).not.toBe(false);
  });
});