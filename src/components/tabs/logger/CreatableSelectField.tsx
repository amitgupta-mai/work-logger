import { CreatableSelectFieldProps } from '../../../types';
import { StyledCreatableSelect } from '../../ui/creatableSelect';

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
    onCreateOption={onCreateOption}
    options={options}
    placeholder={placeholder}
    isClearable={isClearable}
    isSearchable={isSearchable}
    isDisabled={isDisabled}
    className={className}
  />
);

export default CreatableSelectField;
