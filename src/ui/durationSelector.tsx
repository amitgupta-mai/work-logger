import Select from "react-select";

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
      placeholder="Select duration"
      value={selectedDuration}
      onChange={(e) => setSelectedDuration(e)}
      options={durationOptions}
      className="mt-2"
    />
  );
};
