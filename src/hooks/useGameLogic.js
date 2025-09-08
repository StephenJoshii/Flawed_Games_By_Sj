import { useState, useEffect, useCallback } from 'react';

// --- Game Configuration ---
const INGREDIENT_COST = 25;
const INGREDIENTS_PER_PURCHASE = 5;
const MOMOS_PER_BATCH = 10;
const MOMO_PRICE = 50;
const MAKE_MOMO_TIME_MS = 3000;
const CUSTOMER_SPAWN_MIN_MS = 4000;
const CUSTOMER_SPAWN_MAX_MS = 8000;
const CUSTOMER_PATIENCE_MS = 15000;

// The hook now accepts a `notify` function for showing toasts
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
  const [lastServedInfo, setLastServedInfo] = useState(null); // Tracks last served customer for animation

  // --- Core Game Actions ---

  const buyIngredients = () => {
    if (money >= INGREDIENT_COST) {
      setMoney(prev => prev - INGREDIENT_COST);
      setFlour(prev => prev + INGREDIENTS_PER_PURCHASE);
      setFilling(prev => prev + INGREDIENTS_PER_PURCHASE);
      notify.success("Ingredients Purchased!");
    } else {
      notify.error("Not enough money!");
    }
  };

  const makeMomo = useCallback(() => {
    if (flour > 0 && filling > 0 && !isMakingMomo) {
      setIsMakingMomo(true);
      setMakingProgress(0);
      setFlour(prev => prev - 1);
      setFilling(prev => prev - 1);

      const interval = setInterval(() => {
        setMakingProgress(prev => {
          const newProgress = prev + 100 / (MAKE_MOMO_TIME_MS / 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            setMomoStock(stock => stock + MOMOS_PER_BATCH);
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
  }, [flour, filling, isMakingMomo, notify]);


  const serveCustomer = (customerId, customerRef) => {
    if (momoStock > 0) {
      setMomoStock(prev => prev - 1);
      setMoney(prev => prev + MOMO_PRICE);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      
      // Get position of the customer card for the animation
      if (customerRef.current) {
        const rect = customerRef.current.getBoundingClientRect();
        setLastServedInfo({ id: customerId, x: rect.left, y: rect.top });
      }

    } else {
      notify.warning("No momos in stock!");
    }
  };

  // --- Game Loop Effects (No changes here) ---
  useEffect(() => {
    const spawnCustomer = () => {
      const newCustomer = { id: Date.now(), patience: 100, spawnTime: Date.now() };
      setCustomers(prev => [...prev, newCustomer]);
    };
    const randomInterval = Math.random() * (CUSTOMER_SPAWN_MAX_MS - CUSTOMER_SPAWN_MIN_MS) + CUSTOMER_SPAWN_MIN_MS;
    const intervalId = setInterval(spawnCustomer, randomInterval);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCustomers(currentCustomers =>
        currentCustomers.map(c => {
          const elapsedTime = Date.now() - c.spawnTime;
          const newPatience = 100 - (elapsedTime / CUSTOMER_PATIENCE_MS) * 100;
          if (newPatience <= 0) return null;
          return { ...c, patience: newPatience };
        }).filter(Boolean)
      );
    }, 100);
    return () => clearInterval(timer);
  }, []);


  return {
    money, flour, filling, momoStock, day, customers, isMakingMomo, makingProgress, lastServedInfo,
    buyIngredients, makeMomo, serveCustomer,
  };
}

