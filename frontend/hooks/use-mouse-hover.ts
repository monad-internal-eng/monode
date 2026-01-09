import { useCallback, useState } from 'react'

/**
 * Hook to track mouse hover state while ignoring touch events.
 * Uses pointer events with pointerType check to differentiate mouse from touch.
 *
 * @returns isHovering - whether the mouse is currently hovering
 * @returns hoverProps - props to spread on the element to track hover
 */
export function useMouseHover() {
  const [isHovering, setIsHovering] = useState(false)

  const hoverProps = {
    onPointerEnter: useCallback((e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') setIsHovering(true)
    }, []),
    onPointerLeave: useCallback((e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') setIsHovering(false)
    }, []),
  }

  return { isHovering, hoverProps }
}
