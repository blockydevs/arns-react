import { fetchListingDetails } from '@blockydevs/arns-marketplace-data';
import {
  // BidsTable,
  Button,
  Card,
  DecreaseScheduleTable,
  DetailsCard,
  Header,
  Input,
  Paragraph,
  Row,
  calculateDecreaseSchedule,
} from '@blockydevs/arns-marketplace-ui';
import { useWalletState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PriceScheduleModal } from '../MyANTs/PriceScheduleModal';

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
    return <p className="text-white text-center">loading...</p>;
  }

  if (queryDetails.error) {
    return (
      <p className="text-error text-center">{queryDetails.error.message}</p>
    );
  }

  const isOwner = queryDetails.data.sender === walletAddress;
  const isSold = false;

  const navigateToConfirmPurchase = (type: 'fixed' | 'english' | 'dutch') => {
    const orderId = queryDetails.data.orderId;
    const name = queryDetails.data.name;
    const antProcessId = queryDetails.data.antProcessId;
    const price = type === 'english' ? bidPrice : queryDetails.data.price;

    navigate(
      `/listing/${orderId}/confirm-purchase?price=${price}&type=${type}&name=${name}&antProcessId=${antProcessId}`,
    );
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
            <Row label="Metadata label" value="Metadata label" />
            <Row label="Metadata label" value="Metadata label" />
            <Row label="Seller wallet">
              <Button
                variant="link"
                className="inline-flex w-fit px-0"
                icon={<ExternalLink width={16} height={16} />}
                iconPlacement="right"
              >
                F2F3...dH5
              </Button>
            </Row>
            <Row label="View on explorer">
              <Button
                variant="link"
                className="inline-flex w-fit px-0"
                icon={<ExternalLink width={16} height={16} />}
                iconPlacement="right"
              >
                Oxbd35...2cf8
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
                '2025-08-26T00:00:00',
                '2025-08-28T00:00:00',
                400,
                '12hours',
                700,
              )}
            />
          </Card>
        )}
      </div>
      <div className="md:col-span-2 flex flex-col gap-4">
        <DetailsCard
          price={`${queryDetails.data.price} ARIO`}
          sold={isSold}
          startDate="2025-08-01T10:00:00Z"
          endDate="2025-12-01T10:00:00Z"
          variant={
            queryDetails.data.type === 'fixed'
              ? 'fixed-price'
              : queryDetails.data.type
          }
        >
          {queryDetails.data.type === 'dutch' ? (
            <>
              <Paragraph>Starting price: 300 ARIO</Paragraph>
              <Paragraph>Floor price: 80 ARIO</Paragraph>
              <Paragraph>Price decrease: every 24 hours</Paragraph>
              <PriceScheduleModal
                basePrice={700}
                floorPrice={400}
                date="2025-08-28T00:00:00"
                interval="12hours"
              />
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
                  <Paragraph>Starting price: 100 ARIO</Paragraph>
                  {isOwner && (
                    <Button variant="primary" className="w-full">
                      Settle now (You won)
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Paragraph>Starting price: 100 ARIO</Paragraph>
                  <Input
                    onChange={(e) => {
                      setBidPrice(e.target.value);
                    }}
                    placeholder={`${queryDetails.data.price} and up`}
                    label="Name your price"
                    suffix="ARIO"
                    type="number"
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      navigateToConfirmPurchase('english');
                    }}
                  >
                    Place bid
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
              Wu3...dY4{' '}
              <span className="text-white font-normal text-[var(--ar-color-neutral-400)]">
                {isOwner && '(Your wallet)'}
              </span>
            </Button>
          </Card>
        )}
        {/* FIXME: uncomment later */}
        {/* {type === 'english' && (
          <Card>
            <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-3">
              Bids (15)
            </Paragraph>
            <BidsTable
              data={[
                {
                  bidder: '0x12349123840',
                  href: 'https://google.pl',
                  date: '14-07-2025 14:00',
                  price: '500 ARIO',
                },
                {
                  bidder: '0x12349123840',
                  href: 'https://google.pl',
                  date: '14-07-2025 14:00',
                  price: '400 ARIO',
                },
                {
                  bidder: '0x12349123840',
                  href: 'https://google.pl',
                  date: '14-07-2025 14:00',
                  price: '200 ARIO',
                },
                {
                  bidder: '0x12349123840',
                  href: 'https://google.pl',
                  date: '14-07-2025 14:00',
                  price: '10 ARIO',
                },
                {
                  bidder: '0x12349123840',
                  href: 'https://google.pl',
                  date: '14-07-2025 14:00',
                  price: '2 ARIO',
                },
              ]}
            />
          </Card>
        )} */}
      </div>
    </div>
  );
};

export default Details;
