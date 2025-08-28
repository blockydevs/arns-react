import { bidListing, buyListing } from '@blockydevs/arns-marketplace-data';
import {
  Button,
  Card,
  GoBackHeader,
  Paragraph,
  Row,
  Spinner,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState, useWalletState } from '@src/state';
import {
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  BLOCKYDEVS_SWAP_TOKEN_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const Confirm = () => {
  const [success, setSuccess] = useState(false);
  const { id: listingId } = useParams();
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [{ antAoClient }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();

  const name = searchParams[0].get('name') ?? '-';
  const antProcessId = searchParams[0].get('antProcessId');
  const price = searchParams[0].get('price');
  const type = searchParams[0].get('type');

  const mutationBuyListing = useMutation({
    mutationFn: async ({ price }: { price: string }) => {
      if (!wallet || !walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!wallet.contractSigner) {
        throw new Error('No wallet signer available');
      }

      if (!antProcessId) {
        throw new Error('antProcessId is missing');
      }

      if (!listingId) {
        throw new Error('listingId is missing');
      }

      if (!type) {
        throw new Error(`type is missing or invalid (${type})`);
      }

      return await buyListing({
        ao: antAoClient,
        orderId: listingId,
        price,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        antTokenId: antProcessId,
        swapTokenId: BLOCKYDEVS_SWAP_TOKEN_ID,
        walletAddress: walletAddress.toString(),
        signer: wallet.contractSigner,
        orderType: type as 'fixed' | 'dutch', // FIXME:
      });
    },
  });

  const mutationBidListing = useMutation({
    mutationFn: async ({ price }: { price: string }) => {
      if (!wallet || !walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!wallet.contractSigner) {
        throw new Error('No wallet signer available');
      }

      if (!antProcessId) {
        throw new Error('antProcessId is missing');
      }

      if (!listingId) {
        throw new Error('listingId is missing');
      }

      return await bidListing({
        ao: antAoClient,
        orderId: listingId,
        bidPrice: price,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        antTokenId: antProcessId,
        swapTokenId: BLOCKYDEVS_SWAP_TOKEN_ID,
        walletAddress: walletAddress.toString(),
        signer: wallet.contractSigner,
      });
    },
  });

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
                onClick={() => navigate(`/listing/${listingId}`)}
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
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(`/listing/${listingId}`)}
              >
                View this listing
              </Button>
            )}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(`/listing`)}
            >
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
              disabled={
                mutationBidListing.isPending || mutationBuyListing.isPending
              }
              onClick={() => {
                const operation = type === 'english' ? 'bid' : 'buy';
                const mutation =
                  operation === 'bid' ? mutationBidListing : mutationBuyListing;

                if (!price) {
                  throw new Error('price is missing');
                }

                mutation.mutate(
                  { price },
                  {
                    onError: (error) => {
                      window.alert(error.message);
                    },
                    onSuccess: async (data) => {
                      console.log(`${operation} success`, { data });
                      await Promise.all([
                        queryClient.invalidateQueries({
                          queryKey: [marketplaceQueryKeys.listings.all],
                        }),
                        queryClient.invalidateQueries({
                          queryKey: [marketplaceQueryKeys.myANTs.all],
                        }),
                      ]);
                      setSuccess(true);
                    },
                  },
                );
              }}
            >
              {type === 'english' ? 'Confirm bid' : 'Confirm purchase'}
            </Button>
          </div>
        </Card>
        {(mutationBuyListing.isPending || mutationBidListing.isPending) && (
          <div className="text-white flex mt-6 gap-3 items-center p-6 border ar:border-neutral-500 rounded-lg">
            <Spinner className="size-5" />
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
