import { fetchActiveListings } from '@blockydevs/arns-marketplace-data';
import {
  ActiveListingTable,
  Card,
  type Domain,
  Pagination,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ActiveListingsTab = () => {
  const [index, setIndex] = useState(1);
  const navigate = useNavigate();
  const [{ aoClient }] = useGlobalState();
  const queryActiveListings = useQuery({
    queryKey: marketplaceQueryKeys.listings.list('active'),
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
            endDate: item.expiresAt,
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

  if (queryActiveListings.isPending) {
    return <p className="text-white text-center">loading...</p>;
  }

  if (queryActiveListings.error) {
    return (
      <p className="text-error text-center">
        {queryActiveListings.error.message}
      </p>
    );
  }

  // FIXME: divide by 0
  // FIXME: page size
  const totalPages = Math.max(
    1,
    Math.ceil(
      queryActiveListings.data.totalItems / queryActiveListings.data.limit,
    ),
  );

  return (
    <Card className="flex flex-col gap-8">
      <ActiveListingTable data={queryActiveListings.data.items} />
      <Pagination
        totalPages={totalPages}
        activeIndex={index}
        onPageChange={setIndex}
      />
    </Card>
  );
};

export default ActiveListingsTab;
