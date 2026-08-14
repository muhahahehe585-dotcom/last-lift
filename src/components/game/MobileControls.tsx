import type { InventoryItem } from './actionHitboxArt';

type HoldControl = 'left' | 'right' | 'jump' | 'down';

type MobileAction = 'run' | 'doubleJump' | 'slam' | 'dodge' | 'hit' | 'interact' | 'leave' | 'medkit' | 'gauntlet';

type MobileControlsProps = {
  flashlights: number;
  medkits: number;
  bullets: number | 'unlimited';
  hasGun: boolean;
  selectedInventory: InventoryItem;
  onHold: (control: HoldControl, pressed: boolean) => void;
  onTap: (control: MobileAction) => void;
  onSelectInventory: (item: InventoryItem) => void;
  onMenu: () => void;
};

export function MobileControls({ flashlights, medkits, bullets, hasGun, selectedInventory, onHold, onTap, onSelectInventory, onMenu }: MobileControlsProps) {
  const gunCount = hasGun ? bullets : 0;

  return (
    <div className="mobile-controls" aria-label="Mobile controls">
      <div className="mobile-inventory">
        <InventoryButton label="Gun" count={gunCount} selected={selectedInventory === 'gun'} onClick={() => onSelectInventory('gun')} />
        <InventoryButton label="Medkit" count={medkits} selected={false} onClick={() => onTap('medkit')} />
        <InventoryButton label="Light" count={flashlights} selected={selectedInventory === 'flashlight'} onClick={() => onSelectInventory('flashlight')} />
        <button type="button" className="mobile-menu-button" onClick={onMenu}>Menu</button>
      </div>

      <div className="mobile-pad">
        <span className="mobile-pad-spacer" aria-hidden="true" />
        <HoldButton label="↑" ariaLabel="Jump" className="arrow-button" onChange={(pressed) => onHold('jump', pressed)} />
        <span className="mobile-pad-spacer" aria-hidden="true" />
        <HoldButton label="←" ariaLabel="Left" className="arrow-button" onChange={(pressed) => onHold('left', pressed)} />
        <HoldButton label="↓" ariaLabel="Down" className="arrow-button" onChange={(pressed) => onHold('down', pressed)} />
        <HoldButton label="→" ariaLabel="Right" className="arrow-button" onChange={(pressed) => onHold('right', pressed)} />
      </div>

      <div className="mobile-actions">
        <button type="button" onClick={() => onTap('doubleJump')}>Double</button>
        <button type="button" onClick={() => onTap('slam')}>Slam</button>
        <button type="button" onClick={() => onTap('dodge')}>Dodge</button>
        <button type="button" onClick={() => onTap('run')}>Run</button>
        <button type="button" onClick={() => onTap('hit')}>Hit</button>
        <button type="button" onClick={() => onTap('interact')}>Use</button>
        <button type="button" onClick={() => onTap('leave')}>Leave</button>
        <button type="button" onClick={() => onTap('gauntlet')}>Snap</button>
      </div>
    </div>
  );
}

function InventoryButton({ label, count, selected, onClick }: { label: string; count: number | 'unlimited'; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" className={selected ? 'selected' : ''} onClick={onClick}>
      <span>{label}</span>
      <strong>{count}</strong>
    </button>
  );
}

function HoldButton({ label, ariaLabel, className, onChange }: { label: string; ariaLabel?: string; className?: string; onChange: (pressed: boolean) => void }) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel ?? label}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onChange(true);
      }}
      onPointerUp={() => onChange(false)}
      onPointerCancel={() => onChange(false)}
      onPointerLeave={() => onChange(false)}
    >
      {label}
    </button>
  );
}
