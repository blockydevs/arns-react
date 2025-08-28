import { fetchCompletedListings } from '@blockydevs/arns-marketplace-data';
import {
  Card,
  CompletedListingTable,
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

const CompletedListingsTab = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [{ aoClient }] = useGlobalState();

  const queryCompletedListings = useQuery({
    queryKey: marketplaceQueryKeys.listings.list('completed', {
      pageSize: PAGE_SIZE,
    }),
    queryFn: () => {
      return fetchCompletedListings({
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
            endDate: item.endedAt,
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

  if (queryCompletedListings.isPending) {
    return <p className="text-white text-center">loading...</p>;
  }

  if (queryCompletedListings.error) {
    return (
      <p className="text-error text-center">
        {queryCompletedListings.error.message}
      </p>
    );
  }

  // FIXME: proper pagination, avoid dividing by 0
  const totalPages = Math.max(
    1,
    Math.ceil(
      queryCompletedListings.data.totalItems /
        queryCompletedListings.data.limit,
    ),
  );

  return (
    <Card className="flex flex-col gap-8">
      <CompletedListingTable data={queryCompletedListings.data.items} />
      <Pagination
        totalPages={totalPages}
        activeIndex={page}
        onPageChange={setPage}
      />
    </Card>
  );
};

export default CompletedListingsTab;
