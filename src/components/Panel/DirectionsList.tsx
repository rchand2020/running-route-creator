import { useState } from 'react';
import type { RouteStep } from '../../types';

type Props = {
  steps: RouteStep[];
};

const STEP_ICONS: Record<number, string> = {
  0: '↑',
  1: '↑',
  2: '↰',
  3: '↱',
  4: '←',
  5: '→',
  6: '↰',
  7: '↱',
  8: '⟳',
  9: '⟳',
  10: '◎',
  11: '▶',
  12: '←',
  13: '→',
};

const STEP_LABELS: Record<number, string> = {
  0: 'Head',
  1: 'Continue straight',
  2: 'Turn slight left',
  3: 'Turn slight right',
  4: 'Turn left',
  5: 'Turn right',
  6: 'Turn sharp left',
  7: 'Turn sharp right',
  8: 'Make a U-turn',
  9: 'Make a U-turn',
  10: 'Arrive',
  11: 'Depart',
  12: 'Keep left',
  13: 'Keep right',
};

// "Continue straight" types that can be merged with the previous step
const STRAIGHT_TYPES = new Set([0, 1]);
// Types that should never be dropped
const IMPORTANT_TYPES = new Set([10, 11]); // Arrive, Depart

const MIN_DISTANCE_FEET = 100;

function simplifySteps(steps: RouteStep[]): RouteStep[] {
  const result: RouteStep[] = [];

  for (const step of steps) {
    const prev = result[result.length - 1];

    // Merge consecutive straight segments on the same road
    if (
      prev &&
      STRAIGHT_TYPES.has(step.type) &&
      STRAIGHT_TYPES.has(prev.type) &&
      step.name === prev.name
    ) {
      result[result.length - 1] = {
        ...prev,
        distanceMiles: prev.distanceMiles + step.distanceMiles,
        durationMinutes: prev.durationMinutes + step.durationMinutes,
      };
      continue;
    }

    // Drop very short segments that aren't real turns or arrive/depart
    if (
      step.distanceMiles * 5280 < MIN_DISTANCE_FEET &&
      STRAIGHT_TYPES.has(step.type) &&
      !IMPORTANT_TYPES.has(step.type)
    ) {
      // Absorb distance into previous step if possible
      if (prev) {
        result[result.length - 1] = {
          ...prev,
          distanceMiles: prev.distanceMiles + step.distanceMiles,
          durationMinutes: prev.durationMinutes + step.durationMinutes,
        };
      }
      continue;
    }

    result.push(step);
  }

  return result;
}

function formatDistance(miles: number): string {
  if (miles < 0.1) {
    const feet = Math.round(miles * 5280);
    return `${feet} ft`;
  }
  return `${miles.toFixed(2)} mi`;
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return '<1 min';
  return `${minutes} min`;
}

function buildDescription(step: RouteStep): string {
  const action = STEP_LABELS[step.type] ?? step.instruction;
  if (step.name && step.name !== '-') {
    return `${action} onto ${step.name}`;
  }
  return action;
}

export function DirectionsList({ steps }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (steps.length === 0) return null;

  const simplified = simplifySteps(steps);

  return (
    <div className="directions-list">
      <button className="directions-toggle" onClick={() => setExpanded(!expanded)}>
        <span>Turn-by-Turn Directions ({simplified.length} steps)</span>
        <span className={`chevron ${expanded ? 'expanded' : ''}`}>▸</span>
      </button>
      {expanded && (
        <ol className="directions-steps">
          {simplified.map((step, i) => (
            <li key={i} className="direction-step">
              <div className="step-number-col">
                <span className="step-number">{i + 1}</span>
                {i < simplified.length - 1 && <span className="step-line" />}
              </div>
              <span className="step-icon">{STEP_ICONS[step.type] ?? '•'}</span>
              <div className="step-content">
                <span className="step-text">{buildDescription(step)}</span>
                <span className="step-meta">
                  {formatDistance(step.distanceMiles)}
                  {step.durationMinutes > 0 && ` · ${formatDuration(step.durationMinutes)}`}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
