import { createFXModule } from "fx-react";
import { configModule } from "./config";
import { loggerModule } from "./logger";
import { performanceModule } from "./performance";
import { analyticsModule } from "./bi";
import { queryClientModule } from "./queryClient";



type Crypto = {
  id: string;
  symbol: string;
  name: string;
  price: number;
};

export const cryptoApiModule = createFXModule(
  {
    name: 'crypto',
    dependencies: [configModule, loggerModule, performanceModule, analyticsModule, queryClientModule],
    provides: {
      api: ({ logger, analytics, performance, reactQuery }) => {
        const { useQuery, client } = reactQuery.queryClient

        const fetchCryptoPrice = async (id: string) => {
          logger.log(`Fetching crypto price for ${id}`);
          const response = await fetch(`https://api.coincap.io/v2/assets/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch crypto price');
          }
          const data = await response.json();
          const price = parseFloat(data.data.priceUsd);
          analytics.trackEvent('crypto_price_fetched', { id, price });
          return price;
        };

        const getCryptoPrice = (id: string) =>
          performance.measureTime(`getCryptoPrice for ${id}`, () => fetchCryptoPrice(id));

        const useCryptoPriceQuery = (id: string) => {
          return useQuery(['cryptoPrice', id], () => getCryptoPrice(id), {
            onError: (error: unknown) => {
              logger.error(`Failed to fetch crypto price: ${error}`);
            },
            // Refetch every 60 seconds
            refetchInterval: 60000,
          });
        };

        const fetchTopCryptos = async (limit = 10) => {
          logger.log(`Fetching top ${limit} cryptocurrencies`);
          const response = await fetch(`https://api.coincap.io/v2/assets?limit=${limit}`);
          if (!response.ok) {
            throw new Error('Failed to fetch top cryptocurrencies');
          }
          const data = await response.json();
          analytics.trackEvent('crypto_price_fetched', data);
          return data.data.map((crypto: { id: string; symbol: string; name: string; price: string, priceUsd: string; }) => ({
            id: crypto.id,
            symbol: crypto.symbol,
            name: crypto.name,
            price: parseFloat(crypto.priceUsd),
          }));
        };

        const useTopCryptosQuery = (limit = 10) => {
          return useQuery<Crypto[]>(['topCryptos', limit], () => fetchTopCryptos(limit), {
            onError: (error: unknown) => {
              logger.error(`Failed to fetch top cryptocurrencies: ${error}`);
            },
            // Refetch every 5 minutes
            refetchInterval: 300000,
          });
        };

        return {
          getCryptoPrice,
          useCryptoPriceQuery,
          fetchTopCryptos,
          useTopCryptosQuery,
          invalidateCryptoPrice: (id?: string) =>
            client.invalidateQueries(id ? ['cryptoPrice', id] : 'cryptoPrice'),
          invalidateTopCryptos: () =>
            client.invalidateQueries('topCryptos'),
        };
      },
    },
  }
);
