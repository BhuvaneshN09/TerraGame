export function paintObject(ctx, object, time) {
  const { x, y, width: w, height: h, kind } = object;
  const rect = (color, dx, dy, width, height) => { ctx.fillStyle = color; ctx.fillRect(x + dx, y + dy, width, height); };
  rect('#172327', 2, h - 1, w, 4);
  rect('#111f24', 0, 0, w, h);
  rect('#596c6a', 1, 1, w - 2, h - 3);
  rect('#85918a', 2, 1, w - 4, 2);
  rect('#344b4e', 3, 4, w - 6, h - 9);
  rect('#273b40', 2, h - 5, w - 4, 4);
  if (kind === 'machine') {
    rect('#102c31', 4, 4, w - 8, h - 10);
    rect('#81b3a0', 6, 5, w - 14, 1);
    rect('#416c65', 6, 7, w - 12, 1);
    rect('#d9a16b', 6, h - 5, 4, 2);
    rect('#d9a16b', w - 10, h - 5, 4, 2);
    rect(Math.floor(time * 2) % 2 ? '#e8bd73' : '#9a5f50', w - 6, 5, 2, 2);
  } else if (kind === 'console') {
    rect('#102c31', 4, 4, w - 8, h - 10);
    rect('#81b3a0', 6, 5, w - 17, 1);
    rect('#416c65', 6, 7, w - 12, 1);
    rect('#a0b58a', 5, h - 5, 3, 1);
    rect('#a0b58a', 10, h - 5, 3, 1);
    rect(Math.floor(time) % 3 ? '#d0dc8b' : '#617346', w - 6, h - 6, 2, 2);
  } else if (kind === 'zombie') {
    rect('#273b40', 3, 4, w - 6, h - 7);
    rect('#7b9b7a', 3, 6, w - 6, 13);
    rect('#b8d49a', 5, 7, 4, 5);
    rect('#18282a', 6, 9, 2, 2);
    rect('#b8d49a', w - 9, 7, 4, 5);
    rect('#18282a', w - 8, 9, 2, 2);
    rect('#56765f', 5, 19, w - 10, 5);
    rect('#935d50', 2, h - 8, 5, 8);
    rect('#935d50', w - 7, h - 8, 5, 8);
    rect('#c99a65', 4, h - 3, 5, 3);
    rect('#c99a65', w - 9, h - 3, 5, 3);
  } else if (kind === 'reactor') {
    rect('#718278', 8, 5, w - 16, h - 11);
    rect('#263b3b', 12, 8, w - 24, h - 17);
    rect('#111f26', 16, 12, w - 32, h - 25);
    rect('#597e78', 17, 14, w - 34, 2);
    for (let vent = 7; vent < h - 8; vent += 4) { rect('#172c32', 3, vent, 3, 2); rect('#172c32', w - 6, vent, 3, 2); }
    rect('#d69a63', w - 10, h - 6, 5, 2);
  } else if (kind === 'locker') {
    rect('#728780', 5, 5, w - 10, h - 12);
    rect('#293f43', w / 2, 5, 1, h - 12);
    rect('#b6c6ae', w / 2 - 5, 12, 10, 3);
    rect('#b6c6ae', w / 2 - 2, 9, 4, 9);
  } else if (kind === 'bunk') {
    rect('#182c33', 5, 5, w - 10, h - 12);
    rect('#708b85', 7, 7, w - 14, 9);
    rect('#456569', 7, 19, w - 14, h - 28);
    rect('#66817a', 8, 21, w - 16, 2);
    rect('#263e43', 5, h - 11, w - 10, 3);
  } else {
    rect('#7f7f64', 4, 4, w - 8, h - 10);
    rect('#b2ac7d', 5, 5, w - 10, 2);
    rect('#3a4c45', 8, 4, 3, h - 7);
    rect('#3a4c45', w - 11, 4, 3, h - 7);
    rect('#b9bea0', 13, 11, 6, 5);
  }
}

export function paintPlayer(ctx, player, time = 0) {
  const x = Math.round(player.x); const y = Math.round(player.y);
  const step = player.moving ? Math.floor(player.walkTime * 9) % 2 : 0;
  const bounce = player.moving ? 0 : Math.round(Math.sin(time * 4.5) * 1.5);
  const rect = (color, dx, dy, w, h) => { ctx.fillStyle = color; ctx.fillRect(x + dx, y + dy, w, h); };
  ctx.save(); ctx.translate(0, bounce);
  rect('#142428', -6, 3, 13, 3);
  rect('#182b31', -6, -9, 13, 11);
  rect('#ce8c58', -4, -7, 9, 10);
  rect('#e9b475', -4, -7, 9, 2);
  rect('#8d6550', -6, -5, 2, 7);
  rect('#e0a464', 5, -5, 2, 6);
  rect('#1b313a', -4, 2, 3, 3 + step);
  rect('#1b313a', 2, 2, 3, 4 - step);
  rect('#acb9ad', -4, -15, 9, 8);
  rect('#e2e4cf', -3, -15, 7, 2);
  rect('#2b5258', -4, -12, 10, 4);
  if (player.facing !== 'up') {
    rect('#91c4b5', player.facing === 'left' ? -4 : player.facing === 'right' ? 1 : -2, -12, 5, 2);
  } else { rect('#677e78', -4, -12, 9, 4); rect('#a8b6a8', -1, -11, 3, 2); }
  rect('#f0d3a1', -1, -5, 3, 3);
  rect('#2c4244', -4, 0, 9, 2);
  ctx.restore();
}
