import React, { useState, useEffect } from 'react';

const CurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-cyan-400/80 font-mono text-sm tracking-widest mt-2 uppercase flex items-center gap-3">
      <span>T-{time.toLocaleTimeString([], { hour12: false })}</span>
      <span className="text-cyan-400/30">|</span>
      <span>{time.toLocaleTimeString([], { hour12: true })}</span>
    </div>
  );
};

export default CurrentTime;
