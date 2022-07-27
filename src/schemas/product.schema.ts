import { object, number, string, TypeOf } from "zod";

const payload = {
  body: object({
    amountAvailable: number(),
    cost: number({
      required_error: "Cost is required",
    }),
    productName: string({
      required_error: "Name is required",
    }),
  }),
};

const params = {
  params: object({
    productId: string({
      required_error: "ProductID is required",
    }),
  }),
};

export const createProductSchema = object({
  ...payload,
});

export const updateProductSchema = object({
  ...payload,
  ...params,
});

export const deleteProductSchema = object({
  ...params,
});

export const getProductSchema = object({
  ...params,
});
