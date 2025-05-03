import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const durationOptions = Array.from({ length: 32 }, (_, i) => ({
  value: (i + 1) * 15,
  label: `${(i + 1) * 15} min`,
}));

export const DurationSelector = ({
  selectedDuration,
  setSelectedDuration,
}: {
  selectedDuration: { value: number; label: string } | null;
  setSelectedDuration: (value: { value: number; label: string } | null) => void;
}) => {
  return (
    <Select
      key={selectedDuration?.value}
      value={selectedDuration ? selectedDuration.value.toString() : undefined}
      onValueChange={(value) =>
        setSelectedDuration(
          durationOptions.find((option) => option.value.toString() === value) ||
            null
        )
      }
    >
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Duration' />
      </SelectTrigger>
      <SelectContent>
        {durationOptions.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
