import fallingElevatorUrl from '../../assets/falling-elevator.png';

export function FallingElevator() {
  return (
    <div className="falling-elevator" aria-hidden="true">
      <img src={fallingElevatorUrl} alt="" />
    </div>
  );
}
