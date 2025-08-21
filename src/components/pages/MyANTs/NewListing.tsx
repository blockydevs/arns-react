import {
  Button,
  Card,
  CheckboxWithLabel,
  DatePicker,
  GoBackHeader,
  Input,
  Label,
  Row,
  Select,
  SelectOption,
} from '@blockydevs/arns-marketplace-ui';
import { formatDate } from 'date-fns';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type Step = 1 | 2 | 3;

function MyANTsNewListing() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { name } = useParams();
  const [type, setType] = useState<string>();
  const [price, setPrice] = useState<string>();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('12:00:00');
  const [checked, setChecked] = useState(false);

  const renderProperGoBackHeader = (step: Step) => {
    switch (step) {
      case 1:
        return (
          <GoBackHeader
            title="Create new listing"
            className="w-full my-12"
            onGoBack={() => {
              navigate('/my-ants');
            }}
          />
        );
      case 2:
        return (
          <GoBackHeader
            title="Confirm listing"
            className="w-full my-12"
            onGoBack={() => {
              setStep(1);
            }}
          />
        );
      case 3:
        return (
          <GoBackHeader
            title="Success! Your listing is now live"
            className="w-full my-12"
            onGoBack={() => {
              // TODO: ???? back to what, prob my ants after success
              setStep(2);
            }}
          />
        );
    }
  };

  const options: SelectOption[] = [
    { label: 'Dutch auction', value: 'dutch' },
    { label: 'English auction', value: 'english' },
    { label: 'Fix price', value: 'fixed' },
  ];

  return (
    <>
      {renderProperGoBackHeader(step)}
      <div className="w-full px-8 max-w-2xl mx-auto">
        <Card className="flex flex-col gap-8">
          <Row label="Domain name" value={name} variant="large" />
          {step === 1 ? (
            <>
              <div className="flex flex-col gap-2">
                <Label>Type of listing</Label>
                <Select
                  placeholder="Type of listing"
                  className="w-full"
                  onValueChange={(value) => setType(value)}
                  options={options}
                />
              </div>
              <Input
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                label="Price"
                suffix="ARIO"
                type="number"
              />
              <div className="flex flex-col">
                <p className="text-white mb-0.5">Expiration time</p>
                <p className="text-[var(--ar-color-neutral-500)] mb-4 text-sm">
                  Leave unchecked to keep the listing active until sold or
                  removed.
                </p>
                <CheckboxWithLabel
                  label="Set expiration date"
                  checked={checked}
                  onCheckedChange={() => {
                    setChecked((state) => !state);
                    setTime('12:00:00');
                    setDate(undefined);
                  }}
                />
                {checked && (
                  <div className="mt-6">
                    <DatePicker
                      date={date}
                      open={open}
                      setDate={setDate}
                      setOpen={setOpen}
                      time={time}
                      setTime={setTime}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Row label="Type of listing" value={type} />
              <Row label="Price" value={`${price} ARIO`} />
              {checked ? (
                <Row
                  label="Expiration time"
                  value={`${formatDate(date ?? '-', 'dd.MM.yyyy')} ${time}`}
                />
              ) : (
                <Row
                  label="Expiration time"
                  value="No time limit"
                  desc="Listing remains active until sold or removed"
                />
              )}
            </>
          )}

          <div className="flex gap-2 justify-end">
            {step !== 3 ? (
              <>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    if (step === 1) navigate('/my-ants');
                    else setStep(1);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => {
                    if (step === 1) setStep(2);
                    else {
                      // TODO: add mutate on step 2
                      setStep(3);
                    }
                  }}
                >
                  {step === 1 ? 'Next' : 'Confirm listing'}
                </Button>
              </>
            ) : (
              <Button variant="primary" className="w-full">
                View listing
              </Button>
            )}
          </div>
        </Card>
        {step === 3 && (
          <div className="flex gap-6 mt-6">
            <Button variant="secondary" className="w-full">
              List another ANT
            </Button>
            <Button variant="secondary" className="w-full">
              Go to marketplace
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default MyANTsNewListing;
