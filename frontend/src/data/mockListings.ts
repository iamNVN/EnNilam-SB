
import { Listing } from "@/types/marketplace";

export const mockListings: Listing[] = [
  {
    id: "68bc1ca1-12b7-41ff-8560-5bf053872503",
    landName: "Premium Land in Chennai",
    imageUrl: "/placeholder.svg",
    listingType: "auction",
    city: "Chennai",
    state: "Tamil Nadu",
    totalPrice: 48000,
    area: {
      cent: 4,
      sqft: 1742
    },
    coordinates: {
      lat: 13.0827,
      lng: 80.2707
    },
    seller: {
      name: "John Doe",
      profileUrl: "#"
    },
    ownershipHistory: [
      {
        id: "1",
        name: "John Doe",
        transferDate: "2022-10-15",
        profileUrl: "#"
      }
    ]
  },
  {
    id: "79de2db2-23c8-42ff-9671-6c4164883614",
    landName: "Prime Land in Bangalore",
    imageUrl: "/placeholder.svg",
    listingType: "sale",
    city: "Bangalore",
    state: "Karnataka",
    totalPrice: 75000,
    area: {
      cent: 5,
      sqft: 2178
    },
    coordinates: {
      lat: 12.9716,
      lng: 77.5946
    },
    seller: {
      name: "Jane Smith",
      profileUrl: "#"
    },
    ownershipHistory: [
      {
        id: "2",
        name: "Jane Smith",
        transferDate: "2023-01-15",
        profileUrl: "#"
      }
    ]
  }
];
