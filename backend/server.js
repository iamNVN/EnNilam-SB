import express from "express";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Razorpay from "razorpay";
import crypto from "crypto";
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
const SUPABASE_URL = "https://sckzsqyesbculskcztlo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNja3pzcXllc2JjdWxza2N6dGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNjcxNzEsImV4cCI6MjA1NDg0MzE3MX0.gWaZLIHp7gLJq7uJlaGHCmrkmstXi5_UCDB4B9NCv7s";
const SECRET_KEY = "561b06fada07165b16e93a0e42cf1632594393cfcf12a3ca9122918c440ed44c317b67d581d0fba5132f1e2920b075554c5d0bab01de7fc18da2fb28058abded";

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_uTMh2Eea44jDfS",
  key_secret: "UQhX6AlUNzqvQdjN5H0bo6nv",
});

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    return null;
  }
};

//getAadhaarDetails

app.post("/getAadhaar", async (req, res) => {
  const { aadhaar, stayLoggedIn } = req.body;
  const { data: users, error: queryError } = await supabase
    .from('users_new')
    .select("phone_number,name")
    .limit(1)
    .eq("aadhaar", aadhaar)
    .single();

  if (!users) {
    return res.status(404).json({ success: false, message: "Invalid Aadhaar Number" })
  }
  return res.json({ success: true, phone: users["phone_number"], name: users["name"] });

});

app.post("/getAadhaarLands", async (req, res) => {
  const { aadhaar } = req.body;
  const { data: users, error: queryError } = await supabase
    .from('users_new')
    .select("lands")
    .eq("aadhaar", aadhaar)
    .single();
  const lands = users.lands;

  if (!users) {
    return res.status(404).json({ success: false, message: "Invalid Aadhaar Number" })
  }
  return res.json({ success: true, phone: users["phone_number"] });

});

app.post("/mintLands", async (req, res) => {
  const { aadhaar, wallet } = req.body;
  const { data: users, error: queryError } = await supabase
    .from('users_new')
    .select("lands")
    .eq("aadhaar", aadhaar)
    .single();
  const lands = users.lands;
  const landsWithOwner = lands.map(land => ({
    ...land,
    owner: wallet
  }));

  for (const land of landsWithOwner) {
    try {
      console.log(land);
      const response = await axios.post('http://localhost:3000/api/land/mint', land);
      if (response.data.message == "Land minted successfully") {
        console.log(`Successfully minted land with ID ${land.landId}:`, response.data);

      } else {
        console.error(`Error minting land with ID ${land.landId}:`, error.response?.data || error.message);

      }
    } catch (error) {
      console.error(`Error minting land with ID ${land.landId}:`, error.response?.data || error.message);


    }
  }

  return res.json({ success: true })



});

