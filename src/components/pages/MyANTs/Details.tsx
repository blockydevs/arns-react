import { Header } from '@blockydevs/arns-marketplace-ui';
import { useParams } from 'react-router-dom';

function MyANTsDetails() {
  const { name } = useParams();

  return (
    <div className="w-full px-8">
      <Header size="h1" className="my-12">
        {name}
      </Header>
    </div>
  );
}

export default MyANTsDetails;
