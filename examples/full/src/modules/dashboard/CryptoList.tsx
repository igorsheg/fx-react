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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Top Cryptocurrencies
        </h3>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {cryptos.map((crypto) => (
          <li key={crypto.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                    {crypto.name}
                  </p>
                  <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {crypto.symbol.toUpperCase()}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    ${crypto.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default CryptoList;
