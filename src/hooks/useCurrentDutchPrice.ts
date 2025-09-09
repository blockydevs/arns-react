import { useQuery } from '@tanstack/react-query';

interface DutchAuctionParams {
  startingPrice: string;
  minimumPrice: string;
  decreaseInterval: string;
  decreaseStep: string;
  createdAt: number;
}

/**
 * A TanStack Query hook that calculates and returns the current discrete price
 * of a Dutch auction, refetching every second to provide a live value.
 *
 * @param params - The static parameters of the Dutch auction.
 * @returns The result of the useQuery hook containing the current price.
 */
export function useCurrentDutchPrice(params: DutchAuctionParams) {
  const { startingPrice, minimumPrice, decreaseInterval, decreaseStep, createdAt } = params;

  return useQuery({
    // The query key includes all static auction parameters to ensure uniqueness.
    queryKey: ['currentDutchPrice', startingPrice, minimumPrice, decreaseInterval, decreaseStep, createdAt],
    
    queryFn: () => {
      // This function is the core of the discrete calculation, mirroring the smart contract.
      const now = BigInt(Date.now());
      const createdAtBigInt = BigInt(createdAt);
      const startingPriceBigInt = BigInt(startingPrice);
      const minimumPriceBigInt = BigInt(minimumPrice);
      const decreaseIntervalBigInt = BigInt(decreaseInterval);
      const decreaseStepBigInt = BigInt(decreaseStep);

      // If the auction hasn't started or the interval is invalid, return the starting price.
      if (now < createdAtBigInt || decreaseIntervalBigInt <= 0n) {
        return startingPrice;
      }

      const timePassed = now - createdAtBigInt;
      
      // BigInt division truncates the remainder, exactly like `math.floor` in the contract.
      const intervalsPassed = timePassed / decreaseIntervalBigInt;
      
      const priceReduction = intervalsPassed * decreaseStepBigInt;
      
      let currentPrice = startingPriceBigInt - priceReduction;

      // Ensure the price does not fall below the minimum.
      if (currentPrice < minimumPriceBigInt) {
        currentPrice = minimumPriceBigInt;
      }

      return currentPrice.toString();
    },
    
    refetchInterval: 15000,
    
    staleTime: 15000,

    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}