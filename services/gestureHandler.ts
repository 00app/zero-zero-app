
interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  deltaX: number;
  deltaY: number;
}

interface GestureHandlerOptions {
  onSwipe?: (direction: SwipeDirection) => void;
  onTap?: (event: TouchEvent | MouseEvent) => void;
  threshold?: number;
}

export class GestureHandler {
  private startX: number = 0;
  private startY: number = 0;
  private threshold: number = 50;
  private element: HTMLElement;
  private options: GestureHandlerOptions;

  constructor(element: HTMLElement, options: GestureHandlerOptions = {}) {
    this.element = element;
    this.options = options;
    this.threshold = options.threshold || 50;
    this.init();
  }

  private init() {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Mouse events for desktop
    this.element.addEventListener('mousedown', this.handleMouseStart.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseEnd.bind(this));
    
    // Prevent default touch behaviors
    this.element.addEventListener('touchmove', this.preventDefault, { passive: false });
  }

  private preventDefault(e: Event) {
    e.preventDefault();
  }

  private handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  }

  private handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0];
    this.handleGestureEnd(touch.clientX, touch.clientY, e);
  }

  private handleMouseStart(e: MouseEvent) {
    this.startX = e.clientX;
    this.startY = e.clientY;
  }

  private handleMouseEnd(e: MouseEvent) {
    this.handleGestureEnd(e.clientX, e.clientY, e);
  }

  private handleGestureEnd(endX: number, endY: number, event: TouchEvent | MouseEvent) {
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // If movement is less than threshold, treat as tap
    if (absDeltaX < this.threshold && absDeltaY < this.threshold) {
      this.options.onTap?.(event);
      return;
    }

    // Determine swipe direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      const direction = deltaX > 0 ? 'right' : 'left';
      this.options.onSwipe?.({ direction, deltaX, deltaY });
    } else {
      // Vertical swipe
      const direction = deltaY > 0 ? 'down' : 'up';
      this.options.onSwipe?.({ direction, deltaX, deltaY });
    }
  }

  public destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('mousedown', this.handleMouseStart);
    this.element.removeEventListener('mouseup', this.handleMouseEnd);
    this.element.removeEventListener('touchmove', this.preventDefault);
  }
}

export const createGestureHandler = (element: HTMLElement, options: GestureHandlerOptions) => {
  return new GestureHandler(element, options);
};
// File removed - not used in core intro→onboarding→dashboard flow
