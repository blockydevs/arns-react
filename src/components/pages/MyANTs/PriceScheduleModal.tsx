import { arioToMario, marioToArio } from '@blockydevs/arns-marketplace-data';
import {
  Button,
  DecreaseScheduleTable,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Schedule,
  formatDate,
  getDutchListingSchedule,
} from '@blockydevs/arns-marketplace-ui';
import { getMsFromInterval } from '@src/utils/marketplace';

interface Props {
  minimumPrice: number;
  startingPrice: number;
  decreaseInterval: string | undefined;
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
      const decreaseIntervalMs = getMsFromInterval(decreaseInterval);
      if (!decreaseIntervalMs || decreaseIntervalMs === 0) return [];

      const totalIntervals = Math.floor(
        (dateTo.getTime() - dateFrom.getTime()) / decreaseIntervalMs,
      );
      const step = (startingPrice - minimumPrice) / totalIntervals;

      return getDutchListingSchedule({
        createdAt: dateFrom.getTime(),
        endedAt: dateTo.getTime(),
        startingPrice: arioToMario(startingPrice),
        minimumPrice: arioToMario(minimumPrice),
        decreaseInterval: decreaseIntervalMs.toString(),
        decreaseStep: arioToMario(step),
      }).map((item) => ({
        date: formatDate(item.date),
        price: Number(Number(marioToArio(item.price)).toFixed(6)),
      }));
    } catch {
      return [];
    }
  })();

  return (
    <Dialog>
      <DialogTrigger disabled={!decreaseInterval} asChild>
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
