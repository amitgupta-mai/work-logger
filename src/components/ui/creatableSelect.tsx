import CreatableSelect, { CreatableProps } from 'react-select/creatable';
import { GroupBase, StylesConfig } from 'react-select';
import { OptionType } from '../../types';

export const StyledCreatableSelect = (
  props: CreatableProps<OptionType, false, GroupBase<OptionType>>
) => {
  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (provided, state) => {
      const isDisabled = props.isDisabled;
      return {
        ...provided,
        backgroundColor: isDisabled
          ? 'color-mix(in oklab, var(--muted) 30%, transparent)'
          : 'color-mix(in oklab, var(--input) 30%, transparent)',
        borderColor: isDisabled ? 'var(--border)' : 'var(--input)',
        boxShadow: state.isFocused ? `0 0 0 1px var(--ring)` : 'none',
        '&:hover': {
          borderColor: isDisabled ? 'var(--border)' : 'var(--input)',
        },
        borderRadius: 'var(--radius-md)',
        height: '2.25rem',
        minHeight: '2.25rem',
        opacity: isDisabled ? 0.6 : 1,
      };
    },
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--popover)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      color: 'var(--popover-foreground)',
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      width: '100%',
      boxSizing: 'border-box',
      WebkitOverflowScrolling: 'touch',
      paddingRight: 0,
      marginRight: 0,
      zIndex: 9999,
      scrollbarWidth: 'none',
      scrollbarColor: 'transparent transparent',
      className: 'hide-scrollbar-on-idle',
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '100px',
      minHeight: 0,
      overflowY: 'auto',
      padding: 0,
      margin: '4px',
      width: '98%',
      boxSizing: 'border-box',
      scrollbarWidth: 'none',
      scrollbarColor: 'transparent transparent',
      className: 'hide-scrollbar-on-idle',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'var(--accent)' : 'transparent',
      color: 'var(--accent-foreground)',
      fontSize: '0.8125rem',
      fontWeight: 500,
      borderRadius: 4,
      margin: 0,
      boxSizing: 'border-box',
      '&:hover': {
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-foreground)',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: props.isDisabled ? 'var(--muted-foreground)' : 'var(--foreground)',
      fontSize: '0.8125rem',
      fontWeight: 500,
    }),
    input: (provided) => ({
      ...provided,
      color: props.isDisabled ? 'var(--muted-foreground)' : 'var(--foreground)',
      margin: '0px',
      padding: '0px',
      fontSize: '0.8125rem',
      fontWeight: 500,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: props.isDisabled
        ? 'var(--muted-foreground)'
        : 'var(--muted-foreground)',
      fontSize: '0.8125rem',
      fontWeight: 500,
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      cursor: 'pointer',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      cursor: 'pointer',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      display: 'none',
    }),
  };

  return (
    <div className={props.isDisabled ? 'disabled-select' : ''}>
      <CreatableSelect {...props} styles={customStyles} />
    </div>
  );
};
