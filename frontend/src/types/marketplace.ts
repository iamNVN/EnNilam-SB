
export type OwnerHistory = {
  id: string;
  name: string;
  transferDate: string;
  profileUrl: string;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Area = {
  cent: number;
  sqft: number;
};

export type Seller = {
  name: string;
  profileUrl: string;
};

export type Listing = {
  id: string;
  landName: string;
  imageUrl: string;
  listingType: "sale" | "auction";
  city: string;
  state: string;
  totalPrice: number;
  area: Area;
  coordinates: Coordinates;
  seller: Seller;
  ownershipHistory: OwnerHistory[];
};
