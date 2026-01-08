import { useRef } from "react";

export const useStableResponse = <
  T extends {
    [s: string]: unknown;
  },
>(
  input: T,
) => {
  const stableResponseRef = useRef(input);
  Object.assign(stableResponseRef.current, input);

  return stableResponseRef.current;
};
