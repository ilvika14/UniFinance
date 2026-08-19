import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

type FetchFunction<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

const useFetch = <TArgs extends unknown[], TResult>(cb: FetchFunction<TArgs, TResult>) => {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fn = useCallback(async (...args: TArgs) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      if (!controller.signal.aborted) {
        setData(response);
        setError(null);
      }
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : String(error);
        setError(message);
        toast.error(message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [cb]);

  return { data, loading, error, fn, setData };
};

export default useFetch;
