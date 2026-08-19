import { useEffect, useState, type CSSProperties } from 'react';
import fallingElevatorUrl from '../../assets/falling-elevator.png';

function randomStart() {
  return 8 + Math.random() * 72;
}

export function FallingElevator() {
  const [startX, setStartX] = useState(randomStart);
  const style = { '--elevator-x': `${startX}vw` } as CSSProperties;

  useEffect(() => {
    const timer = window.setInterval(() => setStartX(randomStart()), 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="falling-elevator" aria-hidden="true">
      <img src={fallingElevatorUrl} alt="" style={style} />
    </div>
  );
}
