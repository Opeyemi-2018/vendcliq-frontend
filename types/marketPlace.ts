export interface RegularStock {
  id: string;
  product: { name: string; image: string };
  selling_price: string;
  total_qty: string;
  isOffer?: false;
}

export interface OfferStock {
  id: string;
  product: { name: string; image: string };
  price: number;
  qty: number;
  minimum_qty: number;
  isOffer: true;
}

export type CombinedStock = RegularStock | OfferStock;