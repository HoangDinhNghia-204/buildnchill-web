import { useEffect, useState } from 'react';

const SummerEffect = () => {
  const [items, setItems] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const summerItems = ['🐚', '⭐', '🐬', '🛟', '🏖️', '🏝️', '🐠', '🐙'];
    const newItems = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      icon: summerItems[Math.floor(Math.random() * summerItems.length)],
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      type: i % 4 === 0 ? 'dolphin' : i % 3 === 0 ? 'starfish' : i % 2 === 0 ? 'shell' : 'swim-ring'
    }));
    setItems(newItems);

    const newSparkles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      delay: `${Math.random() * 5}s`
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="summer-effect-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay
          }}
        />
      ))}

      {items.map((item) => (
        <div
          key={item.id}
          className={`summer-item ${item.type}`}
          style={{
            left: item.left,
            top: item.top,
            animationDelay: item.delay,
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};

export default SummerEffect;
