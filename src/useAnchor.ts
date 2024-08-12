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

const areArraysEqual = (
  arr1: IntersectingElement[],
  arr2: IntersectingElement[]
) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every(
    (el, index) => el.id === arr2[index].id && el.top === arr2[index].top
  );
};

type TUseAnchor = {
  heading?: "h1" | "h2" | "h3" | "h4" | "h5";
  options?: IntersectionObserverOptions;
};

export default function useAnchor({
  heading = "h2",
  options,
}: TUseAnchor): [RefObject<HTMLDivElement>, string[], string[]] {
  const [intersectingElements, setIntersectingElements] = useState<
    IntersectingElement[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const previousElementsRef = useRef<IntersectingElement[]>([]);
  const idsRef = useRef<string[]>([]);

  const updateIntersectingElements = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      setIntersectingElements((prev) => {
        const updatedElements = entries.reduce(
          (acc, entry) => {
            const id = entry.target.id;
            const top = entry.boundingClientRect.top;

            if (entry.isIntersecting) {
              const existingIndex = acc.findIndex((el) => el.id === id);
              if (existingIndex !== -1) {
                acc[existingIndex].top = top;
              } else {
                acc.push({ id, top });
              }
            } else {
              return acc.filter((el) => el.id !== id);
            }
            return acc;
          },
          [...prev]
        );

        updatedElements.sort((a, b) => a.top - b.top);

        // Only update state if there's an actual change
        if (!areArraysEqual(updatedElements, previousElementsRef.current)) {
          previousElementsRef.current = updatedElements;
          return updatedElements;
        }

        return prev;
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
      const h2Elements = container.querySelectorAll(`${heading}[id]`);
      if (h2Elements.length === 0) {
        console.warn("No h2 elements with ids found in the container");
      }
      h2Elements.forEach((el) => observerRef.current?.observe(el));

      idsRef.current = Array.from(h2Elements).map((el) => el.id);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [options, updateIntersectingElements]);

  const sortedIds = useMemo(
    () => intersectingElements.map((el) => el.id).filter(Boolean),
    [intersectingElements]
  );

  const allIds = useMemo(() => idsRef.current, [idsRef.current]);

  return [containerRef, sortedIds, allIds];
}
