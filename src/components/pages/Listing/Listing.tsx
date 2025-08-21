import {
  fetchActiveListings,
  fetchCompletedListings,
} from '@blockydevs/arns-marketplace-data';
import {
  ActiveListingTable,
  Card,
  CompletedListingTable,
  type Domain,
  Header,
  Pagination,
  Paragraph,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@blockydevs/arns-marketplace-ui';
import { useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { useState } from 'react';

const now = new Date();
const twentyDays = addDays(now, 20);

const MARKETPLACE_PROCESS = '8eKJuL9fp8EyH6Gqnqd174pksjCzELyJIbmTnmTkKcI';

const Listing = () => {
  const [index, setIndex] = useState(1);
  const [{ walletAddress, wallet }] = useWalletState();

  const queryActiveListings = useQuery({
    enabled: !!walletAddress,
    queryKey: ['listings', 'active', walletAddress],
    queryFn: async () => {
      console.log('fetching...');
      try {
        const data = await fetchActiveListings({
          process: MARKETPLACE_PROCESS,
          wallet: wallet?.contractSigner,
          debug: true,
        });
        console.log({ data });
        return data;
      } catch (err) {
        console.error('Error fetching active listings:', err);
        throw err;
      }
    },
    select: (data) => {
      return data.map((listing): Domain => {
        return {
          name: listing.name,
          createdAt: listing.createdAt,
          endDate: twentyDays.toISOString(),
          price: {
            type: 'buyout',
            symbol: 'ARIO',
            value: Number(listing.price),
          },
          type: {
            value: listing.type === 'fixed' ? 'fixed-price' : listing.type,
          },
          action: () => {
            console.log('clicked');
          },
        };
      });
    },
  });

  const queryCompletedListings = useQuery({
    enabled: !!walletAddress,
    queryKey: ['listings', 'completed', walletAddress],
    queryFn: async () => {
      return fetchCompletedListings();
    },
    select: (data) => {
      return data.map((listing): Domain => {
        return {
          name: listing.name,
          createdAt: listing.createdAt,
          endDate: listing.completedAt,
          price: {
            type: 'buyout',
            symbol: 'ARIO',
            value: Number(listing.finalPrice),
          },
          type: {
            value: listing.type === 'fixed' ? 'fixed-price' : listing.type,
          },
          action: () => {
            console.log('clicked');
          },
        };
      });
    },
  });

  if (!walletAddress) {
    return (
      <div className="w-full px-8">
        <Paragraph>Connect your wallet to view listings</Paragraph>
      </div>
    );
  }

  return (
    <div className="w-full px-8">
      <Header size="h1" className="my-12">
        ArNS Marketplace
      </Header>
      <Tabs defaultValue="1">
        <TabsList>
          <TabsTrigger value="1">Active Listings</TabsTrigger>
          <TabsTrigger value="2">Completed Listings</TabsTrigger>
        </TabsList>
        <TabsContent value="1">
          <Card className="flex flex-col gap-8">
            {queryActiveListings.isLoading ? (
              <>
                <Paragraph>Fetching active listings...</Paragraph>
              </>
            ) : (
              <>
                <ActiveListingTable data={queryActiveListings.data ?? []} />
                <Pagination
                  totalPages={3}
                  activeIndex={index}
                  onPageChange={setIndex}
                />
              </>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="2">
          <Card className="flex flex-col gap-8">
            {queryCompletedListings.isLoading ? (
              <>
                <Paragraph>Fetching completed listings...</Paragraph>
              </>
            ) : (
              <>
                <CompletedListingTable
                  data={queryCompletedListings.data ?? []}
                />
                <Pagination
                  totalPages={3}
                  activeIndex={index}
                  onPageChange={setIndex}
                />
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Listing;
