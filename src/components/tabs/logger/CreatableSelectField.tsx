import { OptionType } from '../../../types';
import { StyledCreatableSelect } from '../../ui/creatableSelect';

interface CreatableSelectFieldProps {
  value: OptionType | null;
  onChange: (value: OptionType | null) => void;
  onCreateOption: (
    inputValue: string,
    onSelect?: (value: OptionType) => void
  ) => void;
  options: OptionType[];
  placeholder: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  isDisabled?: boolean;
  className?: string;
}

const CreatableSelectField = ({
  value,
  onChange,
  onCreateOption,
  options,
  placeholder,
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  className = '',
}: CreatableSelectFieldProps) => (
  <StyledCreatableSelect
    value={value}
    onChange={onChange}
    onCreateOption={(inputValue) => onCreateOption(inputValue, onChange)}
    options={options}
    placeholder={placeholder}
    isClearable={isClearable}
    isSearchable={isSearchable}
    isDisabled={isDisabled}
    className={className}
  />
);

export default CreatableSelectField;
