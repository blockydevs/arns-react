import {
  ActiveListingTable,
  CompletedListingTable,
  type Domain,
  MyANTsTable,
  type OwnedDomain,
} from '@blockydevs/arns-marketplace-ui';
import { addDays, addHours, subDays, subHours } from 'date-fns';

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

const exampleData3: OwnedDomain[] = [
  {
    name: 'BlockyDevs',
    action: () => {
      console.log('test');
    },
    endDate: oneHour.toISOString(),
    price: { type: 'bid', symbol: 'ARIO', value: 1200 },
    type: { value: 'english' },
    status: 'idle',
  },
  {
    name: 'DomainName',
    action: () => {
      console.log('test');
    },
    endDate: twoHour.toISOString(),
    price: { type: 'buyout', symbol: 'ARIO', value: 300 },
    type: { value: 'fixed-price' },
    status: 'listed',
  },
  {
    name: 'DomainName',
    action: () => {
      console.log('test');
    },
    endDate: twentyDays.toISOString(),
    price: { type: 'buyout', symbol: 'ARIO', value: 140 },
    type: { value: 'dutch' },
    status: 'sold',
  },
];

const Listing = () => {
  return (
    <div className="flex flex-col gap-4 px-4">
      <ActiveListingTable data={exampleData2} />
      <CompletedListingTable data={exampleData} />
      <MyANTsTable data={exampleData3} />
    </div>
  );
};

export default Listing;
