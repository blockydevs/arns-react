import {
  Button,
  DecreaseScheduleTable,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Interval,
  calculateDecreaseSchedule,
} from '@blockydevs/arns-marketplace-ui';

interface Props {
  date: string;
  interval: Interval;
  floorPrice: number;
  basePrice: number;
}
export const PriceScheduleModal: React.FC<Props> = ({
  date,
  interval,
  floorPrice,
  basePrice,
}) => {
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
          <DecreaseScheduleTable
            data={calculateDecreaseSchedule(
              new Date().toString(),
              date,
              floorPrice,
              interval,
              basePrice,
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
