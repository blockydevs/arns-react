import {
  Header,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@blockydevs/arns-marketplace-ui';
import ActiveListingsTab from '@src/components/pages/Listing/ActiveListingsTab';
import CompletedListingsTab from '@src/components/pages/Listing/CompletedListingsTab';

const Listing = () => {
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
          <ActiveListingsTab />
        </TabsContent>
        <TabsContent value="2">
          <CompletedListingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Listing;
