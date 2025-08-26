import {
  // BidsTable,
  Button,
  Card,
  DecreaseScheduleTable,
  DetailsCard,
  Header,
  Input,
  ListingType,
  Paragraph,
  Row,
} from '@blockydevs/arns-marketplace-ui';
import { ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PriceScheduleModal } from '../MyANTs/PriceScheduleModal';

//TODO: MOCKED VALUES: REPLACE WITH PROPER QUERY DATA
const SOLD = false;
const type: ListingType = 'dutch';
const PRICE = 123123;
const OWNER = false;

const Details = () => {
  const navigate = useNavigate();
  const { name } = useParams();

  return (
    <div className="max-w-6xl w-full px-6 mx-auto grid md:grid-cols-5 gap-6 py-12">
      <div className="flex flex-col gap-4 md:col-span-3">
        <Card>
          <Header size="h1">{name}</Header>
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
        {type === 'dutch' && (
          <Card>
            <Paragraph fontWeight="medium" size="large" className="mb-4">
              Price decrease schedule
            </Paragraph>
            <DecreaseScheduleTable
              data={[
                { date: '14-07-2025 14:00', price: 500 },
                { date: '15-07-2025 14:00', price: 400 },
                { date: '16-07-2025 14:00', price: 300 },
                { date: '17-07-2025 14:00', price: 200 },
                { date: '18-07-2025 14:00', price: 100 },
              ]}
            />
          </Card>
        )}
      </div>
      <div className="md:col-span-2 flex flex-col gap-4">
        <DetailsCard
          price="250 ARIO"
          sold={SOLD}
          startDate="2025-08-01T10:00:00Z"
          endDate="2025-12-01T10:00:00Z"
          variant={type}
        >
          {type === 'dutch' ? (
            <>
              <Paragraph>Starting price: 300 ARIO</Paragraph>
              <Paragraph>Floor price: 80 ARIO</Paragraph>
              <Paragraph>Price decrease: every 24 hours</Paragraph>
              <PriceScheduleModal date="" interval="" />
              {!SOLD && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    navigate(
                      `/listing/${name}/confirm-purchase?price=${PRICE}&type=dutch`,
                    );
                  }}
                >
                  Buy now
                </Button>
              )}
            </>
          ) : type === 'english' ? (
            <>
              {SOLD ? (
                <>
                  <Paragraph>Starting price: 100 ARIO</Paragraph>
                  {OWNER && (
                    <Button variant="primary" className="w-full">
                      Settle now (You won)
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Paragraph>Starting price: 100 ARIO</Paragraph>
                  <Input
                    onChange={() => {
                      console.log('test');
                    }}
                    placeholder={`${PRICE} and up`}
                    label="Name your price"
                    suffix="ARIO"
                    type="number"
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      navigate(
                        `/listing/${name}/confirm-purchase?price=${PRICE}&type=english`,
                      );
                    }}
                  >
                    Place bid
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {!SOLD && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    navigate(
                      `/listing/${name}/confirm-purchase?price=${PRICE}&type=fixed`,
                    );
                  }}
                >
                  Buy now
                </Button>
              )}
            </>
          )}
        </DetailsCard>
        {SOLD && (
          <Card>
            <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-2">
              Buyer
            </Paragraph>
            <Button variant="link" className="px-0">
              Wu3...dY4{' '}
              <span className="text-white font-normal text-[var(--ar-color-neutral-400)]">
                {OWNER && '(Your wallet)'}
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
