import { useState } from "react";
import { toast } from "sonner";

type FetchFunction<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

const useFetch = <TArgs extends unknown[], TResult>(cb: FetchFunction<TArgs, TResult>) => {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fn = async (...args: TArgs) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
