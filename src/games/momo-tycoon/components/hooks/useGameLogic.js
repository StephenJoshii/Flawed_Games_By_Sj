import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// --- Base Game Configuration ---
const BASE_MOMO_PRICE = 50;
const BASE_MAKE_MOMO_TIME_MS = 3000;
const SERVING_SIZE = 10;
const CUSTOMER_PATIENCE_MS = 15000;
const SAVE_GAME_KEY = 'momoTycoonSaveData';

// --- Upgrade Definitions ---
export const UPGRADES_CONFIG = {
  steamer: { id: 'steamer', name: 'Faster Steamer', description: 'Reduces the time it takes to cook a batch of momos.', maxLevel: 5, getCost: (level) => 150 * Math.pow(2, level - 1) },
  filling: { id: 'filling', name: 'Gourmet Filling', description: 'Increases the price customers pay for your delicious momos.', maxLevel: 5, getCost: (level) => 200 * Math.pow(2, level - 1) },
  cart: { id: 'cart', name: 'Charming Cart', description: 'Attracts more customers to your stall, reducing wait times.', maxLevel: 5, getCost: (level) => 100 * Math.pow(2, level - 1) },
};

// --- Event Definitions ---
const EVENTS = [
  { type: 'lunch-rush', duration: 30000, description: "Office Lunch Rush! Customers are arriving much faster!" },
  { type: 'load-shedding', duration: 20000, description: "Load Shedding! You can't make new momos." },
];

const INITIAL_STATE = {
  money: 100, flour: 5, filling: 5, momoStock: 20, day: 1, reputation: 80, customers: [],
  upgradeLevels: { steamer: 1, filling: 1, cart: 1 },
};

const loadGame = () => {
  try {
    const savedData = localStorage.getItem(SAVE_GAME_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.upgradeLevels && typeof parsed.reputation === 'number') {
        const loadedState = { ...INITIAL_STATE, ...parsed };
        loadedState.customers = [];
        return loadedState;
      }
    }
  } catch (error) { console.error("Failed to load or parse game data:", error); }
  return INITIAL_STATE;
};

