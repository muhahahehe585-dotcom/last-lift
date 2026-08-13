import type { InventoryItem } from './actionHitboxArt';

type HoldControl = 'left' | 'right' | 'jump' | 'down';

type MobileControlsProps = {
  flashlights: number;
  medkits: number;
  bullets: number | 'unlimited';
  hasGun: boolean;
  selectedInventory: InventoryItem;
  onHold: (control: HoldControl, pressed: boolean) => void;
  onTap: (control: 'run' | 'doubleJump' | 'slam' | 'hit' | 'interact' | 'leave' | 'gauntlet') => void;
  onSelectInventory: (item: InventoryItem) => void;
  onMenu: () => void;
};

export function MobileControls({ flashlights, medkits, bullets, hasGun, selectedInventory, onHold, onTap, onSelectInventory, onMenu }: MobileControlsProps) {
  const gunCount = hasGun ? bullets : 0;

  return (
    <div className="mobile-controls" aria-label="Mobile controls">
      <div className="mobile-inventory">
        <InventoryButton label="Gun" count={gunCount} selected={selectedInventory === 'gun'} onClick={() => onSelectInventory('gun')} />
        <InventoryButton label="Medkit" count={medkits} selected={selectedInventory === 'medkit'} onClick={() => onSelectInventory('medkit')} />
        <InventoryButton label="Light" count={flashlights} selected={selectedInventory === 'flashlight'} onClick={() => onSelectInventory('flashlight')} />
        <button type="button" className="mobile-menu-button" onClick={onMenu}>Menu</button>
      </div>

      <div className="mobile-pad">
        <HoldButton label="Left" onChange={(pressed) => onHold('left', pressed)} />
        <HoldButton label="Down" onChange={(pressed) => onHold('down', pressed)} />
        <HoldButton label="Right" onChange={(pressed) => onHold('right', pressed)} />
      </div>

      <div className="mobile-actions">
        <HoldButton label="Jump" onChange={(pressed) => onHold('jump', pressed)} />
        <button type="button" onClick={() => onTap('doubleJump')}>Double</button>
        <button type="button" onClick={() => onTap('slam')}>Slam</button>
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

function HoldButton({ label, onChange }: { label: string; onChange: (pressed: boolean) => void }) {
  return (
    <button
      type="button"
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
