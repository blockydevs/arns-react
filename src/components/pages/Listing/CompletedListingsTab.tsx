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

const CompletedListingsTab = () => {
  const [index, setIndex] = useState(1);
  const navigate = useNavigate();

  const [{ aoClient }] = useGlobalState();

  const queryCompletedListings = useQuery({
    queryKey: marketplaceQueryKeys.listings.list('completed'),
    queryFn: () => {
      return fetchCompletedListings({
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
            endDate: item.endedAt,
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

  // FIXME: divide by 0
  // FIXME: page size
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
        activeIndex={index}
        onPageChange={setIndex}
      />
    </Card>
  );
};

export default CompletedListingsTab;
