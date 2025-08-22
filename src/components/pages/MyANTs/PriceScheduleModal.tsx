import {
  Button,
  DecreaseScheduleTable,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@blockydevs/arns-marketplace-ui';

interface Props {
  date: string;
  interval: string;
}
export const PriceScheduleModal: React.FC<Props> = ({ date, interval }) => {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="link"
            size="small"
            className="inline-flex w-fit px-0"
          >
            View price schedule
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Price decrease schedule
            </DialogTitle>
          </DialogHeader>
          {interval} {date}
          <DecreaseScheduleTable
            data={[
              { date: '14-07-2025 14:00', price: 500 },
              { date: '15-07-2025 14:00', price: 400 },
              { date: '16-07-2025 14:00', price: 300 },
              { date: '17-07-2025 14:00', price: 200 },
              { date: '18-07-2025 14:00', price: 100 },
            ]}
          />
        </DialogContent>
      </form>
    </Dialog>
  );
};
