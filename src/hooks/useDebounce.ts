export defalt function useDebounce(callback: Function, delay: number) {
  const debounceTimeout = useRef<any>(null);

  return (...args: any[]) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
