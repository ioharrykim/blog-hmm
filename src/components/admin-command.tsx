"use client";

import { useEffect, useRef } from "react";

const command = "quietnoise";

export function AdminCommand() {
  const buffer = useRef("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key.length !== 1) return;
      buffer.current = `${buffer.current}${event.key.toLowerCase()}`.slice(-command.length);
      if (buffer.current === command) {
        window.location.assign("/admin/login");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
