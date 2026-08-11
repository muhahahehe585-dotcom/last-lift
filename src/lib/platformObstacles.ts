const floorY = 520;

export function holesFor(floor: number) {
  return [620 + (floor % 3) * 80, 1540 + (floor % 4) * 55].map((x, index) => ({
    id: `hole-${floor}-${index}`,
    x,
    y: floorY,
    width: 92,
    height: 80,
  }));
}

export function boxesFor(floor: number) {
  return [300, 560, 850, 1120, 1390, 1660, 1960, 2180].map((x, index) => ({
    id: `lava-box-${floor}-${index}`,
    x,
    y: floorY - (index % 2 === 0 ? 58 : 86),
    width: 100,
    height: index % 2 === 0 ? 58 : 86,
  }));
}
