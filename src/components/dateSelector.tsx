import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    dateFormat='dd/MM/yyyy'
  />
);

export default DateSelector;
