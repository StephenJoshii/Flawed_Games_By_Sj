import { useState, useEffect, useCallback, useRef } from 'react';

// --- Game Constants ---
const CONSTANTS = {
  INITIAL_MONEY: 100,
  INITIAL_FLOUR: 5,
  INITIAL_FILLING: 5,
  INITIAL_MOMO_STOCK: 20,
  INGREDIENT_COST: 25,
  INGREDIENTS_PER_PURCHASE: 5,
  MOMOS_PER_BATCH: 10,
  MOMO_PRICE: 50,
  MAKE_MOMO_TIME_MS: 3000, // 3 seconds
  CUSTOMER_SPAWN_MIN_MS: 3000, // 3 seconds
  CUSTOMER_SPAWN_MAX_MS: 8000, // 8 seconds
  CUSTOMER_PATIENCE_SECONDS: 15,
};

export const useGameLogic = () => {
  // --- Game State ---
  const [money, setMoney] = useState(CONSTANTS.INITIAL_MONEY);
  const [flour, setFlour] = useState(CONSTANTS.INITIAL_FLOUR);
  const [filling, setFilling] = useState(CONSTANTS.INITIAL_FILLING);
  const [momoStock, setMomoStock] = useState(CONSTANTS.INITIAL_MOMO_STOCK);
  const [day, setDay] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [isMakingMomo, setIsMakingMomo] = useState(false);

  // useRef is used to keep track of timers without causing re-renders.
  const customerSpawnTimer = useRef(null);

  // --- Game Actions ---

  /**
   * Buys ingredients if the player has enough money.
   */
  const buyIngredients = useCallback(() => {
    if (money >= CONSTANTS.INGREDIENT_COST) {
      setMoney(prev => prev - CONSTANTS.INGREDIENT_COST);
      setFlour(prev => prev + CONSTANTS.INGREDIENTS_PER_PURCHASE);
      setFilling(prev => prev + CONSTANTS.INGREDIENTS_PER_PURCHASE);
    } else {
      console.warn("Not enough money for ingredients!");
    }
  }, [money]);

  /**
   * Creates a batch of momos if there are enough ingredients.
   */
  const makeMomo = useCallback(() => {
    if (flour >= 1 && filling >= 1 && !isMakingMomo) {
      setIsMakingMomo(true);
      setFlour(prev => prev - 1);
      setFilling(prev => prev - 1);

      setTimeout(() => {
        setMomoStock(prev => prev + CONSTANTS.MOMOS_PER_BATCH);
        setIsMakingMomo(false);
      }, CONSTANTS.MAKE_MOMO_TIME_MS);
    } else {
      console.warn("Not enough ingredients or already making momos!");
    }
  }, [flour, filling, isMakingMomo]);
  
  /**
   * Serves a plate of momos to a customer.
   * @param {string} customerId The ID of the customer to serve.
   */
  const serveCustomer = useCallback((customerId) => {
    if (momoStock > 0) {
      // Assuming 1 plate = 1 unit from stock for simplicity
      setMomoStock(prev => prev - 1); 
      setMoney(prev => prev + CONSTANTS.MOMO_PRICE);
      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
    } else {
      console.warn("No momos to serve!");
    }
  }, [momoStock]);

  // --- Game Loop & Timers ---

  // Spawns new customers at random intervals.
  useEffect(() => {
    const spawn = () => {
      const newCustomer = {
        id: crypto.randomUUID(),
        patience: CONSTANTS.CUSTOMER_PATIENCE_SECONDS,
      };
      setCustomers(prev => [...prev, newCustomer]);

      const nextSpawnTime = Math.random() * (CONSTANTS.CUSTOMER_SPAWN_MAX_MS - CONSTANTS.CUSTOMER_SPAWN_MIN_MS) + CONSTANTS.CUSTOMER_SPAWN_MIN_MS;
      customerSpawnTimer.current = setTimeout(spawn, nextSpawnTime);
    };

    customerSpawnTimer.current = setTimeout(spawn, CONSTANTS.CUSTOMER_SPAWN_MIN_MS);

    // Cleanup timer on component unmount.
    return () => clearTimeout(customerSpawnTimer.current);
  }, []); 

  // Updates customer patience every second.
  useEffect(() => {
    if (customers.length === 0) return;

    const patienceTimer = setInterval(() => {
      setCustomers(prevCustomers => 
        prevCustomers
          .map(c => ({ ...c, patience: c.patience - 1 })) 
          .filter(c => c.patience > 0) // Remove customers whose patience ran out
      );
    }, 1000);

    return () => clearInterval(patienceTimer);
  }, [customers]);


  // --- Exposed State & Actions ---
  return {
    // State
    money,
    flour,
    filling,
    momoStock,
    day,
    customers,
    isMakingMomo,
    
    // Actions
    buyIngredients,
    makeMomo,
    serveCustomer,

    // Constants
    CONSTANTS,
  };
};

