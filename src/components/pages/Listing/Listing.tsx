import { fetchActiveListings } from '@blockydevs/arns-marketplace-data';
import {
  ActiveListingTable,
  Card,
  CompletedListingTable,
  type Domain,
  Header,
  Pagination,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState } from '@src/state';
import { BLOCKYDEVS_ACTIVITY_PROCESS_ID } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { addDays, addHours, subDays, subHours } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const now = new Date();
const oneHour = addHours(now, 1);
const twoHour = addHours(now, 2);
const twentyDays = addDays(now, 20);

const oneHourAgo = subHours(now, 1);
const twoDaysAgo = subDays(now, 2);
const twentyDaysAgo = subDays(now, 20);

const Listing = () => {
  const [index, setIndex] = useState(1);
  const navigate = useNavigate();

  const exampleData: Domain[] = [
    {
      name: 'BlockyDevs',
      action: () => {
        navigate('/listing/blockydevs');
      },
      createdAt: oneHourAgo.toISOString(),
      endDate: oneHour.toISOString(),
      price: { type: 'bid', symbol: 'ARIO', value: 1200 },
      type: { value: 'english' },
    },
    {
      name: 'DomainName',
      action: () => {
        console.log('test');
      },
      createdAt: twoDaysAgo.toISOString(),
      endDate: twoHour.toISOString(),
      price: { type: 'buyout', symbol: 'ARIO', value: 300 },
      type: { value: 'fixed-price' },
    },
    {
      name: 'DomainName',
      action: () => {
        console.log('test');
      },
      createdAt: twentyDaysAgo.toISOString(),
      endDate: twentyDays.toISOString(),
      price: { type: 'buyout', symbol: 'ARIO', value: 140 },
      type: { value: 'dutch' },
    },
  ];

  const [{ aoClient }] = useGlobalState();

  const queryListings = useQuery({
    queryKey: ['listings', 'active'],
    queryFn: () => {
      return fetchActiveListings({
        ao: aoClient,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
      });
    },
    select: (data) => {
      return {
        ...data,
        items: data.items.map(
          (item): Domain => ({
            name: item.name,
            endDate: item.expiresAt ?? new Date().toISOString(),
            price: {
              type: item.type === 'english' ? 'bid' : 'buyout',
              symbol: 'ARIO',
              value: Number(item.price),
            },
            type: {
              value: item.type === 'fixed' ? 'fixed-price' : item.type,
            },
            action: () => {
              navigate(`/listing/${item.orderId}`);
            },
          }),
        ),
      };
    },
  });

  if (queryListings.isPending) {
    return <p className="text-white text-center">loading...</p>;
  }

  if (queryListings.error) {
    return (
      <p className="text-error text-center">{queryListings.error.message}</p>
    );
  }

  // FIXME: divide by 0
  // FIXME: page size
  const totalPages = Math.max(
    1,
    Math.ceil(queryListings.data.totalItems / queryListings.data.limit),
  );

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
            <ActiveListingTable data={queryListings.data.items} />
            <Pagination
              totalPages={totalPages}
              activeIndex={index}
              onPageChange={setIndex}
            />
          </Card>
        </TabsContent>
        <TabsContent value="2">
          <Card className="flex flex-col gap-8">
            <CompletedListingTable data={exampleData} />
            <Pagination
              totalPages={3}
              activeIndex={index}
              onPageChange={setIndex}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Listing;
