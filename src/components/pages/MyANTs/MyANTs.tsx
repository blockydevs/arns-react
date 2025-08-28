import { ARIO_TESTNET_PROCESS_ID } from '@ar.io/sdk';
import { fetchMyANTs, marioToArio } from '@blockydevs/arns-marketplace-data';
import {
  Card,
  Header,
  MyANTsTable,
  OwnedDomain,
  Spinner,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState, useWalletState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const MyANTs = () => {
  const navigate = useNavigate();

  const [{ aoClient }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();

  const queryMyANTs = useQuery({
    enabled: !!walletAddress,
    queryKey: marketplaceQueryKeys.myANTs.list(walletAddress?.toString()),
    queryFn: () => {
      if (!walletAddress) throw new Error('No wallet address');

      return fetchMyANTs({
        walletAddress: walletAddress.toString(),
        ao: aoClient,
        networkProcessId: ARIO_TESTNET_PROCESS_ID,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
      });
    },
    select: (data) => {
      return Object.values(data).map(
        (domain): OwnedDomain => ({
          name: domain.name,
          action: () => {
            if (domain.listing) {
              navigate(`/listing/${domain.listing.orderId}`);
            } else {
              navigate(
                `/my-ants/new-listing/${domain.processId}?name=${domain.name}`,
              );
            }
          },
          endDate: domain.listing
            ? domain.listing?.expiresAt ?? undefined
            : undefined,
          price: domain.listing
            ? {
                type: domain.listing.type === 'english' ? 'bid' : 'buyout',
                symbol: 'ARIO',
                value: marioToArio(domain.listing.price),
              }
            : undefined,
          type: domain.listing
            ? {
                value: domain.listing?.type,
              }
            : undefined,
          status: domain.listing ? 'listed' : 'idle',
        }),
      );
    },
  });

  if (queryMyANTs.isPending) {
    return (
      <div className="flex justify-center">
        <Spinner className="text-white size-5" />
      </div>
    );
  }

  if (queryMyANTs.error) {
    return (
      <p className="text-error text-center">{queryMyANTs.error.message}</p>
    );
  }

  return (
    <div className="w-full px-8">
      <Header size="h1" className="my-12">
        My ANTs
      </Header>
      <Card>
        <MyANTsTable data={queryMyANTs.data} />
      </Card>
    </div>
  );
};

export default MyANTs;
