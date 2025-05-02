import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateSelectorProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  setSelectedDate,
}) => (
  <DatePicker
    selected={selectedDate}
    onChange={(date) => setSelectedDate(date)}
    dateFormat="dd/MM/yyyy"
    wrapperClassName="w-full"
    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholderText="Select a date"
  />
);

export default DateSelector;
