import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  type RefObject,
} from "react";

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

interface IntersectingElement {
  id: string;
  top: number;
}

interface HeadingInfo {
  id: string;
  title: string;
}

type TUseAnchor = {
  heading?: "h1" | "h2" | "h3" | "h4" | "h5";
  options?: IntersectionObserverOptions;
};

export default function useAnchor(
  params: TUseAnchor = {}
): [RefObject<HTMLDivElement>, string[], HeadingInfo[]] {
  const { heading = "h2", options } = params;

  const [intersectingElements, setIntersectingElements] = useState<
    IntersectingElement[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const idsRef = useRef<HeadingInfo[]>([]);

  const updateIntersectingElements = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      setIntersectingElements((prev) => {
        const visibleElements: IntersectingElement[] = [];
        const visibleIds: string[] = [];
        const invisibleIds: string[] = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleElements.push({
              id: entry.target.id,
              top: entry.boundingClientRect.top,
            });
            visibleIds.push(entry.target.id);
          } else {
            invisibleIds.push(entry.target.id);
          }
        });

        const newElements = [
          ...prev.filter(
            (el) => !invisibleIds.includes(el.id) && !visibleIds.includes(el.id)
          ),
          ...visibleElements,
        ].sort((a, b) => a.top - b.top);

        return newElements;
      });
    },
    []
  );

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      updateIntersectingElements,
      options
    );

    const container = containerRef.current;
    if (container) {
      const headingElements = container.querySelectorAll(`${heading}[id]`);
      if (headingElements.length === 0) {
        console.warn(`No ${heading} elements with ids found in the container`);
      }
      headingElements.forEach((el) => observerRef.current?.observe(el));

      idsRef.current = Array.from(headingElements).map((el) => ({
        id: el.id,
        title: el.textContent || "",
      }));
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [heading, options, updateIntersectingElements]);

  const visibleIds = useMemo(
    () => intersectingElements.map((el) => el.id),
    [intersectingElements]
  );

  const allAnchors = idsRef.current;

  return [containerRef, visibleIds, allAnchors];
}
