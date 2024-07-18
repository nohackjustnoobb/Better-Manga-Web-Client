import "./checkbox.scss";

import { FunctionComponent } from "react";

import {
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
  mdiCheckboxMarkedOutline,
} from "@mdi/js";
import Icon from "@mdi/react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  outlined?: boolean;
  size?: number;
}

const Checkbox: FunctionComponent<CheckboxProps> = ({
  checked,
  onChange,
  outlined,
  size,
}) => {
  const checkedIcon = outlined ? mdiCheckboxMarkedOutline : mdiCheckboxMarked;

  return (
    <span className={"checkbox"} onClick={() => onChange(!checked)}>
      <Icon
        path={checked ? checkedIcon : mdiCheckboxBlankOutline}
        size={size || 1}
      />
    </span>
  );
};

export default Checkbox;
