import { WindowTitle } from "@saleor/components/WindowTitle";
import useFormset from "@saleor/hooks/useFormset";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import OrderFulfillPage from "@saleor/orders/components/OrderFulfillPage";
import OrderFulfillStockExceededDialog from "@saleor/orders/components/OrderFulfillStockExceededDialog";
import { useOrderFulfill } from "@saleor/orders/mutations";
import { useOrderFulfillData } from "@saleor/orders/queries";
import { orderUrl } from "@saleor/orders/urls";
import { OrderFulfillStockInput } from "@saleor/types/globalTypes";
import { mapEdgesToItems } from "@saleor/utils/maps";
import { useWarehouseList } from "@saleor/warehouses/queries";
import React from "react";
import { useIntl } from "react-intl";

export interface OrderFulfillProps {
  orderId: string;
}

const OrderFulfill: React.FC<OrderFulfillProps> = ({ orderId }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();
  const { data, loading, refetch } = useOrderFulfillData({
    displayLoader: true,
    variables: {
      orderId
    }
  });

  const { data: warehouseData, loading: warehousesLoading } = useWarehouseList({
    displayLoader: true,
    variables: {
      first: 20
    }
  });

  const [
    displayStockExceededDialog,
    setDisplayStockExceededDialog
  ] = React.useState(false);

  const { change: formsetChange, data: formsetData } = useFormset<
    null,
    OrderFulfillStockInput[]
  >(
    data?.order?.lines
      .filter(line => line.quantity - line.quantityFulfilled > 0)
      .map(line => ({
        data: null,
        id: line.id,
        label: line.variant.attributes
          .map(attribute =>
            attribute.values
              .map(attributeValue => attributeValue.name)
              .join(" , ")
          )
          .join(" / "),
        value: line.variant.stocks.map(stock => ({
          quantity: 0,
          warehouse: stock.warehouse.id
        }))
      }))
  );

  const [fulfillOrder, fulfillOrderOpts] = useOrderFulfill({
    onCompleted: data => {
      if (data.orderFulfill.errors.length === 0) {
        navigate(orderUrl(orderId), true);
        notify({
          status: "success",
          text: intl.formatMessage({
            defaultMessage: "Fulfilled Items",
            description: "order fulfilled success message"
          })
        });
      }
    }
  });

  React.useEffect(() => {
    if (
      fulfillOrderOpts.data?.orderFulfill.errors?.every(
        err => err.code === "INSUFFICIENT_STOCK"
      )
    ) {
      setDisplayStockExceededDialog(true);
      refetch();
    }
  }, [fulfillOrderOpts.data]);

  return (
    <>
      <WindowTitle
        title={
          data?.order?.number
            ? intl.formatMessage(
                {
                  defaultMessage: "Fulfill Order #{orderNumber}",
                  description: "window title"
                },
                {
                  orderNumber: data.order.number
                }
              )
            : intl.formatMessage({
                defaultMessage: "Fulfill Order",
                description: "window title"
              })
        }
      />
      <OrderFulfillPage
        loading={loading || warehousesLoading || fulfillOrderOpts.loading}
        errors={fulfillOrderOpts.data?.orderFulfill.errors}
        onBack={() => navigate(orderUrl(orderId))}
        formsetChange={formsetChange}
        formsetData={formsetData}
        onSubmit={formData =>
          fulfillOrder({
            variables: {
              input: {
                lines: formData.items.map(line => ({
                  orderLineId: line.id,
                  stocks: line.value
                })),
                notifyCustomer: formData.sendInfo,
                allowStockToBeExceeded: formData.allowStockToBeExceeded
              },
              orderId
            }
          })
        }
        order={data?.order}
        saveButtonBar="default"
        warehouses={mapEdgesToItems(warehouseData?.warehouses)}
      />
      <OrderFulfillStockExceededDialog
        lines={data?.order.lines}
        formsetData={formsetData}
        open={displayStockExceededDialog}
        onClose={() => setDisplayStockExceededDialog(false)}
      />
    </>
  );
};

OrderFulfill.displayName = "OrderFulfill";
export default OrderFulfill;
