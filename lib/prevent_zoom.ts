import { useEffect } from "react";

/**
 * Prevents default browser zoom on page
 * @param scrollCheck prevent scroll wheel zoom
 * @param keyboardCheck prevent  keyboard zoom
 */
export function usePreventZoom(scrollCheck = true, keyboardCheck = true) {
    useEffect(() => {
      const handleKeydown = (e: KeyboardEvent) => {
        if (
          keyboardCheck &&
          e.ctrlKey &&
          (e.code == "61" ||
            e.code == "107" ||
            e.code == "173" ||
            e.code == "109" ||
            e.code == "187" ||
            e.code == "189")
        ) {
          e.preventDefault();
        }
      };

      const handleWheel = (e: WheelEvent) => {
        if (scrollCheck && e.ctrlKey) {
          e.preventDefault();
        }
      };

      document.addEventListener("keydown", handleKeydown);
      document.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        document.removeEventListener("keydown", handleKeydown);
        document.removeEventListener("wheel", handleWheel);
      };
    }, [scrollCheck, keyboardCheck]);
}

export default usePreventZoom