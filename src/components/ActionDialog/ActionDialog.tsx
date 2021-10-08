import { Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { DialogProps } from "@saleor/types";
import React from "react";

import { ConfirmButtonTransitionState } from "../ConfirmButton";
import DialogButtons from "./DialogButtons";
import { ActionDialogVariant, Size } from "./types";

export interface ActionDialogProps extends DialogProps {
  children?: React.ReactNode;
  confirmButtonLabel?: string;
  confirmButtonState: ConfirmButtonTransitionState;
  disabled?: boolean;
  maxWidth?: Size | false;
  restrictScroll?: boolean;
  title: string;
  variant?: ActionDialogVariant;
  onConfirm();
}

const useStyles = makeStyles(
  () => ({
    root: {
      "& .MuiDialog-paper": {
        overflow: "initial"
      }
    },
    content: {
      overflow: "initial"
    }
  }),
  { name: "ActionDialog" }
);

const ActionDialog: React.FC<ActionDialogProps> = props => {
  const {
    children,
    open,
    title,
    onClose,
    variant,
    maxWidth,
    restrictScroll,
    ...rest
  } = props;
  const classes = useStyles();

  return (
    <Dialog
      fullWidth
      onClose={onClose}
      open={open}
      maxWidth={maxWidth}
      className={restrictScroll && classes.root}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className={restrictScroll && classes.content}>
        {children}
      </DialogContent>
      <DialogButtons {...rest} onClose={onClose} variant={variant} />
    </Dialog>
  );
};

ActionDialog.defaultProps = {
  maxWidth: "xs"
};

ActionDialog.displayName = "ActionDialog";
export default ActionDialog;
