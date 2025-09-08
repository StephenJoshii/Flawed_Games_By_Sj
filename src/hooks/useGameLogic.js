import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Base Game Configuration ---
const BASE_MOMO_PRICE = 50;
const BASE_MAKE_MOMO_TIME_MS = 3000;
const SERVING_SIZE = 10; // A full plate of momos

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

export function useGameLogic({ notify }) {
  // --- Core Game State ---
  const [money, setMoney] = useState(INITIAL_STATE.money);
  const [flour, setFlour] = useState(INITIAL_STATE.flour);
  const [filling, setFilling] = useState(INITIAL_STATE.filling);
  const [momoStock, setMomoStock] = useState(INITIAL_STATE.momoStock);
  const [day, setDay] = useState(INITIAL_STATE.day);
  const [customers, setCustomers] = useState([]);
  const [isMakingMomo, setIsMakingMomo] = useState(false);
  const [makingProgress, setMakingProgress] = useState(0);
  const [lastServedInfo, setLastServedInfo] = useState(null);

  // --- Game Status State ---
  const [gameState, setGameState] = useState('playing'); // 'playing', 'day_complete', 'game_over'
  const [moneyEarnedToday, setMoneyEarnedToday] = useState(0);
  const dailyGoal = useMemo(() => 200 + (day - 1) * 100, [day]);

  // --- Upgrade State ---
  const [upgradeLevels, setUpgradeLevels] = useState(INITIAL_STATE.upgradeLevels);

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
    setMoney(INITIAL_STATE.money);
    setFlour(INITIAL_STATE.flour);
    setFilling(INITIAL_STATE.filling);
    setMomoStock(INITIAL_STATE.momoStock);
    setDay(INITIAL_STATE.day);
    setUpgradeLevels(INITIAL_STATE.upgradeLevels);
    setMoneyEarnedToday(0);
    setCustomers([]);
    setGameState('playing');
    notify.success("New game started!");
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
  }, [flour, filling, isMakingMomo, notify, derivedValues.makeMomoTime]);

  const serveCustomer = (customerId, customerRef) => {
    const momoPrice = derivedValues.momoPrice;
    if (momoStock >= SERVING_SIZE) {
      setMomoStock(prev => prev - SERVING_SIZE);
      setMoney(prev => prev + momoPrice);
      setMoneyEarnedToday(prev => prev + momoPrice); // Track daily progress
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

  // --- Game Loop and State Checking Effects ---
  useEffect(() => {
    if (gameState !== 'playing') return; // Stop spawning customers if game is paused

    const spawnCustomer = () => {
      const newCustomer = { id: Date.now(), patience: 100, spawnTime: Date.now() };
      setCustomers(prev => [...prev, newCustomer].slice(0, 8)); // Cap customers at 8
    };
    const randomInterval = Math.random() * (derivedValues.customerSpawnMax - derivedValues.customerSpawnMin) + derivedValues.customerSpawnMin;
    const intervalId = setInterval(spawnCustomer, randomInterval);
    return () => clearInterval(intervalId);
  }, [gameState, derivedValues.customerSpawnMin, derivedValues.customerSpawnMax]);

  useEffect(() => {
    if (gameState !== 'playing') return; // Stop patience drain if game is paused
    
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

  // Effect to check for win/loss conditions
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
    buyIngredients, makeMomo, serveCustomer, purchaseUpgrade, startNextDay, restartGame,
  };
}

