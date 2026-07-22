import { ControlSide, ControlVerticalPosition } from './settings-model';

export interface RectLike {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface PanelPosition {
  left: number;
  top: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (maximum < minimum) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

export function computePanelPosition(
  button: RectLike,
  panel: Pick<RectLike, 'width' | 'height'>,
  container: RectLike,
  viewport: { width: number; height: number },
  side: ControlSide,
  verticalPosition: ControlVerticalPosition,
  edge = 12,
): PanelPosition {
  const minimumLeft = Math.max(container.left + edge, edge);
  const maximumRight = Math.min(container.right - edge, viewport.width - edge);
  const desiredLeft = side === 'right' ? button.right - panel.width : button.left;
  const absoluteLeft = clamp(desiredLeft, minimumLeft, maximumRight - panel.width);

  const minimumTop = Math.max(container.top + edge, edge);
  const maximumBottom = Math.min(container.bottom - edge, viewport.height - edge);
  const desiredTop =
    verticalPosition === 'top'
      ? button.top
      : verticalPosition === 'bottom'
        ? button.bottom - panel.height
        : button.top + button.height / 2 - panel.height / 2;
  const absoluteTop = clamp(desiredTop, minimumTop, maximumBottom - panel.height);

  return {
    left: absoluteLeft - container.left,
    top: absoluteTop - container.top,
  };
}
