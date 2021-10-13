import GiftCardListPageDeleteDialog from "@saleor/giftCards/components/GiftCardDeleteDialog/GiftCardListPageDeleteDialog";
import GiftCardCreateDialog from "@saleor/giftCards/GiftCardCreateDialog";
import GiftCardExportDialog from "@saleor/giftCards/GiftCardExportDialog";
import { giftCardsListUrl } from "@saleor/giftCards/urls";
import useNavigator from "@saleor/hooks/useNavigator";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import React, { createContext } from "react";

import {
  GiftCardListActionParamsEnum,
  GiftCardListUrlQueryParams
} from "../../types";

interface GiftCardListDialogsProviderProps {
  children: React.ReactNode;
  params: GiftCardListUrlQueryParams;
}

export interface GiftCardListDialogsConsumerProps {
  openCreateDialog: () => void;
  openDeleteDialog: (id?: string | React.MouseEvent) => void;
  openExportDialog: () => void;
  closeDialog: () => void;
  id: string;
}

export const GiftCardListDialogsContext = createContext<
  GiftCardListDialogsConsumerProps
>(null);

const GiftCardListDialogsProvider: React.FC<GiftCardListDialogsProviderProps> = ({
  children,
  params
}) => {
  const navigate = useNavigator();

  const id = params?.id;

  const { CREATE, DELETE, EXPORT } = GiftCardListActionParamsEnum;

  const [openDialog, closeDialog] = createDialogActionHandlers<
    GiftCardListActionParamsEnum,
    GiftCardListUrlQueryParams
  >(navigate, giftCardsListUrl, params);

  const handleOpenDialog = (type: GiftCardListActionParamsEnum) => () =>
    openDialog(type);

  const isDialogOpen = (type: GiftCardListActionParamsEnum) =>
    params?.action === type;

  const handleDeleteDialogOpen = (id?: string) => {
    openDialog(
      GiftCardListActionParamsEnum.DELETE,
      typeof id === "string" ? { id } : undefined
    );
  };

  const providerValues: GiftCardListDialogsConsumerProps = {
    openCreateDialog: handleOpenDialog(CREATE),
    openExportDialog: handleOpenDialog(EXPORT),
    openDeleteDialog: handleDeleteDialogOpen,
    closeDialog,
    id
  };

  return (
    <GiftCardListDialogsContext.Provider value={providerValues}>
      {children}
      <GiftCardCreateDialog
        open={isDialogOpen(CREATE)}
        closeDialog={closeDialog}
      />
      <GiftCardListPageDeleteDialog
        open={isDialogOpen(DELETE)}
        closeDialog={closeDialog}
      />
      <GiftCardExportDialog
        open={isDialogOpen(EXPORT)}
        closeDialog={closeDialog}
      />
    </GiftCardListDialogsContext.Provider>
  );
};

export default GiftCardListDialogsProvider;
