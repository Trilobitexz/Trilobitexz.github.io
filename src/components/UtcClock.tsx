import { useState, useEffect } from "react";

export default function UtcClock() {
  const [currentUtcTime, setCurrentUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentUtcTime(now.toLocaleString('zh-TW', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="font-mono text-[#58A6FF]">{currentUtcTime}</span>;
}
