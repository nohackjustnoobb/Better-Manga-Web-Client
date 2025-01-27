import "./button.scss";

import { FunctionComponent, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  outlined?: boolean;
  filled?: boolean;
  warning?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  horizontalPadding?: number;
  textColor?: string;
  backgroundColor?: string;
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  filled,
  outlined,
  warning,
  disabled,
  fullWidth,
  horizontalPadding,
  textColor,
  backgroundColor,
}) => {
  const classList = ["button"];
  if (outlined) classList.push("outlined");
  if (warning) classList.push("warning");
  if (disabled) classList.push("disabled");
  if (fullWidth) classList.push("fullWidth");
  if (filled !== undefined && !filled) classList.push("clear");

  return (
    <span
      className={classList.join(" ")}
      onClick={() => !disabled && onClick()}
      style={{
        paddingTop: `${horizontalPadding}rem`,
        paddingBottom: `${horizontalPadding}rem`,
        color: textColor,
        backgroundColor: backgroundColor,
      }}
    >
      {children}
    </span>
  );
};

export default Button;
