import { arioToMario, marioToArio } from '@blockydevs/arns-marketplace-data';
import {
  Button,
  DecreaseScheduleTable,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Interval,
  Schedule,
  formatDate,
  getDutchListingSchedule,
  getIntervalInMs,
} from '@blockydevs/arns-marketplace-ui';

interface Props {
  minimumPrice: number;
  startingPrice: number;
  decreaseInterval: Interval;
  dateFrom: Date;
  dateTo: Date;
}
export const PriceScheduleModal: React.FC<Props> = ({
  startingPrice,
  minimumPrice,
  decreaseInterval,
  dateFrom,
  dateTo,
}) => {
  const dutchPriceSchedule: Schedule[] = (() => {
    try {
      return getDutchListingSchedule({
        createdAt: dateFrom.getTime(),
        endedAt: dateTo.getTime(),
        startingPrice: arioToMario(startingPrice),
        minimumPrice: arioToMario(minimumPrice),
        decreaseInterval: getIntervalInMs(decreaseInterval).toString(),
        decreaseStep: arioToMario(1),
      }).map((item) => ({
        date: formatDate(item.date),
        price: Number(marioToArio(item.price)),
      }));
    } catch {
      return [];
    }
  })();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="small" className="inline-flex w-fit px-0">
          View price schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Price decrease schedule
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[480px] overflow-auto overflow-x-hidden">
          <DecreaseScheduleTable data={dutchPriceSchedule} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
