import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// --- Base Game Configuration ---
const BASE_MOMO_PRICE = 50;
const BASE_MAKE_MOMO_TIME_MS = 3000;
const SERVING_SIZE = 10;
const CUSTOMER_PATIENCE_MS = 15000; // 15 seconds
const SAVE_GAME_KEY = 'momoTycoonSaveData';

// --- Upgrade Definitions ---
export const UPGRADES_CONFIG = {
  steamer: {
    id: 'steamer',
    name: 'Faster Steamer',
    description: 'Reduces the time it takes to cook a batch of momos.',
    maxLevel: 5,
    getCost: (level) => 150 * Math.pow(2, level - 1),
  },
  filling: {
    id: 'filling',
    name: 'Gourmet Filling',
    description: 'Increases the price customers pay for your delicious momos.',
    maxLevel: 5,
    getCost: (level) => 200 * Math.pow(2, level - 1),
  },
  cart: {
    id: 'cart',
    name: 'Charming Cart',
    description: 'Attracts more customers to your stall, reducing wait times.',
    maxLevel: 5,
    getCost: (level) => 100 * Math.pow(2, level - 1),
  },
};

const INITIAL_STATE = {
  money: 100,
  flour: 5,
  filling: 5,
  momoStock: 20,
  day: 1,
  reputation: 80,
  customers: [],
  upgradeLevels: {
    steamer: 1,
    filling: 1,
    cart: 1,
  },
};

// --- Helper function to load game state ---
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
  } catch (error) {
    console.error("Failed to load or parse game data, starting fresh:", error);
  }
  return INITIAL_STATE;
};