export function useGameLogic({ notify }) {
  const [gameStateData, setGameStateData] = useState(loadGame);
  const { money, flour, filling, momoStock, day, upgradeLevels, reputation, customers } = gameStateData;

  const [isMakingMomo, setIsMakingMomo] = useState(false);
  const [makingProgress, setMakingProgress] = useState(0);
  const [lastServedInfo, setLastServedInfo] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [moneyEarnedToday, setMoneyEarnedToday] = useState(0);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const notifyRef = useRef(notify);
  useEffect(() => { notifyRef.current = notify; }, [notify]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const dailyGoal = useMemo(() => 200 + (day - 1) * 100, [day]);

  const derivedValues = useMemo(() => {
    let reputationModifier = 1 + ((50 - reputation) / 100);
    let customerSpawnMultiplier = 1;
    // Only lunch-rush affects customer spawn rate (makes them come faster)
    // Load-shedding does NOT affect customer spawning
    if (activeEvent?.type === 'lunch-rush') customerSpawnMultiplier = 0.25;

    return {
      momoPrice: BASE_MOMO_PRICE + (upgradeLevels.filling - 1) * 10,
      makeMomoTime: BASE_MAKE_MOMO_TIME_MS / (1 + (upgradeLevels.steamer - 1) * 0.2),
      customerSpawnMin: Math.max(500, (4000 / (1 + (upgradeLevels.cart - 1) * 0.25)) * reputationModifier * customerSpawnMultiplier),
      customerSpawnMax: Math.max(1000, (8000 / (1 + (upgradeLevels.cart - 1) * 0.25)) * reputationModifier * customerSpawnMultiplier),
      canMakeMomo: activeEvent?.type !== 'load-shedding',
    };
  }, [upgradeLevels, reputation, activeEvent]);
  
  const startNextDay = useCallback(() => {
    setGameStateData(prev => ({ ...prev, day: prev.day + 1, customers: [] }));
    setMoneyEarnedToday(0);
    setGameState('playing');
    setActiveEvent(null);
    notifyRef.current.info(`Day ${day + 1} has begun!`);
  }, [day]);

  const restartGame = useCallback(() => {
    setGameStateData(INITIAL_STATE);
    setMoneyEarnedToday(0);
    setGameState('playing');
    setActiveEvent(null);
    notifyRef.current.success("New game started!");
  }, []);
  
  const resetProgress = useCallback(() => {
    localStorage.removeItem(SAVE_GAME_KEY);
    restartGame();
  }, [restartGame]);

  const buyIngredients = useCallback(() => {
    setGameStateData(prev => {
      if (prev.money >= 25) {
        // Removed notification - less annoying
        return { ...prev, money: prev.money - 25, flour: prev.flour + 5, filling: prev.filling + 5 };
      }
      notifyRef.current.error("Not enough money for ingredients!");
      return prev;
    });
  }, []);

  const makeMomo = useCallback(() => {
    if (isMakingMomo) return;
    setGameStateData(prev => {
      if (prev.flour < 1 || prev.filling < 1) {
        notifyRef.current.warning("Not enough ingredients!");
        return prev;
      }
      if (!derivedValues.canMakeMomo) {
        notifyRef.current.error("Can't make momos during a power cut!");
        return prev;
      }
      setIsMakingMomo(true);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const progress = Math.min(100, ((Date.now() - startTime) / derivedValues.makeMomoTime) * 100);
        setMakingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setGameStateData(p => ({ ...p, momoStock: p.momoStock + 10 }));
          setIsMakingMomo(false);
          setMakingProgress(0);
          // Removed notification - less annoying
        }
      }, 50);
      return { ...prev, flour: prev.flour - 1, filling: prev.filling - 1 };
    });
  }, [isMakingMomo, derivedValues]);

  // ✅ DEFINITIVE FIX: Logic moved inside the state updater to use `prev` state
  const serveCustomer = useCallback((customerId, customerRef) => {
    setGameStateData(prev => {
      const currentMomoPrice = BASE_MOMO_PRICE + (prev.upgradeLevels.filling - 1) * 10;
      
      if (prev.momoStock < SERVING_SIZE) {
        notifyRef.current.warning(`Not enough momos for a full plate! (Need ${SERVING_SIZE})`);
        return prev;
      }

      const newMoneyEarnedToday = moneyEarnedToday + currentMomoPrice;
      setMoneyEarnedToday(newMoneyEarnedToday);

      if (customerRef?.current) {
        const rect = customerRef.current.getBoundingClientRect();
        setLastServedInfo({ id: customerId, x: rect.left, y: rect.top, amount: currentMomoPrice });
      }

      if (newMoneyEarnedToday >= dailyGoal && gameState === 'playing') {
        setGameState('day_complete');
        notifyRef.current.success(`Day ${day} complete! You beat the goal!`);
      }
      
      return {
        ...prev,
        momoStock: prev.momoStock - SERVING_SIZE,
        money: prev.money + currentMomoPrice,
        reputation: Math.min(100, prev.reputation + 1),
        customers: prev.customers.filter(c => c.id !== customerId),
      };
    });
  }, [moneyEarnedToday, dailyGoal, day, gameState]);


  // ✅ DEFINITIVE FIX: Logic moved inside the state updater to use `prev` state
  const purchaseUpgrade = useCallback((upgradeId) => {
    setGameStateData(prev => {
      const config = UPGRADES_CONFIG[upgradeId];
      const currentLevel = prev.upgradeLevels[upgradeId];
      
      if (currentLevel >= config.maxLevel) {
        notifyRef.current.info("This upgrade is already at max level!");
        return prev;
      }
      
      const cost = config.getCost(currentLevel + 1);
      if (prev.money >= cost) {
        // Removed notification - less annoying
        return {
          ...prev,
          money: prev.money - cost,
          upgradeLevels: { ...prev.upgradeLevels, [upgradeId]: currentLevel + 1 }
        };
      }
      
      notifyRef.current.error("Not enough money for this upgrade!");
      return prev;
    });
  }, []);

  // --- Main Game Loop Effects ---
  useEffect(() => { localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameStateData)); }, [gameStateData]);

  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;
    let customerTimeout;
    const spawnLoop = () => {
      const { customerSpawnMin, customerSpawnMax } = derivedValues;
      const delay = Math.random() * (customerSpawnMax - customerSpawnMin) + customerSpawnMin;
      customerTimeout = setTimeout(() => {
        setGameStateData(prev => ({ ...prev, customers: [...prev.customers, { id: Date.now() + Math.random(), spawnTime: Date.now() }] }));
        spawnLoop();
      }, delay);
    };
    spawnLoop();
    return () => clearTimeout(customerTimeout);
  }, [gameState, derivedValues, isPaused]);

  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;
    const gameTick = setInterval(() => {
      setGameStateData(prev => {
        const now = Date.now();
        const departingCustomers = [];
        const updatedCustomers = prev.customers.map(c => ({ ...c, patience: Math.max(0, 100 - ((now - c.spawnTime) / CUSTOMER_PATIENCE_MS) * 100) }))
          .filter(c => {
            if (c.patience > 0) return true;
            departingCustomers.push(c);
            return false;
          });

        if (departingCustomers.length > 0) {
          notifyRef.current.error(`${departingCustomers.length} customer${departingCustomers.length > 1 ? 's' : ''} left angry!`);
          return { ...prev, reputation: Math.max(0, prev.reputation - (departingCustomers.length * 5)), customers: updatedCustomers };
        }
        return { ...prev, customers: updatedCustomers };
      });
    }, 100);
    return () => clearInterval(gameTick);
  }, [gameState, isPaused]);

  useEffect(() => {
    if (gameState !== 'playing' || activeEvent || isPaused) return;
    const eventInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        setActiveEvent({ ...event, startTime: Date.now(), timeLeft: event.duration });
        notifyRef.current.info(event.description);
      }
    }, 15000);
    return () => clearInterval(eventInterval);
  }, [gameState, activeEvent, isPaused]);

  useEffect(() => {
    if (!activeEvent || isPaused) return;
    const countdownInterval = setInterval(() => {
      const elapsedTime = Date.now() - activeEvent.startTime;
      const newTimeLeft = activeEvent.duration - elapsedTime;
      if (newTimeLeft <= 0) {
        setActiveEvent(null);
        // Remove notification - less annoying
      } else {
        setActiveEvent(prev => ({ ...prev, timeLeft: newTimeLeft }));
      }
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [activeEvent, isPaused]);
  
  useEffect(() => {
    if (gameState === 'day_complete') {
      const timer = setTimeout(() => {
        startNextDay();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState, startNextDay]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (money < 25 && flour < 1 && filling < 1 && momoStock < SERVING_SIZE) {
      setGameState('game_over');
      notifyRef.current.error("Game Over! You've run out of resources.");
    }
  }, [money, flour, filling, momoStock, gameState]);

  return {
    money, flour, filling, momoStock, day, customers, isMakingMomo, makingProgress, lastServedInfo,
    upgradeLevels, gameState, dailyGoal, moneyEarnedToday, reputation, activeEvent, isPaused,
    buyIngredients, makeMomo, serveCustomer, purchaseUpgrade, startNextDay, restartGame, resetProgress,
    togglePause,
  };
}

