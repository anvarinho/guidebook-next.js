type Direction = 'up' | 'down' | 'left' | 'right' | 'up-right' | 'down-right' | 'down-left' | 'up-left';
const rotations: Record<Direction, number> = { right: 0, 'down-right': 45, down: 90, 'down-left': 135, left: 180, 'up-left': 225, up: 270, 'up-right': 315 };

export default function ArrowIcon({ direction = 'up-right' }: { direction?: Direction }) {
  return <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ display: 'inline-block', verticalAlign: '-.15em', flexShrink: 0 }}><path d="M5 12h14m-6-6 6 6-6 6" transform={`rotate(${rotations[direction]} 12 12)`}/></svg>;
}

const directions: Record<string, Direction> = { '←': 'left', '→': 'right', '↑': 'up', '↓': 'down', '↗': 'up-right', '↘': 'down-right', '↙': 'down-left', '↖': 'up-left' };
export function ArrowText({ text }: { text: string }) {
  return <>{text.split(/([←→↑↓↗↘↙↖])/).map((part, index) => directions[part] ? <ArrowIcon key={index} direction={directions[part]}/> : part)}</>;
}
