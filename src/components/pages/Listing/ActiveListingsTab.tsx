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

const PAGE_SIZE = 10;

const ActiveListingsTab = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [{ aoClient }] = useGlobalState();
  const queryActiveListings = useQuery({
    queryKey: marketplaceQueryKeys.listings.list('active', {
      pageSize: PAGE_SIZE,
    }),
    queryFn: () => {
      return fetchActiveListings({
        ao: aoClient,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
        limit: PAGE_SIZE,
      });
    },
    select: (data) => {
      return {
        ...data,
        items: data.items.map(
          (item): Domain => ({
            name: item.name,
            endDate: item.expiresAt ?? undefined,
            price: {
              type: item.type === 'english' ? 'bid' : 'buyout',
              symbol: 'ARIO',
              value: Number(item.price),
            },
            type: {
              value: item.type,
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

  // FIXME: proper pagination, avoid dividing by 0
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
        activeIndex={page}
        onPageChange={setPage}
      />
    </Card>
  );
};

export default ActiveListingsTab;
