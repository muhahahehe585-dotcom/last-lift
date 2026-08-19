import { useEffect, useState, type CSSProperties } from 'react';
import fallingElevatorUrl from '../../assets/falling-elevator.png';

type ElevatorDrop = {
  x: number;
  drift: number;
  rotation: number;
};

function randomDrop(): ElevatorDrop {
  return {
    x: 4 + Math.random() * 78,
    drift: -8 + Math.random() * 16,
    rotation: -9 + Math.random() * 10,
  };
}

export function FallingElevator() {
  const [drop, setDrop] = useState(randomDrop);
  const style = {
    '--elevator-x': `${drop.x}vw`,
    '--elevator-drift': `${drop.drift}vw`,
    '--elevator-rotation': `${drop.rotation}deg`,
  } as CSSProperties;

  useEffect(() => {
    const timer = window.setInterval(() => setDrop(randomDrop()), 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="falling-elevator" aria-hidden="true">
      <img src={fallingElevatorUrl} alt="" style={style} />
    </div>
  );
}
