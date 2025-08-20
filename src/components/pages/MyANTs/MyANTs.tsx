import {
  Card,
  Header,
  MyANTsTable,
  OwnedDomain,
} from '@blockydevs/arns-marketplace-ui';
import { addDays, addHours } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const now = new Date();
const oneHour = addHours(now, 1);
const twoHour = addHours(now, 2);
const twentyDays = addDays(now, 20);

const MyANTs = () => {
  const navigate = useNavigate();
  const exampleData3: OwnedDomain[] = [
    {
      name: 'BlockyDevs',
      action: () => {
        navigate(`/my-ants/blockydevs`);
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

  return (
    <div className="w-full px-8">
      <Header size="h1" className="my-12">
        My ANTs
      </Header>
      <Card>
        <MyANTsTable data={exampleData3} />
      </Card>
    </div>
  );
};

export default MyANTs;
