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

  const totalItems = queryActiveListings.data?.totalItems ?? 1;
  const limit = queryActiveListings.data?.limit ?? 1;

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return (
    <Card className="flex flex-col gap-8">
      <ActiveListingTable
        data={queryActiveListings.data?.items ?? []}
        isPending={queryActiveListings.isPending}
        error={queryActiveListings.error?.message}
      />
      {!queryActiveListings.isPending && (
        <Pagination
          totalPages={totalPages}
          activeIndex={page}
          onPageChange={setPage}
        />
      )}
    </Card>
  );
};

export default ActiveListingsTab;
