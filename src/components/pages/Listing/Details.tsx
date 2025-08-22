import {
  Button,
  Card,
  DecreaseScheduleTable,
  Header,
  Paragraph,
  Row,
} from '@blockydevs/arns-marketplace-ui';
import { ExternalLink } from 'lucide-react';
import { useParams } from 'react-router-dom';

const Details = () => {
  const { name } = useParams();

  return (
    <div className="max-w-6xl w-full px-6 mx-auto grid sm:grid-cols-5 gap-6 py-12">
      <div className="flex flex-col gap-4 sm:col-span-3">
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
      </div>
      <div className="sm:col-span-2">
        <Card>
          <Button variant="primary" className="w-full">
            Buy now
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Details;
