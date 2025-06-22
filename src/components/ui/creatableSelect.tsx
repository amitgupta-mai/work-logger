import CreatableSelect, { CreatableProps } from 'react-select/creatable';
import { GroupBase, StylesConfig } from 'react-select';
import { OptionType } from '../../types';

export const StyledCreatableSelect = (
  props: CreatableProps<OptionType, false, GroupBase<OptionType>>
) => {
  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'color-mix(in oklab, var(--input) 30%, transparent)',
      borderColor: 'var(--input)',
      boxShadow: state.isFocused ? `0 0 0 1px var(--ring)` : 'none',
      '&:hover': {
        borderColor: 'var(--input)',
      },
      borderRadius: 'var(--radius-md)',
      height: '2.25rem',
      minHeight: '2.25rem',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--popover)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      color: 'var(--popover-foreground)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'var(--accent)' : 'transparent',
      color: 'var(--accent-foreground)',
      '&:hover': {
        backgroundColor: 'var(--accent)',
      },
      fontSize: '0.8125rem',
      fontWeight: 500,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
      fontSize: '0.8125rem',
      fontWeight: 500,
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
      margin: '0px',
      padding: '0px',
      fontSize: '0.8125rem',
      fontWeight: 500,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      fontSize: '0.8125rem',
      fontWeight: 500,
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      display: 'none',
    }),
  };

  return <CreatableSelect {...props} styles={customStyles} />;
};