export function useGameLogic({ notify }) {
  const [gameStateData, setGameStateData] = useState(loadGame);
  const { money, flour, filling, momoStock, day, upgradeLevels, customers } = gameStateData;
  const reputation = gameStateData.reputation; // ✅ reputation always read live

  const [isMakingMomo, setIsMakingMomo] = useState(false);
  const [makingProgress, setMakingProgress] = useState(0);
  const [lastServedInfo, setLastServedInfo] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [moneyEarnedToday, setMoneyEarnedToday] = useState(0);
  
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  const dailyGoal = useMemo(() => 200 + (day - 1) * 100, [day]);

  const derivedValues = useMemo(() => {
    const steamerLevel = upgradeLevels.steamer;
    const fillingLevel = upgradeLevels.filling;
    const cartLevel = upgradeLevels.cart;
    const reputationModifier = 1 + ((50 - reputation) / 100); // ✅ uses live reputation

    return {
      momoPrice: BASE_MOMO_PRICE + (fillingLevel - 1) * 10,
      makeMomoTime: BASE_MAKE_MOMO_TIME_MS / (1 + (steamerLevel - 1) * 0.2),
      customerSpawnMin: Math.max(500, (4000 / (1 + (cartLevel - 1) * 0.25)) * reputationModifier),
      customerSpawnMax: Math.max(1000, (8000 / (1 + (cartLevel - 1) * 0.25)) * reputationModifier),
    };
  }, [upgradeLevels, reputation]); // ✅ reputation in deps
  
  const startNextDay = useCallback(() => {
    setGameStateData(prev => ({ ...prev, day: prev.day + 1, customers: [] }));
    setMoneyEarnedToday(0);
    setGameState('playing');
    notifyRef.current.info(`Day ${day + 1} has begun!`);
  }, [day]);

  const restartGame = useCallback(() => {
    setGameStateData(INITIAL_STATE);
    setMoneyEarnedToday(0);
    setGameState('playing');
    notifyRef.current.success("New game started!");
  }, []);
  
  const resetProgress = useCallback(() => {
    localStorage.removeItem(SAVE_GAME_KEY);
    restartGame();
  }, [restartGame]);

  const buyIngredients = useCallback(() => {
    setGameStateData(prev => {
      if (prev.money >= 25) {
        notifyRef.current.success("Purchased 5 flour and 5 fillings.");
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
        notifyRef.current.warning("Not enough ingredients to make momos!");
        return prev;
      }
      
      setIsMakingMomo(true);
      
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(100, (elapsedTime / derivedValues.makeMomoTime) * 100);
        setMakingProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setGameStateData(p => ({ ...p, momoStock: p.momoStock + 10 }));
          setIsMakingMomo(false);
          setMakingProgress(0);
          notifyRef.current.success("A fresh batch of 10 momos is ready!");
        }
      }, 50);

      return { ...prev, flour: prev.flour - 1, filling: prev.filling - 1 };
    });
  }, [isMakingMomo, derivedValues.makeMomoTime]);

  const serveCustomer = useCallback((customerId, customerRef) => {
    const momoPrice = derivedValues.momoPrice;
    setGameStateData(prev => {
      if (prev.momoStock >= SERVING_SIZE) {
        setMoneyEarnedToday(m => m + momoPrice);
        if (customerRef.current) {
          const rect = customerRef.current.getBoundingClientRect();
          setLastServedInfo({ id: customerId, x: rect.left, y: rect.top, amount: momoPrice });
        }
        return {
          ...prev,
          momoStock: prev.momoStock - SERVING_SIZE,
          money: prev.money + momoPrice,
          reputation: Math.min(100, prev.reputation + 1),
          customers: prev.customers.filter(c => c.id !== customerId),
        };
      }
      notifyRef.current.warning(`Not enough momos for a full plate! (Need ${SERVING_SIZE})`);
      return prev;
    });
  }, [derivedValues.momoPrice]);

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
        notifyRef.current.success(`${config.name} upgraded to Level ${currentLevel + 1}!`);
        return { ...prev, money: prev.money - cost, upgradeLevels: { ...prev.upgradeLevels, [upgradeId]: currentLevel + 1 } };
      }
      notifyRef.current.error("Not enough money for this upgrade!");
      return prev;
    });
  }, []);

  // --- Main Game Loop Effects ---

  useEffect(() => {
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameStateData));
  }, [gameStateData]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let customerTimeout;
    const spawnLoop = () => {
      const { customerSpawnMin, customerSpawnMax } = derivedValues;
      const delay = Math.random() * (customerSpawnMax - customerSpawnMin) + customerSpawnMin;
      customerTimeout = setTimeout(() => {
        const newCustomer = { 
          id: Date.now() + Math.random(), 
          spawnTime: Date.now(),
        };
        setGameStateData(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
        spawnLoop();
      }, delay);
    };
    spawnLoop();
    return () => clearTimeout(customerTimeout);
  }, [gameState, derivedValues]);

  // *** Game Tick Loop ***
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameTick = setInterval(() => {
      setGameStateData(prev => {
        const now = Date.now();
        const departingCustomers = [];

        const updatedCustomers = prev.customers
          .map(customer => {
            const elapsedTime = now - customer.spawnTime;
            const patience = Math.max(0, 100 - (elapsedTime / CUSTOMER_PATIENCE_MS) * 100);
            return { ...customer, patience };
          })
          .filter(customer => {
            if (customer.patience > 0) {
              return true;
            }
            departingCustomers.push(customer);
            return false;
          });

        if (departingCustomers.length > 0) {
          const departingCount = departingCustomers.length;
          const reputationPenalty = departingCount * 5;
          notifyRef.current.error(`${departingCount} customer${departingCount > 1 ? 's' : ''} left angry!`);
          return {
            ...prev,
            reputation: Math.max(0, prev.reputation - reputationPenalty),
            customers: updatedCustomers,
          };
        }
        
        return { ...prev, customers: updatedCustomers };
      });
    }, 100);

    return () => clearInterval(gameTick);
  }, [gameState]);
  
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (moneyEarnedToday >= dailyGoal) {
      setGameState('day_complete');
      notifyRef.current.success(`Day ${day} complete! You beat the goal!`);
    } else if (money < 25 && flour < 1 && filling < 1 && momoStock < SERVING_SIZE) {
      setGameState('game_over');
      notifyRef.current.error("Game Over! You've run out of resources.");
    }
  }, [gameStateData, moneyEarnedToday, dailyGoal, day]);

  return {
    money, flour, filling, momoStock, day, customers, isMakingMomo, makingProgress, lastServedInfo,
    upgradeLevels, gameState, dailyGoal, moneyEarnedToday, reputation,
    buyIngredients, makeMomo, serveCustomer, purchaseUpgrade, startNextDay, restartGame, resetProgress,
  };
}
