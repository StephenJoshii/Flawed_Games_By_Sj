import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Base Game Configuration ---
const BASE_MOMO_PRICE = 50;
const BASE_MAKE_MOMO_TIME_MS = 3000;
const SERVING_SIZE = 10;
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
      // Basic validation to ensure saved data is not malformed
      if (parsed.upgradeLevels && parsed.day) {
        return { ...INITIAL_STATE, ...parsed };
      }
    }
  } catch (error) {
    console.error("Failed to load game data:", error);
  }
  return INITIAL_STATE;
};

export function useGameLogic({ notify }) {
  // --- Initialize state from localStorage or initial state ---
  const [gameStateData, setGameStateData] = useState(loadGame);

  const { money, flour, filling, momoStock, day, upgradeLevels } = gameStateData;

  const setMoney = (updater) => setGameStateData(prev => ({ ...prev, money: typeof updater === 'function' ? updater(prev.money) : updater }));
  const setFlour = (updater) => setGameStateData(prev => ({ ...prev, flour: typeof updater === 'function' ? updater(prev.flour) : updater }));
  const setFilling = (updater) => setGameStateData(prev => ({ ...prev, filling: typeof updater === 'function' ? updater(prev.filling) : updater }));
  const setMomoStock = (updater) => setGameStateData(prev => ({ ...prev, momoStock: typeof updater === 'function' ? updater(prev.momoStock) : updater }));
  const setDay = (updater) => setGameStateData(prev => ({ ...prev, day: typeof updater === 'function' ? updater(prev.day) : updater }));
  const setUpgradeLevels = (updater) => setGameStateData(prev => ({ ...prev, upgradeLevels: typeof updater === 'function' ? updater(prev.upgradeLevels) : updater }));

  // --- Non-persistent state ---
  const [customers, setCustomers] = useState([]);
  const [isMakingMomo, setIsMakingMomo] = useState(false);
  const [makingProgress, setMakingProgress] = useState(0);
  const [lastServedInfo, setLastServedInfo] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [moneyEarnedToday, setMoneyEarnedToday] = useState(0);

  const dailyGoal = useMemo(() => 200 + (day - 1) * 100, [day]);

  // --- Derived Game Values (based on upgrades) ---
  const derivedValues = useMemo(() => {
    const steamerLevel = upgradeLevels.steamer;
    const fillingLevel = upgradeLevels.filling;
    const cartLevel = upgradeLevels.cart;

    return {
      momoPrice: BASE_MOMO_PRICE + (fillingLevel - 1) * 10,
      makeMomoTime: BASE_MAKE_MOMO_TIME_MS / (1 + (steamerLevel - 1) * 0.2),
      customerSpawnMin: 4000 / (1 + (cartLevel - 1) * 0.25),
      customerSpawnMax: 8000 / (1 + (cartLevel - 1) * 0.25),
    };
  }, [upgradeLevels]);

  // --- Game State Actions ---
  const startNextDay = () => {
    setDay(prev => prev + 1);
    setMoneyEarnedToday(0);
    setCustomers([]);
    setGameState('playing');
    notify.info(`Day ${day + 1} has begun!`);
  };

  const restartGame = () => {
    setGameStateData(INITIAL_STATE);
    setMoneyEarnedToday(0);
    setCustomers([]);
    setGameState('playing');
    notify.success("New game started!");
  };

  const resetProgress = () => {
    localStorage.removeItem(SAVE_GAME_KEY);
    restartGame();
    notify.info("All progress has been reset.");
  };

  // --- Game Actions ---
  const buyIngredients = () => {
    const cost = 25;
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setFlour(prev => prev + 5);
      setFilling(prev => prev + 5);
      notify.success("Purchased 5 flour and 5 fillings.");
    } else {
      notify.error("Not enough money for ingredients!");
    }
  };

  const makeMomo = useCallback(() => {
    const makeMomoTime = derivedValues.makeMomoTime;
    if (flour > 0 && filling > 0 && !isMakingMomo) {
      setIsMakingMomo(true);
      setMakingProgress(0);
      setFlour(prev => prev - 1);
      setFilling(prev => prev - 1);

      const interval = setInterval(() => {
        setMakingProgress(prev => {
          const newProgress = prev + 100 / (makeMomoTime / 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            setMomoStock(stock => stock + 10);
            setIsMakingMomo(false);
            notify.success("10 fresh momos are ready!");
            return 100;
          }
          return newProgress;
        });
      }, 100);
    } else if (!isMakingMomo) {
      notify.warning("Not enough ingredients!");
    }
  }, [flour, filling, isMakingMomo, notify, derivedValues.makeMomoTime, setFlour, setFilling, setMomoStock]);

  const serveCustomer = (customerId, customerRef) => {
    const momoPrice = derivedValues.momoPrice;
    if (momoStock >= SERVING_SIZE) {
      setMomoStock(prev => prev - SERVING_SIZE);
      setMoney(prev => prev + momoPrice);
      setMoneyEarnedToday(prev => prev + momoPrice);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (customerRef.current) {
        const rect = customerRef.current.getBoundingClientRect();
        setLastServedInfo({ id: customerId, x: rect.left, y: rect.top, amount: momoPrice });
      }
    } else {
      notify.warning(`Not enough momos for a full plate! (Need ${SERVING_SIZE})`);
    }
  };

  const purchaseUpgrade = (upgradeId) => {
    const upgrade = UPGRADES_CONFIG[upgradeId];
    const currentLevel = upgradeLevels[upgradeId];

    if (currentLevel >= upgrade.maxLevel) {
      notify.info("Already at max level!");
      return;
    }

    const cost = upgrade.getCost(currentLevel);
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setUpgradeLevels(prev => ({ ...prev, [upgradeId]: prev[upgradeId] + 1 }));
      notify.success(`${upgrade.name} upgraded to Level ${currentLevel + 1}!`);
    } else {
      notify.error("Not enough money for this upgrade.");
    }
  };

  // --- Auto-Save Effect ---
  useEffect(() => {
    try {
      // We only save the persistent parts of the state
      const dataToSave = {
        money,
        flour,
        filling,
        momoStock,
        day,
        upgradeLevels,
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save game data:", error);
    }
  }, [money, flour, filling, momoStock, day, upgradeLevels]);

  // --- Game Loop and State Checking Effects ---
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnCustomer = () => {
      const newCustomer = { id: Date.now(), patience: 100, spawnTime: Date.now() };
      setCustomers(prev => [...prev, newCustomer].slice(0, 8));
    };
    const randomInterval = Math.random() * (derivedValues.customerSpawnMax - derivedValues.customerSpawnMin) + derivedValues.customerSpawnMin;
    const intervalId = setInterval(spawnCustomer, randomInterval);
    return () => clearInterval(intervalId);
  }, [gameState, derivedValues.customerSpawnMin, derivedValues.customerSpawnMax]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const patienceInterval = setInterval(() => {
      setCustomers(currentCustomers =>
        currentCustomers
          .map(c => {
            const timeElapsed = Date.now() - c.spawnTime;
            const newPatience = 100 - (timeElapsed / 150);
            return { ...c, patience: Math.max(0, newPatience) };
          })
          .filter(c => c.patience > 0)
      );
    }, 100);
    return () => clearInterval(patienceInterval);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (moneyEarnedToday >= dailyGoal) {
      setGameState('day_complete');
      notify.success(`Day ${day} complete! Goal reached.`);
    }

    const canContinue = money >= 25 || flour > 0 || filling > 0 || momoStock >= SERVING_SIZE;
    if (!canContinue) {
      setGameState('game_over');
      notify.error("Game Over! You've run out of resources.");
    }
  }, [money, moneyEarnedToday, dailyGoal, flour, filling, momoStock, day, notify, gameState]);

  return {
    money, flour, filling, momoStock, day, customers, isMakingMomo, makingProgress, lastServedInfo,
    upgradeLevels, gameState, dailyGoal, moneyEarnedToday,
    buyIngredients, makeMomo, serveCustomer, purchaseUpgrade, startNextDay, restartGame, resetProgress,
  };
}

