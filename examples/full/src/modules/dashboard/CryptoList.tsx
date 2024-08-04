import { motion } from 'framer-motion';
import React from 'react';

type Crypto = {
  id: string;
  symbol: string;
  name: string;
  price: number;
};

type CryptoListProps = {
  cryptos: Crypto[];
};

const CryptoList: React.FC<CryptoListProps> = ({ cryptos }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Top Cryptocurrencies</h2>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {cryptos.map((crypto) => (
          <li key={crypto.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-150 ease-in-out">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{crypto.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{crypto.symbol}</span>
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">${crypto.price.toFixed(2)}</span>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default CryptoList;
