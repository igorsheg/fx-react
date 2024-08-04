import { ReactNode } from "react";
import { createFXModule } from "react-fx";
import { QueryClient, QueryClientProvider as ReactQueryQueryClientProvider, useQuery } from 'react-query';

export const queryClientModule = createFXModule({
  name: 'reactQuery',
  dependencies: [],
  provides: {
    queryClient: () => {
      const client = new QueryClient();

      const QueryClientProvider = ({ children }: { children: ReactNode }) => {
        return (
          <ReactQueryQueryClientProvider client={client}>
            {children}
          </ReactQueryQueryClientProvider>
        )
      };

      return {
        client,
        useQuery,
        QueryClientProvider
      }
    },
  },
});
