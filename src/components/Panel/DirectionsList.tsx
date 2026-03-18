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

// Types that represent going straight (can be merged)
const STRAIGHT_TYPES = new Set([0, 1]);
// Waypoint transition types (arrive at waypoint / depart from waypoint)
const WAYPOINT_TYPES = new Set([10, 11]);

function simplifySteps(steps: RouteStep[]): RouteStep[] {
  // Step 1: Remove internal arrive/depart pairs (waypoint transitions).
  // Keep only the very first depart and very last arrive.
  const withoutWaypointNoise: RouteStep[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const isFirstStep = i === 0;
    const isLastStep = i === steps.length - 1;

    if (step.type === 10 && !isLastStep) {
      // Internal "Arrive" — absorb distance into previous step
      const prev = withoutWaypointNoise[withoutWaypointNoise.length - 1];
      if (prev) {
        withoutWaypointNoise[withoutWaypointNoise.length - 1] = {
          ...prev,
          distanceMiles: prev.distanceMiles + step.distanceMiles,
          durationMinutes: prev.durationMinutes + step.durationMinutes,
        };
      }
      continue;
    }
    if (step.type === 11 && !isFirstStep) {
      // Internal "Depart" — absorb distance into next meaningful step
      // by just skipping it (the distance is negligible)
      continue;
    }

    withoutWaypointNoise.push(step);
  }

  // Step 2: Merge consecutive straight segments and absorb short unnamed segments
  const result: RouteStep[] = [];
  for (const step of withoutWaypointNoise) {
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

    // Absorb short unnamed straight segments into the previous step
    if (
      prev &&
      STRAIGHT_TYPES.has(step.type) &&
      !WAYPOINT_TYPES.has(step.type) &&
      (!step.name || step.name === '-') &&
      step.distanceMiles * 5280 < 200
    ) {
      result[result.length - 1] = {
        ...prev,
        distanceMiles: prev.distanceMiles + step.distanceMiles,
        durationMinutes: prev.durationMinutes + step.durationMinutes,
      };
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
  // Prefer the ORS-provided instruction (e.g. "Turn left onto West 72nd Street")
  if (step.instruction) return step.instruction;
  return 'Continue';
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
