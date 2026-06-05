import { createContext, useContext, useState, useCallback, useRef } from "react";
import Loading from "../components/Loading.jsx";

const LoadingContext = createContext();

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoadingState] = useState(true);
  const [percent, setPercent] = useState(0);
  const startTime = useRef(Date.now());

  const finishLoading = useCallback(() => {
    const elapsed = Date.now() - startTime.current;
    const delay = Math.max(0, 1000 - elapsed);
    setTimeout(() => setLoadingState(false), delay);
  }, []);

  const setLoading = useCallback((value) => {
    setPercent(value);
  }, []);

  const setIsLoading = useCallback((value) => {
    if (!value) {
      setLoadingState(false);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, finishLoading, setLoading, setIsLoading }}>
      {loading && <Loading percent={percent} />}
      {children}
    </LoadingContext.Provider>
  );
};
