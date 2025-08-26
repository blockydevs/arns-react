import {
  Button,
  Card,
  GoBackHeader,
  Paragraph,
  Row,
  Spinner,
} from '@blockydevs/arns-marketplace-ui';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// MOCKED LOADING STATE
const LOADING = true;

const Confirm = () => {
  const [success, setSuccess] = useState(false);
  const { name } = useParams();
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const price = searchParams[0].get('price');
  const type = searchParams[0].get('type');

  if (success) {
    return (
      <>
        <GoBackHeader
          title="Transaction successful!"
          className="w-full my-12"
        />
        <div className="max-w-2xl w-full px-6 mx-auto pb-12">
          <Card className="flex flex-col gap-6">
            <Paragraph className="ar:text-neutral-200 text-center">
              {type === 'english'
                ? 'You can increase your bid anytime before the auction ends.'
                : 'Transaction confirmed – ANT is in your wallet.'}
            </Paragraph>
            <div className="flex flex-col gap-2 my-20">
              <Paragraph className="ar:text-neutral-400 text-center">
                Domain name
              </Paragraph>
              <Paragraph className="text-5xl font-medium text-white text-center">
                {name}
              </Paragraph>
            </div>

            {type === 'english' ? (
              <Button
                variant="primary"
                size="small"
                onClick={() => navigate('/listing')}
              >
                View listing
              </Button>
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={() => navigate('/my-ants')}
              >
                View your ANTs
              </Button>
            )}
          </Card>
          <div className="flex gap-6 mt-6">
            {type !== 'english' && (
              <Button variant="secondary" className="w-full">
                View this listing
              </Button>
            )}
            <Button variant="secondary" className="w-full">
              Go to marketplace
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GoBackHeader
        title="Confirm purchase"
        className="w-full my-12"
        onGoBack={() => {
          navigate('/my-ants');
        }}
      />
      <div className="max-w-2xl w-full px-6 mx-auto pb-12">
        <Card className="flex flex-col gap-6">
          <Row label="Domain name" value={name} variant="large" />
          <Row label="Price" value={`${price} ARIO`} />
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              size="small"
              // onClick={() => {
              //  navigate()
              // }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={() => setSuccess(true)}
            >
              {type === 'english' ? 'Confirm bid' : 'Confirm purchase'}
            </Button>
          </div>
        </Card>
        {LOADING && (
          <div className="text-white flex mt-6 gap-3 items-center p-6 border ar:border-neutral-500 rounded-lg">
            <Spinner className="w-5 h-5" />
            <Paragraph className="text-xl">
              Waiting for wallet confirmation...
            </Paragraph>
          </div>
        )}
      </div>
    </>
  );
};

export default Confirm;
