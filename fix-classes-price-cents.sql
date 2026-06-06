-- Fix existing classes prices by multiplying by 100 to convert to cents
-- This assumes current prices are in rupees (e.g., 8, 29.99) and should be in cents (e.g., 800, 2999)

UPDATE classes 
SET price = price * 100
WHERE price > 0 AND price < 1000;
