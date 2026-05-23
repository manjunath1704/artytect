"use client";

import { useEffect, useMemo, useState } from "react";
import Select, {
  type GroupBase,
  type Props as ReactSelectProps,
  type StylesConfig,
} from "react-select";

export type SelectOption<Value extends string = string> = {
  value: Value;
  label: string;
};

type AppSelectProps<
  Option extends SelectOption = SelectOption,
  IsMulti extends boolean = false,
> = Omit<ReactSelectProps<Option, IsMulti, GroupBase<Option>>, "styles" | "unstyled"> & {
  invalid?: boolean;
};

export function AppSelect<
  Option extends SelectOption = SelectOption,
  IsMulti extends boolean = false,
>({
  invalid = false,
  menuPlacement = "auto",
  menuPosition = "fixed",
  ...props
}: AppSelectProps<Option, IsMulti>) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const styles = useMemo<StylesConfig<Option, IsMulti, GroupBase<Option>>>(
    () => ({
      container: (base) => ({
        ...base,
        width: "100%",
      }),
      control: (base, state) => ({
        ...base,
        minHeight: 48,
        borderRadius: 10,
        borderColor: invalid ? "#f87171" : state.isFocused ? "#b38d67" : "#d9ccbc",
        backgroundColor: state.isDisabled ? "#f5eee4" : "#fffdf9",
        boxShadow: state.isFocused ? "0 0 0 4px rgba(215, 182, 139, 0.2)" : "none",
        color: "#1b1511",
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        opacity: state.isDisabled ? 0.6 : 1,
        transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
        "&:hover": {
          borderColor: state.isFocused ? "#b38d67" : "#1b1511",
        },
      }),
      valueContainer: (base) => ({
        ...base,
        padding: "2px 12px",
      }),
      input: (base) => ({
        ...base,
        color: "#1b1511",
        fontSize: 14,
        margin: 0,
        padding: 0,
      }),
      singleValue: (base) => ({
        ...base,
        color: "#1b1511",
        fontSize: 14,
      }),
      multiValue: (base) => ({
        ...base,
        borderRadius: 999,
        backgroundColor: "#f5eee4",
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: "#1b1511",
        fontSize: 12,
        paddingLeft: 10,
      }),
      multiValueRemove: (base) => ({
        ...base,
        borderRadius: 999,
        color: "#8a7765",
        ":hover": {
          backgroundColor: "#ead7c3",
          color: "#1b1511",
        },
      }),
      placeholder: (base) => ({
        ...base,
        color: "#a69280",
        fontSize: 14,
      }),
      indicatorsContainer: (base) => ({
        ...base,
        minHeight: 46,
      }),
      indicatorSeparator: () => ({
        display: "none",
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? "#1b1511" : "#8a7765",
        padding: "0 12px",
        transition: "color 160ms ease, transform 160ms ease",
        transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
        ":hover": {
          color: "#1b1511",
        },
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "#8a7765",
        padding: "0 8px",
        ":hover": {
          color: "#1b1511",
        },
      }),
      menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
      }),
      menu: (base) => ({
        ...base,
        overflow: "hidden",
        border: "1px solid #d9ccbc",
        borderRadius: 10,
        backgroundColor: "#fffdf9",
        boxShadow: "0 18px 45px rgba(27, 21, 17, 0.16)",
        animation: "app-select-menu 140ms cubic-bezier(0.22, 1, 0.36, 1)",
      }),
      menuList: (base) => ({
        ...base,
        padding: 6,
        maxHeight: 280,
      }),
      option: (base, state) => ({
        ...base,
        borderRadius: 8,
        color: state.isSelected ? "#1b1511" : "#5f544b",
        backgroundColor: state.isSelected
          ? "#ead7c3"
          : state.isFocused
            ? "#f5eee4"
            : "transparent",
        cursor: "pointer",
        fontSize: 14,
        lineHeight: 1.45,
        padding: "10px 12px",
        transition: "background-color 120ms ease, color 120ms ease",
        ":active": {
          backgroundColor: "#ead7c3",
        },
      }),
      noOptionsMessage: (base) => ({
        ...base,
        color: "#8a7765",
        fontSize: 14,
        padding: "12px",
      }),
      loadingMessage: (base) => ({
        ...base,
        color: "#8a7765",
        fontSize: 14,
        padding: "12px",
      }),
    }),
    [invalid],
  );

  return (
    <Select<Option, IsMulti, GroupBase<Option>>
      unstyled={false}
      styles={styles}
      menuPlacement={menuPlacement}
      menuPosition={menuPosition}
      menuPortalTarget={portalTarget}
      classNamePrefix="app-select"
      {...props}
    />
  );
}
