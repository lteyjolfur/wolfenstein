import { test } from "node:test";
import assert from "node:assert/strict";
import { isWall, resolveCollision, wrapAngle } from "../src/logic.js";

// 4x4 test map, 10-unit cells:
// 1 1 1 1
// 1 0 0 1
// 1 0 1 1
// 1 1 1 1
const map = {
  x: 4,
  y: 4,
  gridSize: 10,
  map: [
    1, 1, 1, 1,
    1, 0, 0, 1,
    1, 0, 1, 1,
    1, 1, 1, 1,
  ],
};

test("isWall reports open floor cells as free", () => {
  assert.equal(isWall(map, 15, 15), false);
  assert.equal(isWall(map, 25, 15), false);
  assert.equal(isWall(map, 15, 25), false);
});

test("isWall reports border and interior wall cells as walls", () => {
  assert.equal(isWall(map, 5, 5), true);
  assert.equal(isWall(map, 35, 15), true);
  assert.equal(isWall(map, 25, 25), true);
});

test("isWall uses floor() so cell boundaries belong to the next cell", () => {
  assert.equal(isWall(map, 9.999, 15), true);
  assert.equal(isWall(map, 10, 15), false);
  assert.equal(isWall(map, 19.999, 25), false);
  assert.equal(isWall(map, 20, 25), true);
});

test("resolveCollision allows a move into free space", () => {
  assert.deepEqual(resolveCollision(map, 18, 12, 15, 15), { x: 18, y: 12 });
});

test("resolveCollision slides along x when only the y move is blocked", () => {
  // Moving up-right into the top wall: the y move is blocked, the x move is free.
  assert.deepEqual(resolveCollision(map, 18, 5, 15, 15), { x: 18, y: 15 });
});

test("resolveCollision slides along y when only the x move is blocked", () => {
  // Moving left into the west wall while also moving down inside column 1.
  assert.deepEqual(resolveCollision(map, 5, 22, 15, 15), { x: 15, y: 22 });
});

test("resolveCollision reverts both axes when cornered", () => {
  // Diagonal into the top-left corner: both single-axis moves are blocked too.
  assert.deepEqual(resolveCollision(map, 5, 5, 15, 15), { x: 15, y: 15 });
});

test("wrapAngle leaves in-range angles untouched", () => {
  assert.equal(wrapAngle(0), 0);
  assert.equal(wrapAngle(Math.PI), Math.PI);
  assert.equal(wrapAngle(2 * Math.PI), 2 * Math.PI);
});

test("wrapAngle brings negative and over-full angles back into [0, 2PI]", () => {
  assert.ok(Math.abs(wrapAngle(-0.1) - (2 * Math.PI - 0.1)) < 1e-12);
  assert.ok(Math.abs(wrapAngle(2 * Math.PI + 0.1) - 0.1) < 1e-12);
});
