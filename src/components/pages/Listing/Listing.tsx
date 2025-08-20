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
import { addDays, addHours, subDays, subHours } from 'date-fns';
import { useState } from 'react';

const now = new Date();
const oneHour = addHours(now, 1);
const twoHour = addHours(now, 2);
const twentyDays = addDays(now, 20);

const oneHourAgo = subHours(now, 1);
const twoDaysAgo = subDays(now, 2);
const twentyDaysAgo = subDays(now, 20);

const exampleData: Domain[] = [
  {
    name: 'BlockyDevs',
    action: () => {
      console.log('test');
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

const exampleData2: Domain[] = [
  {
    name: 'BlockyDevs',
    action: () => {
      console.log('test');
    },
    endDate: oneHour.toISOString(),
    price: { type: 'bid', symbol: 'ARIO', value: 1200 },
    type: { value: 'english' },
  },
  {
    name: 'DomainName',
    action: () => {
      console.log('test');
    },
    endDate: twoHour.toISOString(),
    price: { type: 'buyout', symbol: 'ARIO', value: 300 },
    type: { value: 'fixed-price' },
  },
  {
    name: 'DomainName',
    action: () => {
      console.log('test');
    },
    endDate: twentyDays.toISOString(),
    price: { type: 'buyout', symbol: 'ARIO', value: 140 },
    type: { value: 'dutch' },
  },
  {
    name: 'DomainName',
    action: () => {
      console.log('test');
    },
    endDate: twentyDays.toISOString(),
    price: { type: 'buyout', symbol: 'ARIO', value: 300 },
    type: {
      value: 'dutch',
      label: 'Special dutch auction',
      highlightColor: 'gold',
    },
  },
  {
    name: 'VeryLongDomainNameButItsVeryVeryVeryVeryVeeeeeeeeryLong',
    action: () => {
      console.log('test');
    },
    endDate: twentyDays.toISOString(),
    price: { type: 'buyout', symbol: 'ARIO', value: 140 },
    type: {
      value: 'fixed-price',
      label: 'Fixed price 1.0',
      highlightColor: 'turquoise',
    },
  },
];

const Listing = () => {
  const [index, setIndex] = useState(1);
  return (
    <div className="w-full px-8 arns-marketplace-ui">
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
            <ActiveListingTable data={exampleData2} />
            <Pagination
              totalPages={3}
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
