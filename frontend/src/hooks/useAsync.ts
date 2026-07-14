import React from "react";

function useAsync<T>(loader: () => Promise<T>, deps: React.DependencyList) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    let mounted = true;
    loader()
      .then((value) => mounted && setData(value))
      .catch(() => mounted && setError("Unable to load this workspace."))
    return () => {
      mounted = false;
    };
  }, deps);
  return { data, error };
}

export default useAsync;