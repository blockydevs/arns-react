import {
  Button,
  Card,
  Paragraph,
  shortenAddress,
} from '@blockydevs/arns-marketplace-ui';
import { useWalletState } from '@src/state';
import { openAoLinkExplorer } from '@src/utils/marketplace';
import { ExternalLink } from 'lucide-react';

interface Props {
  buyerAddress: string;
}

const ListingBuyerSection = ({ buyerAddress }: Props) => {
  const [{ walletAddress }] = useWalletState();

  return (
    <Card>
      <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-2">
        Buyer
      </Paragraph>
      <Button
        variant="link"
        className="px-0 gap-1"
        icon={<ExternalLink width={16} height={16} />}
        iconPlacement="right"
        onClick={() => {
          openAoLinkExplorer(buyerAddress);
        }}
      >
        {shortenAddress(buyerAddress)}
        <span className="text-white font-normal text-[var(--ar-color-neutral-400)]">
          {buyerAddress === walletAddress?.toString() && '(Your wallet)'}
        </span>
      </Button>
    </Card>
  );
};

export default ListingBuyerSection;
