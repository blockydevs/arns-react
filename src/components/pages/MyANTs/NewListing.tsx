// FIXME: refactor with proper form
import { createAoSigner } from '@ar.io/sdk';
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
  formatDate,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState, useWalletState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  BLOCKYDEVS_SWAP_TOKEN_ID,
  marketplaceQueryKeys,
} from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMilliseconds } from 'date-fns';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { PriceScheduleModal } from './PriceScheduleModal';

type Step = 1 | 2 | 3;

interface FormState {
  type: string;
  price: string;
  minimumPrice: string;
  duration: string;
  decrease: string;
  hasExpirationTime: boolean;
  date: Date | undefined;
  time: string;
}

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

// FIXME: replace with util
function pickMilisekundsBasedOnDuration(value: string) {
  switch (value) {
    case 'test':
      return 5 * 60 * 1000;
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

const typeOptions: SelectOption[] = [
  { label: 'Fixed price', value: 'fixed' },
  { label: 'English auction', value: 'english' },
  { label: 'Dutch auction', value: 'dutch' },
];

const durationOptions: SelectOption[] = [
  { label: '5 minutes', value: 'test' }, // FIXME: remove
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

function MyANTsNewListing() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { antProcessId } = useParams();
  const [searchParams] = useSearchParams();
  const [{ antAoClient }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [form, setForm] = useState<FormState>({
    type: '',
    price: '',
    minimumPrice: '',
    duration: '',
    decrease: '',
    hasExpirationTime: false,
    date: new Date(),
    time: '12:00:00',
  });

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

      if (!form.price) {
        throw new Error('No price specified');
      }

      if (!form.type) {
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
          switch (form.type) {
            case 'fixed': {
              const expiresAt = form.hasExpirationTime
                ? mergeDateAndTime(form.date, form.time)?.getTime()
                : undefined;

              return {
                type: form.type,
                price: form.price.toString(),
                expiresAt,
              };
            }
            case 'dutch': {
              if (!form.minimumPrice) {
                throw new Error('minimum price is missing');
              }

              if (!form.decrease) {
                throw new Error('decrease interval is missing');
              }

              const decreaseIntervalMs = (() => {
                if (form.decrease === '1hour') return oneHourMs;
                if (form.decrease === '12hours') return 12 * oneHourMs;
                if (form.decrease === 'day') return 24 * oneHourMs;
                if (form.decrease === 'week') return 7 * 24 * oneHourMs;
                throw new Error(`Unsupported decrease value ${form.decrease}`);
              })();

              const durationMs = (() => {
                if (form.duration === 'test') return 5 * 60 * 1000;
                if (form.duration === 'week') return 7 * oneDayMs;
                if (form.duration === 'month') return 30 * oneDayMs;
                return undefined;
              })();

              return {
                type: form.type,
                price: form.price.toString(),
                minimumPrice: form.minimumPrice.toString(),
                decreaseInterval: decreaseIntervalMs.toString(),
                ...(durationMs && { expiresAt: Date.now() + durationMs }),
              };
            }
            case 'english': {
              const expiresAt = (() => {
                if (form.duration === 'test') return Date.now() + 5 * 60 * 1000;
                if (form.duration === 'week') return Date.now() + 7 * oneDayMs;
                if (form.duration === 'month')
                  return Date.now() + 30 * oneDayMs;
                if (form.duration === 'custom')
                  return mergeDateAndTime(form.date, form.time)?.getTime();

                return undefined;
              })();

              return {
                type: form.type,
                price: form.price.toString(),
                expiresAt,
              };
            }
            default: {
              throw new Error(`Unsupported listing type ${form.type}`);
            }
          }
        })(),
        walletAddress: walletAddress.toString(),
        signer: createAoSigner(wallet.contractSigner),
      });
    },
  });

  const name = searchParams.get('name') ?? '-';

  const endDate =
    form.duration === 'custom'
      ? form.date
        ? `${formatDate(form.date.toString(), 'yyyy-MM-dd')}T${form.time}`
        : new Date().toString()
      : addMilliseconds(
          new Date(),
          pickMilisekundsBasedOnDuration(form.duration ?? '0'),
        ).toString();

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

  const updateForm = <T extends keyof FormState>(
    field: T,
    value: FormState[T],
  ) => {
    setForm((state) => ({
      ...state,
      [field]: value,
    }));
  };

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
                  defaultValue={form.type}
                  onValueChange={(value) => updateForm('type', value)}
                  options={typeOptions}
                />
              </div>
              <Input
                onChange={(e) => updateForm('price', e.target.value)}
                value={form.price}
                min={0}
                label="Price"
                suffix="ARIO"
                type="number"
              />
              {form.type === 'dutch' ? (
                <>
                  <Input
                    onChange={(e) => updateForm('minimumPrice', e.target.value)}
                    value={form.minimumPrice}
                    label="Minimum price (floor)"
                    suffix="ARIO"
                    type="number"
                  />
                  <div className="flex flex-col gap-2">
                    <Label>Duration</Label>
                    <Select
                      placeholder="Choose duration"
                      className="w-full"
                      onValueChange={(value) => updateForm('duration', value)}
                      options={durationOptions}
                    />
                  </div>
                  {form.duration === 'custom' && (
                    <DatePicker
                      date={form.date}
                      open={open}
                      setDate={(date) => updateForm('date', date)}
                      setOpen={setOpen}
                      time={form.time}
                      setTime={(time) => updateForm('time', time)}
                    />
                  )}
                  <div className="flex flex-col gap-2">
                    <Label>Price decrease interval</Label>
                    <Select
                      placeholder="Choose decrease interval"
                      className="w-full"
                      onValueChange={(value) => updateForm('decrease', value)}
                      options={decreaseOptions}
                    />
                    <PriceScheduleModal
                      basePrice={Number(form.price)}
                      floorPrice={Number(form.minimumPrice)}
                      date={endDate}
                      interval={form.decrease as Interval}
                    />
                  </div>
                </>
              ) : form.type === 'english' ? (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>Duration</Label>
                    <Select
                      placeholder="Choose duration"
                      className="w-full"
                      onValueChange={(value) => updateForm('duration', value)}
                      options={durationOptions}
                    />
                  </div>
                  {form.duration === 'custom' && (
                    <DatePicker
                      open={open}
                      setOpen={setOpen}
                      date={form.date}
                      time={form.time}
                      setDate={(date) => updateForm('date', date)}
                      setTime={(time) => updateForm('time', time)}
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
                    checked={form.hasExpirationTime}
                    onCheckedChange={() => {
                      updateForm('hasExpirationTime', !form.hasExpirationTime);
                      updateForm('time', '12:00:00');
                      updateForm('date', undefined);
                    }}
                  />
                  {form.hasExpirationTime && (
                    <div className="mt-6">
                      <DatePicker
                        open={open}
                        setOpen={setOpen}
                        date={form.date}
                        time={form.time}
                        setDate={(date) => updateForm('date', date)}
                        setTime={(time) => updateForm('time', time)}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <Row label="Type of listing" value={form.type} />
              <Row
                label={form.type === 'english' ? 'Starting price' : 'Price'}
                value={`${form.price} ARIO`}
              />
              {form.type === 'dutch' ? (
                <>
                  <Row
                    label="Minimum price (Floor price)"
                    value={`${form.minimumPrice} ARIO`}
                  />
                  <Row label="Duration" value={form.duration} />
                  <Row
                    label="Price decrease interval"
                    value={`Every ${form.decrease}`}
                  />
                  <PriceScheduleModal
                    basePrice={Number(form.price)}
                    floorPrice={Number(form.minimumPrice)}
                    date={endDate}
                    interval={form.decrease as Interval}
                  />
                </>
              ) : form.type === 'english' ? (
                <>
                  <Row label="Duration" value={form.duration} />
                </>
              ) : (
                <>
                  {form.hasExpirationTime ? (
                    <Row
                      label="Expiration time"
                      value={
                        form.date
                          ? `${formatDate(
                              form.date.toString(),
                              'yyyy-MM-dd',
                            )}T${form.time}`
                          : '-'
                      }
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
                  disabled={mutation.isPending}
                  onClick={() => {
                    if (step === 1) setStep(2);
                    else {
                      mutation.mutate(undefined, {
                        onError: (error) => {
                          console.error(error);
                          eventEmitter.emit('error', {
                            name: 'Failed to create listing',
                            message: error.message,
                          });
                        },
                        onSuccess: async (data) => {
                          console.log('listing created', { data });
                          await Promise.all([
                            queryClient.refetchQueries({
                              queryKey: [marketplaceQueryKeys.listings.all],
                            }),
                            queryClient.refetchQueries({
                              queryKey: [marketplaceQueryKeys.myANTs.all],
                            }),
                          ]);
                          setStep(3);
                        },
                      });
                    }
                  }}
                >
                  {step === 1
                    ? 'Next'
                    : mutation.isPending
                    ? 'Confirming listing...'
                    : 'Confirm listing'}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  const listingId = mutation.data?.listing?.orderId;
                  navigate(listingId ? `/listings/${listingId}` : '/listings');
                }}
              >
                View listing
              </Button>
            )}
          </div>
        </Card>
        {step === 3 && (
          <div className="flex gap-6 mt-6">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                navigate('/my-ants');
              }}
            >
              List another ANT
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                navigate('/listings');
              }}
            >
              Go to marketplace
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default MyANTsNewListing;
