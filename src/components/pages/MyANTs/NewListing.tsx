// FIXME: refactor with proper form
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
  // MOCKED STATE BEFORE FORM INTEGRATION
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { name } = useParams();
  const [type, setType] = useState<string>();
  const [price, setPrice] = useState<string>();
  const [minimumPrice, setMinimumPrice] = useState<string>();
  const [duration, setDuration] = useState<string>();
  const [decrease, setDecrease] = useState<string>();
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

  const durationOptions: SelectOption[] = [
    { label: '1 week', value: 'week' },
    { label: '1 month', value: 'month' },
    { label: 'Custom date', value: 'custom' },
  ];

  const decreaseOptions: SelectOption[] = [
    { label: '1 hour', value: 'hour' },
    { label: '12 hours', value: 'twentyHours' },
    { label: '1 day', value: 'day' },
  ];

  return (
    <>
      {renderProperGoBackHeader(step)}
      <div className="w-full px-8 max-w-2xl mx-auto pb-12">
        <Card className="flex flex-col gap-8">
          <Row label="Domain name" value={name} variant="large" />
          {step === 1 ? (
            <>
              <div className="flex flex-col gap-2">
                <Label>Type of listing</Label>
                <Select
                  placeholder="Type of listing"
                  className="w-full"
                  defaultValue={type}
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
              {type === 'dutch' ? (
                <>
                  <Input
                    onChange={(e) => setMinimumPrice(e.target.value)}
                    value={minimumPrice}
                    label="Minimum price (floor)"
                    suffix="ARIO"
                    type="number"
                  />
                  <div className="flex flex-col gap-2">
                    <Label>Duration</Label>
                    <Select
                      placeholder="Choose duration"
                      className="w-full"
                      onValueChange={(value) => setDuration(value)}
                      options={durationOptions}
                    />
                  </div>
                  {duration === 'custom' && (
                    <DatePicker
                      date={date}
                      open={open}
                      setDate={setDate}
                      setOpen={setOpen}
                      time={time}
                      setTime={setTime}
                    />
                  )}
                  <div className="flex flex-col gap-2">
                    <Label>Price decrease interval</Label>
                    <Select
                      placeholder="Choose decrease interval"
                      className="w-full"
                      onValueChange={(value) => setDecrease(value)}
                      options={decreaseOptions}
                    />
                    <Button
                      variant="link"
                      size="small"
                      className="inline-flex w-fit px-0"
                    >
                      View price schedule
                    </Button>
                  </div>
                </>
              ) : type === 'english' ? (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>Duration</Label>
                    <Select
                      placeholder="Choose duration"
                      className="w-full"
                      onValueChange={(value) => setDuration(value)}
                      options={durationOptions}
                    />
                  </div>
                  {duration === 'custom' && (
                    <DatePicker
                      date={date}
                      open={open}
                      setDate={setDate}
                      setOpen={setOpen}
                      time={time}
                      setTime={setTime}
                    />
                  )}
                </>
              ) : (
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
              )}
            </>
          ) : (
            <>
              <Row label="Type of listing" value={type} />
              <Row
                label={type === 'english' ? 'Starting price' : 'Price'}
                value={`${price} ARIO`}
              />
              {type === 'dutch' ? (
                <>
                  <Row
                    label="Minimum price (Floor price)"
                    value={`${minimumPrice} ARIO`}
                  />
                  <Row label="Duration" value={duration} />
                  <Row
                    label="Price decrease interval"
                    value={`Every ${decrease}`}
                  />
                  <Button
                    variant="link"
                    size="small"
                    className="inline-flex w-fit px-0"
                  >
                    View price schedule
                  </Button>
                </>
              ) : type === 'english' ? (
                <>
                  <Row label="Duration" value={duration} />
                </>
              ) : (
                <>
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
            </>
          )}

          <div className="flex gap-2 justify-end mt-4">
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
