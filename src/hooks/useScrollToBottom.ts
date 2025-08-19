import { useRef, useEffect } from "react";

export const useScrollToBottom = (deps: any[] = []) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, deps);

  return { bottomRef, scrollToBottom };
};
