import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { TimePickerProps } from '../../../types';

const TimePicker = ({
  hour,
  onHourChange,
  minute,
  onMinuteChange,
  ampm,
  onAmPmChange,
  label,
  error,
  touched,
  onHourBlur,
  onMinuteBlur,
  onAmPmBlur,
}: TimePickerProps) => {
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  return (
    <div>
      {label && <label className='block text-xs mb-1'>{label}</label>}
      <div className='flex gap-2 items-center'>
        <Select value={hour} onValueChange={onHourChange}>
          <SelectTrigger className='w-[80px] h-8' onBlur={onHourBlur}>
            <SelectValue placeholder='hh' />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>:</span>
        <Select value={minute} onValueChange={onMinuteChange}>
          <SelectTrigger className='w-[80px] h-8' onBlur={onMinuteBlur}>
            <SelectValue placeholder='mm' />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ampm} onValueChange={onAmPmChange}>
          <SelectTrigger className='w-[100px] h-8' onBlur={onAmPmBlur}>
            <SelectValue placeholder='AM/PM' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='AM'>AM</SelectItem>
            <SelectItem value='PM'>PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(touched ? touched && error : error) && (
        <div className='text-xs text-red-500 mt-1'>{error}</div>
      )}
    </div>
  );
};

export default TimePicker;
