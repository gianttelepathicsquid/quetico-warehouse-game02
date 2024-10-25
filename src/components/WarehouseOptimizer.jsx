import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, BarChart2, AlertTriangle, Clock, Star, Trophy } from 'lucide-react';

const WarehouseOptimizer = () => {
  const [gameState, setGameState] = useState('intro');
  const [score, setScore] = useState({
    total: 0,
    efficiency: 0,
    stockouts: 0,
    perfectOrders: 0,
    lastAction: null
  });
  const [day, setDay] = useState(1);
  const [time, setTime] = useState(30);
  const [stockAccuracy, setStockAccuracy] = useState(100);
  const [alerts, setAlerts] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [highScore, setHighScore] = useState(0);
  
  const [inventory, setInventory] = useState({
    electronics: { stock: 50, demand: 10, optimal: 50, warning: false },
    apparel: { stock: 50, demand: 8, optimal: 50, warning: false },
    accessories: { stock: 50, demand: 15, optimal: 50, warning: false }
  });

  const startGame = () => {
    setGameState('playing');
    setScore({
      total: 0,
      efficiency: 0,
      stockouts: 0,
      perfectOrders: 0,
      lastAction: null
    });
    setDay(1);
    setTime(30);
    setStockAccuracy(100);
    setAlerts([]);
    setScoreHistory([]);
    setInventory({
      electronics: { stock: 50, demand: 10, optimal: 50, warning: false },
      apparel: { stock: 50, demand: 8, optimal: 50, warning: false },
      accessories: { stock: 50, demand: 15, optimal: 50, warning: false }
    });
  };

  const updateScore = (action, value) => {
    setScore(prev => {
      const newScore = {
        ...prev,
        lastAction: {
          type: action,
          value: value,
          timestamp: Date.now()
        }
      };

      switch (action) {
        case 'EFFICIENCY':
          newScore.efficiency += value;
          newScore.total += value;
          break;
        case 'STOCKOUT':
          newScore.stockouts += 1;
          newScore.total = Math.max(0, newScore.total - 25);
          break;
        case 'PERFECT_ORDER':
          newScore.perfectOrders += 1;
          newScore.total += 50;
          break;
        default:
          newScore.total += value;
      }

      return newScore;
    });

    // Update score history
    setScoreHistory(prev => [...prev, {
      day,
      action,
      value,
      timestamp: Date.now()
    }]);
  };

  const adjustStock = (category, amount) => {
    if (gameState !== 'playing') return;

    setInventory(prev => {
      const newInventory = { ...prev };
      const item = newInventory[category];
      const prevDiff = Math.abs(item.stock - item.optimal);
      
      // Update stock with limits
      item.stock = Math.max(0, Math.min(100, item.stock + amount));
      
      // Calculate new difference from optimal
      const newDiff = Math.abs(item.stock - item.optimal);
      
      // Score based on movement towards or away from optimal
      if (newDiff < prevDiff) {
        updateScore('EFFICIENCY', 10);
      } else if (newDiff > prevDiff) {
        updateScore('EFFICIENCY', -5);
      }
      
      // Update warning status
      item.warning = item.stock < item.demand * 2 || item.stock > item.optimal * 1.5;
      
      return newInventory;
    });
  };

  const processDemand = () => {
    setInventory(prev => {
      const newInventory = { ...prev };
      let newAlerts = [];
      let perfectOrders = true;
      
      Object.entries(newInventory).forEach(([category, item]) => {
        const dailyDemand = item.demand + Math.floor(Math.random() * 5 - 2);
        
        if (item.stock >= dailyDemand) {
          item.stock -= dailyDemand;
          updateScore('FULFILLED_ORDER', 15);
        } else {
          newAlerts.push(`Stockout: ${category}`);
          updateScore('STOCKOUT', -25);
          perfectOrders = false;
        }
        
        if (item.stock > item.optimal * 1.5) {
          newAlerts.push(`Overstock: ${category}`);
          updateScore('OVERSTOCK', -10);
          perfectOrders = false;
        }
        
        item.warning = item.stock < item.demand * 2 || item.stock > item.optimal * 1.5;
      });
      
      if (perfectOrders) {
        updateScore('PERFECT_ORDER', 50);
      }
      
      setAlerts(newAlerts);
      
      return newInventory;
    });
  };

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && time > 0) {
      interval = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            setGameState('ended');
            setHighScore(current => Math.max(current, score.total));
            return 0;
          }
          return prev - 1;
        });
        processDemand();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, time]);

  const ScoreDisplay = () => (
    <div style={{
      backgroundColor: '#1E2A3B',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Star className="text-[#00B4D8]" />
          <div style={{ color: '#00B4D8', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {score.total}
          </div>
          <div style={{ color: '#94A3B8' }}>Total Score</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Trophy className="text-[#00B4D8]" />
          <div style={{ color: '#00B4D8', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {highScore}
          </div>
          <div style={{ color: '#94A3B8' }}>High Score</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Package className="text-[#00B4D8]" />
          <div style={{ color: '#00B4D8', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {score.perfectOrders}
          </div>
          <div style={{ color: '#94A3B8' }}>Perfect Orders</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle className="text-[#00B4D8]" />
          <div style={{ color: '#FF4444', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {score.stockouts}
          </div>
          <div style={{ color: '#94A3B8' }}>Stockouts</div>
        </div>
      </div>
      
      {score.lastAction && (
        <div style={{
          marginTop: '16px',
          padding: '8px',
          backgroundColor: '#2A3B4D',
          borderRadius: '4px',
          textAlign: 'center',
          animation: 'fadeOut 1s forwards',
          animationDelay: '2s'
        }}>
          <span style={{ 
            color: score.lastAction.value >= 0 ? '#4CAF50' : '#FF4444',
            fontWeight: 'bold'
          }}>
            {score.lastAction.value >= 0 ? '+' : ''}{score.lastAction.value}
          </span>
          <span style={{ color: '#94A3B8', marginLeft: '8px' }}>
            {score.lastAction.type.replace('_', ' ')}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#0A192F',
      color: 'white',
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '1024px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '16px' }}>
          Warehouse Optimizer
        </h2>
        
        {gameState === 'intro' && (
          <div>
            <p style={{ color: '#94A3B8', marginBottom: '24px' }}>
              Optimize your warehouse inventory levels and maintain perfect stock accuracy!
              Balance demand with stock levels while avoiding stockouts and overstock situations.
            </p>
            <button
              onClick={startGame}
              style={{
                backgroundColor: '#00B4D8',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#0096B4'}
              onMouseOut={e => e.target.style.backgroundColor = '#00B4D8'}
            >
              Start Optimizing
            </button>
          </div>
        )}

        {gameState !== 'intro' && (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                backgroundColor: '#1E2A3B',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Clock style={{ color: '#00B4D8' }} />
                <div>Time: {time}s</div>
              </div>
              <div style={{ 
                backgroundColor: '#1E2A3B',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Star style={{ color: '#00B4D8' }} />
                <div>Score: {score.total}</div>
              </div>
            </div>

            <ScoreDisplay />
          </>
        )}
      </div>

      {/* Rest of the component remains the same */}
      {/* ... */}
    </div>
  );
};

export default WarehouseOptimizer;
