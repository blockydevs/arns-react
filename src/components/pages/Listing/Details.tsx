import {
  fetchListingDetails,
  marioToArio,
} from '@blockydevs/arns-marketplace-data';
import {
  BidsTable,
  Button,
  Card,
  DecreaseScheduleTable,
  DetailsCard,
  Header,
  Input,
  Paragraph,
  Row,
  Spinner,
  calculateDecreaseSchedule,
  shortenAddress,
} from '@blockydevs/arns-marketplace-ui';
import { useWalletState } from '@src/state';
import {
  AO_LINK_EXPLORER_URL,
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Details = () => {
  const [bidPrice, setBidPrice] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { id } = useParams();
  const [{ walletAddress }] = useWalletState();
  const queryDetails = useQuery({
    enabled: !!id,
    queryKey: marketplaceQueryKeys.listings.item(id),
    queryFn: () => {
      if (!id) throw new Error('No id provided');

      return fetchListingDetails({
        orderId: id,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
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
      <p className="text-error text-center">{queryDetails.error.message}</p>
    );
  }

  const isOwner = queryDetails.data.sender === walletAddress;
  // FIXME:
  const isSold = queryDetails.data.status !== 'active';
  const marioPrice =
    queryDetails.data.type === 'english'
      ? queryDetails.data.highestBid
      : queryDetails.data.price;
  const price = marioToArio(marioPrice);

  const navigateToConfirmPurchase = (type: 'fixed' | 'english' | 'dutch') => {
    const orderId = queryDetails.data.orderId;
    const name = queryDetails.data.name;
    const antProcessId = queryDetails.data.antProcessId;
    const marioPrice = type === 'english' ? bidPrice : queryDetails.data.price;

    if (!marioPrice) {
      throw new Error('Price is not set');
    }

    const price = marioToArio(marioPrice);

    navigate(
      `/listing/${orderId}/confirm-purchase?price=${price}&type=${type}&name=${name}&antProcessId=${antProcessId}`,
    );
  };

  const openExplorer = (address: string) => {
    // FIXME: should come from consts
    window.open(`${AO_LINK_EXPLORER_URL}/${address}`, '_blank');
  };

  return (
    <div className="max-w-6xl w-full px-6 mx-auto grid md:grid-cols-5 gap-6 py-12">
      <div className="flex flex-col gap-4 md:col-span-3">
        <Card>
          <Header size="h1">{queryDetails.data.name}</Header>
        </Card>
        <Card>
          <Paragraph className="mb-5">Metadata</Paragraph>
          <div className="grid grid-cols-2 gap-4">
            {/* FIXME: add real metadata */}
            <Row label="Metadata label" value="Metadata label" />
            <Row label="Metadata label" value="Metadata label" />
            <Row label="Seller wallet">
              <Button
                variant="link"
                className="inline-flex w-fit px-0"
                icon={<ExternalLink width={16} height={16} />}
                iconPlacement="right"
                onClick={() => {
                  openExplorer(queryDetails.data.sender);
                }}
              >
                {shortenAddress(queryDetails.data.sender)}
              </Button>
            </Row>
            <Row label="View on explorer">
              <Button
                variant="link"
                className="inline-flex w-fit px-0"
                icon={<ExternalLink width={16} height={16} />}
                iconPlacement="right"
                onClick={() => {
                  openExplorer(queryDetails.data.orderId);
                }}
              >
                {shortenAddress(queryDetails.data.orderId)}
              </Button>
            </Row>
          </div>
        </Card>
        {queryDetails.data.type === 'dutch' && (
          <Card>
            <Paragraph fontWeight="medium" size="large" className="mb-4">
              Price decrease schedule
            </Paragraph>
            <DecreaseScheduleTable
              data={calculateDecreaseSchedule(
                queryDetails.data.createdAt,
                // FIXME: it should be required for dutch
                queryDetails.data.expiresAt ??
                  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                marioToArio(queryDetails.data.minimumPrice),
                '12hours', // FIXME:
                marioToArio(queryDetails.data.startingPrice),
              )}
            />
          </Card>
        )}
      </div>
      <div className="md:col-span-2 flex flex-col gap-4">
        <DetailsCard
          price={`${price} ARIO`}
          sold={isSold}
          startDate={queryDetails.data.createdAt}
          endDate={queryDetails.data.expiresAt}
          variant={queryDetails.data.type}
        >
          {queryDetails.data.type === 'dutch' ? (
            <>
              <Paragraph>
                Starting price: {marioToArio(queryDetails.data.startingPrice)}{' '}
                ARIO
              </Paragraph>
              <Paragraph>
                Floor price: {marioToArio(queryDetails.data.minimumPrice)} ARIO
              </Paragraph>
              {/* FIXME: format interval */}
              <Paragraph>
                Price decrease: every {queryDetails.data.decreaseInterval}
              </Paragraph>
              {!isSold && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    navigateToConfirmPurchase('dutch');
                  }}
                >
                  Buy now
                </Button>
              )}
            </>
          ) : queryDetails.data.type === 'english' ? (
            <>
              {isSold ? (
                <>
                  <Paragraph>
                    Starting price:{' '}
                    {marioToArio(queryDetails.data.startingPrice)} ARIO
                  </Paragraph>
                  {isOwner && (
                    <Button variant="primary" className="w-full">
                      Settle now (You won)
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Paragraph>
                    Starting price:{' '}
                    {marioToArio(queryDetails.data.startingPrice)} ARIO
                  </Paragraph>
                  <Input
                    onChange={(e) => {
                      setBidPrice(e.target.value);
                    }}
                    placeholder={`${marioToArio(
                      queryDetails.data.highestBid,
                    )} and up`}
                    label="Name your price"
                    suffix="ARIO"
                    type="number"
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={
                      bidPrice === undefined ||
                      Number(bidPrice) < Number(queryDetails.data.highestBid)
                    }
                    onClick={() => {
                      navigateToConfirmPurchase('english');
                    }}
                  >
                    {Number(bidPrice) > Number(queryDetails.data.highestBid)
                      ? 'Place bid'
                      : 'Too small bid'}
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {!isSold && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    navigateToConfirmPurchase('fixed');
                  }}
                >
                  Buy now
                </Button>
              )}
            </>
          )}
        </DetailsCard>
        {isSold && (
          <Card>
            <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-2">
              Buyer
            </Paragraph>
            <Button variant="link" className="px-0">
              {/* FIXME: receiver address */}
              Wu3...dY4{' '}
              <span className="text-white font-normal text-[var(--ar-color-neutral-400)]">
                {isOwner && '(Your wallet)'}
              </span>
            </Button>
          </Card>
        )}
        {queryDetails.data.type === 'english' && (
          <Card>
            <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-3">
              Bids ({queryDetails.data.bids.length})
            </Paragraph>
            <BidsTable
              data={queryDetails.data.bids.map((bid) => ({
                bidder: bid.bidder,
                href: `${AO_LINK_EXPLORER_URL}/${bid.bidder}`,
                date: new Date().toISOString(),
                price: marioToArio(bid.amount).toString(),
              }))}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Details;
