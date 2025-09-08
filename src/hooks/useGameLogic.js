import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Base Game Configuration ---
const BASE_MOMO_PRICE = 50;
const BASE_MAKE_MOMO_TIME_MS = 3000;

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

export function useGameLogic({ notify }) {
  // --- Core Game State ---
  const [money, setMoney] = useState(100);
  const [flour, setFlour] = useState(5);
  const [filling, setFilling] = useState(5);
  const [momoStock, setMomoStock] = useState(20);
  const [day, setDay] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [isMakingMomo, setIsMakingMomo] = useState(false);
  const [makingProgress, setMakingProgress] = useState(0);
  const [lastServedInfo, setLastServedInfo] = useState(null);

  // --- Upgrade State ---
  const [upgradeLevels, setUpgradeLevels] = useState({
    steamer: 1,
    filling: 1,
    cart: 1,
  });

  // --- Derived Game Values (based on upgrades) ---
  const derivedValues = useMemo(() => {
    const steamerLevel = upgradeLevels.steamer;
    const fillingLevel = upgradeLevels.filling;
    const cartLevel = upgradeLevels.cart;

    return {
      momoPrice: BASE_MOMO_PRICE + (fillingLevel - 1) * 10, // +Rs. 10 per level
      makeMomoTime: BASE_MAKE_MOMO_TIME_MS / (1 + (steamerLevel - 1) * 0.2), // 20% faster per level
      customerSpawnMin: 4000 / (1 + (cartLevel - 1) * 0.25), // 25% faster per level
      customerSpawnMax: 8000 / (1 + (cartLevel - 1) * 0.25),
    };
  }, [upgradeLevels]);


  // --- Game Actions ---
  const buyIngredients = () => { /* ... no changes ... */ };

  const makeMomo = useCallback(() => {
    const makeMomoTime = derivedValues.makeMomoTime; // Use derived value
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
    const momoPrice = derivedValues.momoPrice; // Use derived value
    if (momoStock > 0) {
      setMomoStock(prev => prev - 10);
      setMoney(prev => prev + momoPrice);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (customerRef.current) {
        const rect = customerRef.current.getBoundingClientRect();
        setLastServedInfo({ id: customerId, x: rect.left, y: rect.top, amount: momoPrice });
      }
    } else {
      notify.warning("No momos in stock!");
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

  // --- Game Loop Effects ---
  useEffect(() => {
    const spawnCustomer = () => {
      const newCustomer = { id: Date.now(), patience: 100, spawnTime: Date.now() };
      setCustomers(prev => [...prev, newCustomer]);
    };
    const randomInterval = Math.random() * (derivedValues.customerSpawnMax - derivedValues.customerSpawnMin) + derivedValues.customerSpawnMin;
    const intervalId = setInterval(spawnCustomer, randomInterval);
    return () => clearInterval(intervalId);
  }, [derivedValues.customerSpawnMin, derivedValues.customerSpawnMax]);

  useEffect(() => { /* ... no changes ... */ }, []);

  return {
    money, flour, filling, momoStock, day, customers, isMakingMomo, makingProgress, lastServedInfo,
    upgradeLevels, // Export upgrade levels
    buyIngredients, makeMomo, serveCustomer, purchaseUpgrade, // Export purchase function
  };
}

