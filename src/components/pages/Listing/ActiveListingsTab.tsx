import {
  fetchActiveListings,
  marioToArio,
} from '@blockydevs/arns-marketplace-data';
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
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

// FIXME: move to ui package (probably)
export function useCursorPagination(pageSize = 10) {
  const [page, setPage] = useState(1);
  // Store all known cursors
  const cursorsRef = useRef<Record<number, string | undefined>>({
    1: undefined, // First page has no cursor
  });

  // Get cursor for current page (undefined if unknown)
  const getCurrentCursor = () => cursorsRef.current[page];

  // Store next cursor for the next page
  const storeNextCursor = (
    nextCursor: string | undefined,
    hasMore: boolean,
  ) => {
    if (nextCursor && hasMore) {
      cursorsRef.current[page + 1] = nextCursor;
    }
  };

  // Calculate total pages from response
  const getTotalPages = (totalItems?: number, hasMore = false) => {
    // If we know total items, calculate exact pages
    if (totalItems !== undefined) {
      return Math.max(1, Math.ceil(totalItems / pageSize));
    }

    // Otherwise estimate from known pages + hasMore flag
    const knownPages = Object.keys(cursorsRef.current).length;
    return hasMore
      ? Math.max(page + 1, knownPages)
      : Math.max(page, knownPages);
  };

  // Change page - only allows navigation to known pages
  const handlePageChange = (newPage: number) => {
    console.log(cursorsRef.current, newPage in cursorsRef.current);
    // Don't allow navigation to unknown pages (except next page if hasMore)
    if (newPage in cursorsRef.current || newPage === 1) {
      setPage(newPage);
    }
  };

  return {
    page,
    pageSize,
    cursor: getCurrentCursor(),
    setPage: handlePageChange,
    storeNextCursor,
    getTotalPages,
  };
}

const ActiveListingsTab = () => {
  const navigate = useNavigate();
  const [{ aoClient }] = useGlobalState();
  const pagination = useCursorPagination(PAGE_SIZE);

  const queryActiveListings = useQuery({
    queryKey: marketplaceQueryKeys.listings.list('active', {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }),
    queryFn: () => {
      return fetchActiveListings({
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
        items: data.items.map(
          (item): Domain => ({
            name: item.name,
            endDate: item.expiresAt ?? undefined,
            price: {
              type: item.type === 'english' ? 'bid' : 'buyout',
              symbol: 'ARIO',
              value: marioToArio(item.price),
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

  const { totalItems, hasMore } = queryActiveListings.data ?? {};
  const totalPages = pagination.getTotalPages(totalItems, hasMore);

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
          activeIndex={pagination.page}
          onPageChange={pagination.setPage}
        />
      )}
    </Card>
  );
};

export default ActiveListingsTab;
