import { useEffect, useRef } from 'react';

type LightningIconProps = {
  src: string;
};

const sourceCrop = {
  x: 455,
  y: 150,
  width: 470,
  height: 565,
};

export function LightningIcon({ src }: LightningIconProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const image = new Image();
    image.src = src;
    image.onload = () => drawCleanIcon(ctx, image, canvas.width, canvas.height);
  }, [src]);

  return <canvas className="lightning-icon" ref={canvasRef} width={64} height={64} aria-hidden="true" />;
}

function drawCleanIcon(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const temp = document.createElement('canvas');
  temp.width = width;
  temp.height = height;
  const tempCtx = temp.getContext('2d');
  if (!tempCtx) return;
  tempCtx.drawImage(image, sourceCrop.x, sourceCrop.y, sourceCrop.width, sourceCrop.height, 0, 0, width, height);
  const pixels = tempCtx.getImageData(0, 0, width, height);
  removeCheckerPixels(pixels.data);
  ctx.fillStyle = '#020302';
  ctx.fillRect(0, 0, width, height);
  tempCtx.putImageData(pixels, 0, 0);
  ctx.drawImage(temp, 0, 0);
}

function removeCheckerPixels(data: Uint8ClampedArray) {
  for (let index = 0; index < data.length; index += 4) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const looksLikeChecker = max - min < 34 && max > 42 && max < 185;
    if (looksLikeChecker) data[index + 3] = 0;
  }
}
