// FIXME: refactor with proper form
import { createListing } from '@blockydevs/arns-marketplace-data';
import {
  Button,
  Card,
  CheckboxWithLabel,
  DatePicker,
  GoBackHeader,
  Input,
  Interval,
  Label,
  Row,
  Select,
  SelectOption,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState, useWalletState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  BLOCKYDEVS_SWAP_TOKEN_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from 'date-fns';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { PriceScheduleModal } from './PriceScheduleModal';

type Step = 1 | 2 | 3;

function mergeDateAndTime(
  date: Date | undefined,
  time: string,
): Date | undefined {
  if (!date) return undefined;

  const [hours, minutes, seconds] = time.split(':').map(Number);
  const merged = new Date(date);

  merged.setHours(hours);
  merged.setMinutes(minutes);
  merged.setSeconds(seconds);

  return merged;
}

function MyANTsNewListing() {
  // MOCKED STATE BEFORE FORM INTEGRATION
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { antProcessId } = useParams();
  const [searchParams] = useSearchParams();
  const [type, setType] = useState<string>();
  const [price, setPrice] = useState<string>();
  const [minimumPrice, setMinimumPrice] = useState<string>();
  const [duration, setDuration] = useState<string>();
  const [decrease, setDecrease] = useState<string>();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('12:00:00');
  const [hasExpirationTime, setHasExpirationTime] = useState(false);

  const [{ antAoClient }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();

  const name = searchParams.get('name') ?? '-';

  const mutation = useMutation({
    mutationFn: async () => {
      if (!wallet || !walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!wallet.contractSigner) {
        throw new Error('No wallet signer available');
      }

      if (!antProcessId) {
        throw new Error('antProcessId is missing');
      }

      if (!price) {
        throw new Error('No price specified');
      }

      if (!type) {
        throw new Error('No type specified');
      }

      const oneHourMs = 3600 * 1000;
      const oneDayMs = 24 * 3600 * 1000;

      return await createListing({
        ao: antAoClient,
        antProcessId,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        swapTokenId: BLOCKYDEVS_SWAP_TOKEN_ID,
        config: (() => {
          switch (type) {
            case 'fixed': {
              const expiresAt = hasExpirationTime
                ? mergeDateAndTime(date, time)?.getTime()
                : undefined;

              return {
                type,
                price: price.toString(),
                expiresAt,
              };
            }
            case 'dutch': {
              if (!minimumPrice) {
                throw new Error('minimum price is missing');
              }

              if (!decrease) {
                throw new Error('decrease interval is missing');
              }

              const decreaseIntervalMs = (() => {
                if (decrease === '1hour') return oneHourMs;
                if (decrease === '12hours') return 12 * oneHourMs;
                if (decrease === 'day') return 24 * oneHourMs;
                if (decrease === 'week') return 7 * 24 * oneHourMs;
                throw new Error(`Unsupported decrease value ${decrease}`);
              })();

              const durationMs = (() => {
                if (duration === 'test') return 5 * 60 * 1000;
                if (duration === 'week') return 7 * oneDayMs;
                if (duration === 'month') return 30 * oneDayMs;
                return undefined;
              })();

              return {
                type,
                price: price.toString(),
                minimumPrice,
                decreaseInterval: decreaseIntervalMs.toString(),
                ...(durationMs && { expiresAt: Date.now() + durationMs }),
              };
            }
            case 'english': {
              const expiresAt = (() => {
                if (duration === 'test') return Date.now() + 5 * 60 * 1000;
                if (duration === 'week') return Date.now() + 7 * oneDayMs;
                if (duration === 'month') return Date.now() + 30 * oneDayMs;
                if (duration === 'custom')
                  return mergeDateAndTime(date, time)?.getTime();

                return undefined;
              })();

              return {
                type,
                price: price.toString(),
                expiresAt,
              };
            }
            default: {
              throw new Error(`Unsupported listing type ${type}`);
            }
          }
        })(),
        walletAddress: walletAddress.toString(),
        signer: wallet.contractSigner,
      });
    },
  });

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
    { label: '5 minutes', value: 'test' },
    { label: '1 week', value: 'week' },
    { label: '1 month', value: 'month' },
    { label: 'Custom date', value: 'custom' },
  ];

  const decreaseOptions: SelectOption[] = [
    { label: '1 hour', value: '1hour' },
    { label: '12 hours', value: '12hours' },
    { label: '1 day', value: 'day' },
    { label: 'week', value: 'week' },
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
                    <PriceScheduleModal
                      basePrice={Number(price)}
                      floorPrice={Number(minimumPrice)}
                      date="2025-08-28T00:00:00"
                      interval={decrease as Interval}
                    />
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
                    checked={hasExpirationTime}
                    onCheckedChange={() => {
                      setHasExpirationTime((state) => !state);
                      setTime('12:00:00');
                      setDate(undefined);
                    }}
                  />
                  {hasExpirationTime && (
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
                  {hasExpirationTime ? (
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
                      mutation.mutate(undefined, {
                        onError: (error) => {
                          console.error(error);
                          window.alert(error.message);
                        },
                        onSuccess: async (data) => {
                          console.log('listing created', { data });
                          await Promise.all([
                            queryClient.invalidateQueries({
                              queryKey: [marketplaceQueryKeys.listings.all],
                            }),
                            queryClient.invalidateQueries({
                              queryKey: [marketplaceQueryKeys.myANTs.all],
                            }),
                          ]);
                          setStep(3);
                        },
                      });
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
