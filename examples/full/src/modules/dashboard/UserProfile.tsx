import { motion } from "framer-motion";

function UserProfile({ userData }: { userData: { name: string, email: string } }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Profile</h2>
      </div>
      <div className="px-6 py-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">{userData.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">{userData.email}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default UserProfile
