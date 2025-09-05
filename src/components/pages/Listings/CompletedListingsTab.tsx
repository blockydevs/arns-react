import {
  fetchCompletedListings,
  marioToArio,
} from '@blockydevs/arns-marketplace-data';
import {
  Card,
  CompletedListingTable,
  type Domain,
  Pagination,
  calculateCurrentDutchListingPrice,
  useCursorPagination,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

const CompletedListingsTab = () => {
  const navigate = useNavigate();
  const [{ aoClient }] = useGlobalState();
  const pagination = useCursorPagination(PAGE_SIZE);

  const queryCompletedListings = useQuery({
    queryKey: marketplaceQueryKeys.listings.list('completed', {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }),
    queryFn: () => {
      return fetchCompletedListings({
        ao: aoClient,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
        limit: pagination.pageSize,
        cursor: pagination.cursor,
      });
    },
    select: (data) => {
      pagination.storeNextCursor(data.nextCursor, !!data.hasMore);

      return {
        ...data,
        items: data.items.map((item): Domain => {
          const marioPrice =
            item.type === 'english'
              ? item.highestBid ?? item.startingPrice
              : item.type === 'dutch'
              ? calculateCurrentDutchListingPrice({
                  startingPrice: item.startingPrice,
                  minimumPrice: item.minimumPrice,
                  decreaseInterval: item.decreaseInterval,
                  decreaseStep: item.decreaseStep,
                  createdAt: new Date(item.createdAt).getTime(),
                  endedAt: new Date(item.endedAt).getTime(),
                })
              : item.price;
          const currentPrice = marioToArio(marioPrice);

          return {
            name: item.name,
            createdAt: item.createdAt,
            endDate: item.endedAt,
            price: {
              type: item.type === 'english' ? 'bid' : 'buyout',
              symbol: 'ARIO',
              value: Number(currentPrice),
            },
            type: {
              value: item.type,
            },
            action: () => {
              navigate(`/listings/${item.orderId}`);
            },
          };
        }),
      };
    },
  });

  const { totalItems } = queryCompletedListings.data ?? {};
  const totalPages = pagination.getTotalPages(totalItems);

  return (
    <Card className="flex flex-col gap-8">
      <CompletedListingTable
        data={queryCompletedListings.data?.items ?? []}
        isPending={queryCompletedListings.isPending}
        error={queryCompletedListings.error?.message}
      />
      {!queryCompletedListings.isPending && (
        <Pagination
          totalPages={totalPages}
          activeIndex={pagination.page}
          onPageChange={pagination.setPage}
        />
      )}
    </Card>
  );
};

export default CompletedListingsTab;