// POST: Verify Aadhaar OTP and Create Session
app.post("/verify-otp", async (req, res) => {
  try {
    const { aadhaar, otp, stayLoggedIn } = req.body;
    if (!aadhaar || !otp) return res.status(400).json({ error: "Aadhaar and OTP required" });

    // 1️⃣ Check Aadhaar & OTP in Supabase Database
    const { data: user, error: queryError } = await supabase
      .from("users")
      .select()
      .eq("aadhaar", aadhaar)
      .eq("otp", otp)
      .maybeSingle();

    if (queryError) throw queryError;
    if (!user) return res.status(401).json({ error: "Invalid OTP" });

    // 2️⃣ Update Verification Status
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_verified: true })
      .eq("aadhaar", aadhaar);

    if (updateError) throw updateError;

    // 3️⃣ Generate a JWT Token for the User
    const token = jwt.sign({ aadhaar, name: user?.name, id: user?.id, phone: user?.phone_number }, SECRET_KEY, { expiresIn: stayLoggedIn ? "7d" : "1h" });

    // 4️⃣ Return Token to Frontend
    res.json({ message: "Login Successful", token });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.post("/createListing", async (req, res) => {

  const { landID, ratePerCent, type, auctionEndTime, startingBid, ownerID } = req.body;

  if (!landID || (type === "sale" && !ratePerCent)) return res.status(400).json({ error: "Fields Missing" });
  if (type == "auction" && (!auctionEndTime || !startingBid)) return res.status(400).json({ error: "Fields Missing" });

  try {
    const { data, error } = await supabase
      .from("marketplace_listings")
      .insert([
        {
          landid: landID,
          rate_per_cent: ratePerCent,
          type: type,
          auction_end_time: auctionEndTime || null,
          starting_bid: startingBid || null,
          highest_bid: null,
          highest_bidder_id: null,
        },
      ]);

    if (error) throw error;
    res.json({ message: "Listing added", success: true });

    return data;
  } catch (err) {
    res.json({ message: "Failed to add", success: false });

    console.error("Error adding land listing:", err.message);
  }

});


app.post("/getListings", async (req, res) => {
  try {
    const { wallet } = req.body;
    // Decode the JWT to get the user ID

    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*, landDetails:lands(*)");

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Filter out listings where the user's ID matches the land owner ID
    const filteredData = data.filter(listing => listing.landDetails.ownerid.toLowerCase() !== wallet.toLowerCase());

    res.json({ success: true, data: filteredData });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/getYourListings", async (req, res) => {
  const { wallet } = req.body;

  try {


    // Fetch marketplace_listings where landID matches and ownerID matches the user
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*, landDetails:lands(*)");

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Filter out listings where the user's ID matches the land owner ID
    const filteredData = data.filter(listing => listing.landDetails?.owner === wallet);

    res.json({ success: true, data: filteredData });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }

});

app.post("/getLands", async (req, res) => {

  try {
    const { wallet } = req.body;

    // Fetch lands owned by the user
    const { data, error } = await supabase
      .from("lands")
      .select("*")
      .eq("ownerid", wallet);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
});

app.post("/getLand", async (req, res) => {
  const { wallet, landID } = req.body;

  try {
    // Fetch lands owned by the user
    const { data, error } = await supabase
      .from("lands")
      .select("*")
      .eq("ownerid", wallet)
      .eq("landid", landID);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
});

app.post("/verifyLand", async (req, res) => {
  const { landID, ownerID } = req.body;

  try {
    // const listingResponse = await fetch(`http://localhost:3000/api/land/${landID}/${ownerID}`, {
    //   method: "GET",
    //   headers: { "Content-Type": "application/json" },
    //   credentials: "include"
    // });
    // const { data: userData, error } = await supabase
    //   .from("users_new")
    //   .select("name")
    //   .eq("wallet_address", ownerID)
    //   .single();

    // if (error) {
    //   console.error("Error fetching name:", error.message);
    //   res.status(401).json({ success: false, error: error.message });
    // } else if (userData) {
    //   const listingData = await listingResponse.json();

    //   // Add the name to each item in listingData.data
    //   listingData.data.name = userData.name;

    //   return res.json({ success: true, status: listingData.status, land: listingData.data });


    // }

    const { data, error } = await supabase
      .from("lands")
      .select("*, users_new(name)")  // Fetch all land fields and user's name
      .eq("ownerid", ownerID)
      .eq("landid", landID)
      .single();

    if (error) {
      return res.status(500).json({ success: false, status: false, error: error.message });
    }
    if (!data) {
      return res.json({ success: true, status: false });
    }

    // Extracting name from nested object
    const landData = {
      ...data,
      name: data.users_new?.name || null,  // Add name field to response
    };
    delete landData.users_new;  // Remove nested object if not needed

    return res.json({ success: true, status: true, data: landData });


  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

app.post("/isListed", async (req, res) => {
  const { landID, wallet } = req.body;

  if (!landID || !wallet) {
    return res.status(400).json({ success: false, message: "Land ID and token are required" });
  }

  try {


    // Fetch offers for the specified listing
    const { data: listingData, error: fetchError } = await supabase
      .from("marketplace_listings")
      .select("offers")
      .eq("landid", landID)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ success: false, message: fetchError.message });
    }

    const recordExists = !!listingData

    res.json({
      success: true,
      landID: landID,
      isListed: recordExists, // Return null if no offer exists
    });
  } catch (error) {
    console.error("Error fetching offers for listing:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/userDashboard", async (req, res) => {
  const { wallet } = req.body;
  try {
    // Fetch lands owned by the user
    const { data: lands, error: landsError } = await supabase
      .from('lands')
      .select('landid')
      .eq('ownerid', wallet);

    if (landsError) {
      console.error("❌ Error fetching lands:", landsError.message);
      return res.status(500).json({ success: false, error: landsError.message });
    }

    if (!Array.isArray(lands)) {
      console.error("❌ Lands data is not iterable:", lands);
      return res.status(500).json({ success: false, error: "Lands data is not iterable" });
    }

    const landIDs = lands.map(l => l.landid);

    // Fetch listings where landid is in landIDs and status is "open"
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('id')
      .in('landid', landIDs)
      .eq('status', 'open');
    const { data: totallistings, error: listingssError } = await supabase
      .from('marketplace_listings')
      .select('id')
      .in('landid', landIDs);

    if (listingsError) {
      console.error("❌ Error fetching listings:", listingsError.message);
      return res.status(500).json({ success: false, error: listingsError.message });
    }

    res.json({
      success: true,
      data: {
        lands: landIDs.length,
        activeListings: listings.length,
        totalListings: totallistings.length
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }

});

app.post("/getAvailableLands", async (req, res) => {
  const { wallet } = req.body;


  try {
    // Fetch land IDs that are already listed in marketplace_listings
    const { data: listedLands, error: listedLandsError } = await supabase
      .from("marketplace_listings")
      .select("landid")
      .not("landid", "is", null);

    if (listedLandsError) {
      return res.status(500).json({ success: false, error: listedLandsError.message });
    }

    // Ensure listedLandIds is an array of valid IDs
    const listedLandIds = listedLands
      .map((land) => land.landid)
      .filter((id) => !!id);

    // Fetch lands owned by the user and not listed in the marketplace
    let query = supabase
      .from("lands")
      .select("*")
      .eq("ownerid", wallet);

    // Apply "not in" filter only if listedLandIds is not empty
    if (listedLandIds.length > 0) {
      query = query.not("landid", "in", `(${listedLandIds.join(",")})`);
    }

    const { data: unlistedLands, error: unlistedLandsError } = await query;

    if (unlistedLandsError) {
      return res.status(500).json({ success: false, error: unlistedLandsError.message });
    }

    res.json({ success: true, data: unlistedLands });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/getListing", async (req, res) => {
  const { wallet, listingID } = req.body;
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(`
      id, landid, rate_per_cent, listed_on, type, 
      auction_end_time, starting_bid, 
      offers
          `)
    .eq("id", listingID)
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  // First query: Get the ownerid from lands table
  const { data: landData, error: landError } = await supabase
    .from('lands')
    .select('ownerid')
    .eq('landid', data.landid)
    .single();

  if (landError) {
    console.error('Error fetching land data:', landError);
    return;
  }

  // Second query: Get the name from users_new using the ownerid
  const { data: userData, error: userError } = await supabase
    .from('users_new')
    .select('name')
    .eq('wallet_address', landData.ownerid)
    .single();

  if (userError) {
    console.error('Error fetching user data:', userError);
    return;
  }



  // const listingResponse = await fetch(`http://localhost:3000/api/land/${data.landid}`, {
  //   method: "GET",
  //   headers: { "Content-Type": "application/json" },
  //   credentials: "include"
  // });
  // const listingData = await listingResponse.json();

  const { data: listingData, serror } = await supabase
    .from("lands")
    .select("*")  // Fetch all land fields and user's name
    .eq("landid", data.landid)
    .single();

  if (serror) {
    return res.status(500).json({ success: false, status: false, error: screenXerror.message });
  }
  // console.log(listingData);

  data.landDetails = listingData;
  data.ownerName = userData.name;

  // Check if the user owns the land
  const isOwner = data?.landDetails?.owner === wallet;

  // Determine which offers to show
  let offersToShow = [];
  if (Array.isArray(data.offers)) {
    if (data.type === "auction") {
      offersToShow = isOwner
        ? data.offers // Show all offers if the user is the owner
        : data.offers.sort((a, b) => b.amount - a.amount).slice(0, 5); // Top 5 offers for others
    } else {
      offersToShow = isOwner ? data.offers : undefined; // For sales, show all offers if the owner
    }
  }

  // Construct the response data
  const responseData = {
    ...data,
    offers: offersToShow,

  };

  res.json({ success: true, data: responseData });
});

app.post("/deleteListing", async (req, res) => {
  const { userToken, listingID } = req.body;

  if (verifyToken(userToken) == null) {
    res.json({ message: "Unauthorized", success: false });
    return;
  }
  try {
    const decoded = jwt.verify(userToken, SECRET_KEY);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Fetch the specific listing with land details
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*, landDetails:lands(*)")
      .eq("id", listingID)
      .limit(1); // Only fetch the specific listing

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Check if the listing is owned by the user
    const isOwnedByUser = data?.[0]?.landDetails?.ownerid === decoded.id;
    if (isOwnedByUser) {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .delete()
        .eq("id", listingID);

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.json({ success: true, message: "Listing deleted successfully!" });

    } else {
      return res.json({ success: true, message: "User is not the owner!" });

    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/makeOffer", async (req, res) => {
  const { token, offerAmount, listingID } = req.body;

  if (!token || !offerAmount || !listingID) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {

    const { data: listingData, error: fetchError } = await supabase
      .from("marketplace_listings")
      .select("offers")
      .eq("id", listingID)
      .single();

    if (fetchError) {
      return res
        .status(500)
        .json({ success: false, message: fetchError.message });
    }

    // Prepare the new offer
    const existingOffers = listingData?.offers || [];
    const newOffer = {
      amount: parseFloat(offerAmount),
      date: new Date().toISOString(),
      userID: token,
    };

    const updatedOffers = [...existingOffers, newOffer];

    // Update offers in Supabase
    const { error: updateError } = await supabase
      .from("marketplace_listings")
      .update({ offers: updatedOffers })
      .eq("id", listingID);

    if (updateError) {
      return res
        .status(500)
        .json({ success: false, message: updateError.message });
    }

    res.json({ success: true, message: "Offer added successfully!" });
  } catch (error) {
    console.error("Error adding offer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/listingOffer", async (req, res) => {
  const { id, wallet } = req.body;

  if (!id || !wallet) {
    return res.status(400).json({ success: false, message: "Listing ID and token are required" });
  }

  try {

    // Fetch offers for the specified listing
    const { data: listingData, error: fetchError } = await supabase
      .from("marketplace_listings")
      .select("offers")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(500).json({ success: false, message: fetchError.message });
    }

    if (!listingData) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Find the user's offer if it exists
    const userOffer = (listingData.offers || []).find((offer) => offer.userID === wallet);

    res.json({
      success: true,
      listingID: listingData.id,
      offer: userOffer
        ? { offerAmount: userOffer.amount, date: userOffer.date }
        : null, // Return null if no offer exists
    });
  } catch (error) {
    console.error("Error fetching offers for listing:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/modifyOffer", async (req, res) => {
  const { userToken, listingID, offerAmount } = req.body;

  // Fetch the existing offers
  const { data: listingData, error: fetchError } = await supabase
    .from("marketplace_listings")
    .select("offers")
    .eq("id", listingID)
    .single();

  if (fetchError) {
    return res.status(500).json({ success: false, message: fetchError.message });
  }

  if (!listingData) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  // Update the existing offer
  const updatedOffers = (listingData.offers || []).map((offer) =>
    offer.userID === userToken
      ? { ...offer, amount: offerAmount, date: new Date().toISOString() }
      : offer
  );

  const { error: updateError } = await supabase
    .from("marketplace_listings")
    .update({ offers: updatedOffers })
    .eq("id", listingID);

  if (updateError) {
    return res.status(500).json({ success: false, message: updateError.message });
  }

  res.json({ success: true, message: "Offer modified successfully." });
});

app.post("/cancelOffer", async (req, res) => {
  const { userToken, listingID } = req.body;


  const { data: listingData, error: fetchError } = await supabase
    .from("marketplace_listings")
    .select("offers")
    .eq("id", listingID)
    .single();

  if (fetchError) {
    return res.status(500).json({ success: false, message: fetchError.message });
  }

  if (!listingData) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  // Remove the offer from the offers array
  const updatedOffers = (listingData.offers || []).filter(
    (offer) => offer.userID !== userToken
  );

  const { error: updateError } = await supabase
    .from("marketplace_listings")
    .update({ offers: updatedOffers })
    .eq("id", listingID);

  if (updateError) {
    return res.status(500).json({ success: false, message: updateError.message });
  }

  res.json({ success: true, message: "Offer canceled successfully." });
});

// Create Order Endpoint
app.post("/create-order", async (req, res) => {
  const { listingID, userToken } = req.body;

  const userID = userToken;

  try {
    // Fetch listing details from Supabase
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select(`
        rate_per_cent,
        landDetails:lands(area_cent, ownerName:users_new(name))
      `)
      .eq("id", listingID)
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({ error: "Failed to fetch listing details" });
    }

    if (!data) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Calculate the price
    const { rate_per_cent, landDetails } = data;
    const price = rate_per_cent * landDetails.area_cent;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: 500000, // Amount in paise (INR)
      currency: "INR",
      receipt: `order_rcptid_${Math.floor(Math.random() * 10000)}`,
    });

    const { dataorder, errororder } = await supabase
      .from('orders')
      .insert(
        {
          id: order.id,         // Unique order ID
          user_id: userID,      // ID of the user making the purchase
          listing_id: listingID, // ID of the listing being purchased
          status: 'unpaid'      // Default status (optional, as 'unpaid' is the default)
        }
      );

    if (errororder) {
      res.status(500).json({ error: "Failed to create order id" });
    } else {
      res.json({ order, key: "rzp_test_uTMh2Eea44jDfS" });
    }

    // res.json({ order, key: "rzp_test_uTMh2Eea44jDfS" });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});


// Verify Payment Endpoint
app.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, wallet } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;


  const expectedSignature = crypto
    .createHmac("sha256", "UQhX6AlUNzqvQdjN5H0bo6nv")
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const userID = wallet;

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", razorpay_order_id);

    if (error) {
      return res.status(500).json({ success: false, message: "Failed to update order status: " + error.message });
    }

    const { data: data1, error: error1 } = await supabase
      .from("orders")
      .select("listing_id")
      .eq("id", razorpay_order_id)
      .single();

    if (error1) {
      return res.status(500).json({ success: false, message: "Failed to update order status: " + error1.message });
    }
    const listingID = data1?.listing_id;

    const { data: listingData, error: listingError } = await supabase
      .from("marketplace_listings")
      .select("landid")
      .eq("id", listingID)
      .single();

    if (listingError) {
      return res.status(500).json({ success: false, message: "Failed to update order status: " + listingError });
    }
    const landID = listingData?.landid;

    // New owner history entry
    const newHistory = {
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      // name: decodedToken?.name,
      owner: userID,
    };

    // Fetch existing owner history
    const { data: landData, error: fetchError } = await supabase
      .from('lands')
      .select('ownerhistory')
      .eq('landid', landID)
      .single();

    if (fetchError) {
      console.error('Error fetching owner history:', fetchError.message);
    } else if (!landData) {
      console.log('No land found with the provided landID.');
    } else {
      // Append the new history to the existing array
      const updatedHistory = [...(landData.ownerhistory || []), newHistory];

      // Update the ownerhistory array in the database
      const { data: updateData, error: updateError } = await supabase
        .from('lands')
        .update({ ownerhistory: updatedHistory })
        .eq('landid', landID);

      if (updateError) {
        console.error('Error updating owner history:', updateError.message);
      } else {
        console.log('Owner history updated successfully:', updateData);
      }
    }



    const { datau, erroru } = await supabase
      .from("lands")
      .update({ ownerid: userID })
      .eq("landid", landID);

    if (erroru) {
      return res.status(500).json({ success: false, message: "Failed to buy land: " + error1.message });
    }

    const { data: deleteData, error: deleteError } = await supabase
      .from("marketplace_listings")
      .delete()
      .eq("id", listingID);



    return res.json({ success: true });
  } else {

    return res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
