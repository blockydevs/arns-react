import { createAoSigner } from '@ar.io/sdk';
import {
  fetchListingDetails,
  marioToArio,
  settleListing,
} from '@blockydevs/arns-marketplace-data';
import {
  BidsTable,
  Button,
  Card,
  DecreaseScheduleTable,
  DetailsCard,
  Header,
  Input,
  Pagination,
  Paragraph,
  Row,
  Schedule,
  Spinner,
  calculateCurrentDutchListingPrice,
  formatDate,
  formatMillisecondsToDate,
  getDutchListingSchedule,
  shortenAddress,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState, useWalletState } from '@src/state';
import {
  AO_LINK_EXPLORER_URL,
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BIDS_PER_PAGE = 5;

const Details = () => {
  const [bidPrice, setBidPrice] = useState<string | undefined>(undefined);
  const [bidPage, setBidPage] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [{ aoClient }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const queryDetails = useQuery({
    enabled: !!id,
    queryKey: marketplaceQueryKeys.listings.item(id),
    queryFn: () => {
      if (!id) throw new Error('No id provided');

      return fetchListingDetails({
        ao: aoClient,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
        orderId: id,
      });
    },
  });

  const mutationSettleListing = useMutation({
    mutationFn: async ({ listingId }: { listingId: string }) => {
      if (!wallet || !walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!wallet.contractSigner) {
        throw new Error('No wallet signer available');
      }

      return await settleListing({
        ao: aoClient,
        orderId: listingId,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        signer: createAoSigner(wallet.contractSigner),
      });
    },
  });

  if (queryDetails.isPending) {
    return (
      <div className="flex justify-center grow items-center">
        <Spinner className="text-primary size-8" />
      </div>
    );
  }

  if (queryDetails.error) {
    return (
      <p className="text-error text-center">
        Failed to load listing details: {queryDetails.error.message}
      </p>
    );
  }

  const listing = queryDetails.data;
  const marioPrice =
    listing.type === 'english'
      ? listing.highestBid ?? listing.startingPrice
      : listing.type === 'dutch'
      ? calculateCurrentDutchListingPrice({
          startingPrice: listing.startingPrice,
          minimumPrice: listing.minimumPrice,
          decreaseInterval: listing.decreaseInterval,
          decreaseStep: listing.decreaseStep,
          createdAt: new Date(listing.createdAt).getTime(),
        })
      : listing.price;
  const currentPrice = marioToArio(marioPrice);

  // english type only
  const allBids =
    listing.type === 'english'
      ? listing.bids.map((bid) => ({
          bidder: bid.bidder,
          href: `${AO_LINK_EXPLORER_URL}/${bid.bidder}`,
          date: formatDate(bid.timestamp, 'dd-MM-yyyy HH:mm:ss'),
          price: marioToArio(bid.amount).toString(),
        }))
      : [];
  // Calculate total pages for bids
  const totalBidPages = Math.max(1, Math.ceil(allBids.length / BIDS_PER_PAGE));
  // Calculate start and end indices for the current page
  const startIndex = (bidPage - 1) * BIDS_PER_PAGE;
  const endIndex = Math.min(startIndex + BIDS_PER_PAGE, allBids.length);
  // Create paginated slice of bids
  const paginatedBids = allBids.slice(startIndex, endIndex);
  const minBid =
    listing.type === 'english' && listing.highestBid
      ? Number(currentPrice) + 1
      : Number(currentPrice);
  const isBidPriceValid = Number(bidPrice) >= minBid;

  const navigateToConfirmPurchase = (type: 'fixed' | 'english' | 'dutch') => {
    const orderId = listing.orderId;
    const name = listing.name;
    const antProcessId = listing.antProcessId;

    const price = type === 'english' ? bidPrice : currentPrice;

    if (!price) {
      throw new Error('Price is not set');
    }

    navigate(
      `/listings/${orderId}/confirm-purchase?price=${price}&type=${type}&name=${name}&antProcessId=${antProcessId}`,
    );
  };

  const openExplorer = (address: string) => {
    window.open(`${AO_LINK_EXPLORER_URL}/${address}`, '_blank');
  };

  const dutchPriceSchedule: Schedule[] =
    listing.type === 'dutch'
      ? getDutchListingSchedule({
          startingPrice: listing.startingPrice,
          minimumPrice: listing.minimumPrice,
          decreaseInterval: listing.decreaseInterval,
          decreaseStep: listing.decreaseStep,
          createdAt: new Date(listing.createdAt).getTime(),
          endedAt: new Date(
            listing.status !== 'active' && listing.endedAt
              ? listing.endedAt
              : listing.expiresAt,
          ).getTime(),
        }).map((item) => ({
          date: formatDate(item.date),
          price: Number(marioToArio(item.price)),
        }))
      : [];

  return (
    <div className="max-w-6xl w-full px-6 mx-auto grid lg:grid-cols-5 gap-6 py-12">
      <div className="flex flex-col gap-4 lg:col-span-3">
        <Card>
          <Header size="h1" className="break-all">
            {listing.name}
          </Header>
        </Card>
        {listing.ownershipType === 'lease' && !!listing.leaseEndsAt && (
          <Card>
            <Row label="Lease expiration">
              <Paragraph>{formatDate(listing.leaseEndsAt)}</Paragraph>
            </Row>
          </Card>
        )}
        <Card>
          <Paragraph className="mb-5">Metadata</Paragraph>
          <div className="grid grid-cols-2 gap-4">
            <Row label="Seller wallet">
              <Button
                variant="link"
                className="inline-flex w-fit px-0"
                icon={<ExternalLink width={16} height={16} />}
                iconPlacement="right"
                onClick={() => {
                  openExplorer(listing.sender);
                }}
              >
                {shortenAddress(listing.sender)}
              </Button>
            </Row>
            <Row label="View on explorer">
              <Button
                variant="link"
                className="inline-flex w-fit px-0"
                icon={<ExternalLink width={16} height={16} />}
                iconPlacement="right"
                onClick={() => {
                  openExplorer(listing.orderId);
                }}
              >
                {shortenAddress(listing.orderId)}
              </Button>
            </Row>
          </div>
        </Card>
        {listing.type === 'dutch' && (
          <Card>
            <Paragraph fontWeight="medium" size="large" className="mb-4">
              Price decrease schedule
            </Paragraph>
            <div className="max-h-80 overflow-y-auto">
              <DecreaseScheduleTable data={dutchPriceSchedule} />
            </div>
          </Card>
        )}
      </div>
      <div className="lg:col-span-2 flex flex-col gap-4">
        <DetailsCard
          price={`${currentPrice} ARIO`}
          status={
            listing.status === 'ready-for-settlement'
              ? 'sold' // FIXME: should be a separate status
              : listing.status === 'settled'
              ? 'sold'
              : listing.status === 'expired'
              ? 'expired'
              : undefined
          }
          startDate={listing.createdAt}
          endDate={listing.expiresAt}
          variant={listing.type}
        >
          {listing.type === 'dutch' ? (
            <>
              <Paragraph>
                Starting price: {marioToArio(listing.startingPrice)} ARIO
              </Paragraph>
              <Paragraph>
                Floor price: {marioToArio(listing.minimumPrice)} ARIO
              </Paragraph>
              <Paragraph>
                Price decrease: every{' '}
                {formatMillisecondsToDate(Number(listing.decreaseInterval))}
              </Paragraph>
              {listing.status === 'active' && (
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!walletAddress}
                  onClick={() => {
                    navigateToConfirmPurchase('dutch');
                  }}
                >
                  {!walletAddress ? 'No wallet' : 'Buy now'}
                </Button>
              )}
            </>
          ) : listing.type === 'english' ? (
            <>
              {listing.status === 'ready-for-settlement' ? (
                <>
                  <Paragraph>
                    Starting price: {marioToArio(listing.startingPrice)} ARIO
                  </Paragraph>
                  {listing.highestBidder === walletAddress?.toString() && (
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled={mutationSettleListing.isPending}
                      onClick={() => {
                        mutationSettleListing.mutate(
                          {
                            listingId: listing.orderId,
                          },
                          {
                            onError: (error) => {
                              eventEmitter.emit('error', {
                                name: 'Failed to settle listing',
                                message: error.message,
                              });
                            },
                            onSuccess: async (data) => {
                              console.log(`settlement success`, { data });
                              await Promise.all([
                                queryClient.refetchQueries({
                                  queryKey: [marketplaceQueryKeys.listings.all],
                                }),
                                queryClient.refetchQueries({
                                  queryKey: [marketplaceQueryKeys.myANTs.all],
                                }),
                              ]);
                            },
                          },
                        );
                      }}
                    >
                      {mutationSettleListing.isPending
                        ? 'Settling...'
                        : 'Settle now (You won)'}
                    </Button>
                  )}
                </>
              ) : listing.status === 'active' ? (
                <>
                  <Paragraph>
                    Starting price: {marioToArio(listing.startingPrice)} ARIO
                  </Paragraph>
                  <Input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => {
                      setBidPrice(e.target.value);
                    }}
                    placeholder={`${minBid} and up`}
                    label="Name your price"
                    suffix="ARIO"
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={
                      !walletAddress ||
                      bidPrice === undefined ||
                      // if highest bid exists, bid must be strictly greater than it
                      // if no bids yet, bid must be at least equal to starting price
                      !isBidPriceValid
                    }
                    onClick={() => {
                      navigateToConfirmPurchase('english');
                    }}
                  >
                    {!walletAddress
                      ? 'No wallet'
                      : isBidPriceValid
                      ? 'Place bid'
                      : 'Too small bid'}
                  </Button>
                </>
              ) : null}
            </>
          ) : (
            <>
              {listing.status === 'active' && (
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!walletAddress}
                  onClick={() => {
                    navigateToConfirmPurchase('fixed');
                  }}
                >
                  {!walletAddress ? 'No wallet' : 'Buy now'}
                </Button>
              )}
            </>
          )}
        </DetailsCard>
        {listing.status === 'settled' && (
          <Card>
            <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-2">
              Buyer
            </Paragraph>
            <Button
              variant="link"
              className="px-0"
              onClick={() => {
                openExplorer(listing.receiver);
              }}
            >
              {shortenAddress(listing.receiver)}
              <span className="text-white font-normal text-[var(--ar-color-neutral-400)]">
                {listing.receiver === walletAddress?.toString() &&
                  '(Your wallet)'}
              </span>
            </Button>
          </Card>
        )}
        {listing.type === 'english' && (
          <Card>
            <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-3">
              Bids ({listing.bids.length})
            </Paragraph>
            <div className="mb-3">
              <BidsTable data={paginatedBids} />
            </div>
            {!queryDetails.isPending && (
              <Pagination
                totalPages={totalBidPages}
                activeIndex={bidPage}
                onPageChange={setBidPage}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Details;
