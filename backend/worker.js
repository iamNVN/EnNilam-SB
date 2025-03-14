import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = "https://sckzsqyesbculskcztlo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNja3pzcXllc2JjdWxza2N6dGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNjcxNzEsImV4cCI6MjA1NDg0MzE3MX0.gWaZLIHp7gLJq7uJlaGHCmrkmstXi5_UCDB4B9NCv7s";

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAuctions() {
    console.log("🔄 Checking expired auctions...");

    // 1️⃣ Fetch expired auctions
    const { data: auctions, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('type', 'auction')
        .eq('status', 'open')
        .lte('auction_end_time', new Date().toISOString());

    if (error) {
        console.error("❌ Error fetching auctions:", error);
        return;
    }

    if (!auctions.length) {
        console.log("✅ No expired auctions found.");
        return;
    }

    for (const auction of auctions) {
        console.log(`🔍 Processing auction ID: ${auction.id}`);

        // 2️⃣ Get all offers
        const offers = auction.offers || [];
        if (offers.length === 0) {
            console.log(`❌ No bids for auction ${auction.id}. Marking as ended with no winner.`);
            await supabase
                .from('marketplace_listings')
                .update({ status: 'closed' })
                .eq('id', auction.id);
            continue;
        }

        // 3️⃣ Find the highest bid
        const highestOffer = offers.reduce((max, offer) => offer.amount > max.amount ? offer : max, offers[0]);

        console.log(`🏆 Highest bid: ${highestOffer.amount} by User ${highestOffer.userID}`);

        // 4️⃣ Update auction with the highest bid & winner
        const { data: deleteData, error: deleteError } = await supabase
            .from("marketplace_listings")
            .delete()
            .eq("id", auction.id);

        const { datau, erroru } = await supabase
            .from("lands")
            .update({ ownerid: highestOffer.userID })
            .eq("landid", auction.landid);

        if (erroru) {
            return res.status(500).json({ success: false, message: "Failed to buy land: " + error1.message });
        }
    
        if (deleteError) {
            console.error(`❌ Error updating auction ${auction.id}:`, updateError);
        } else {
            console.log(`✅ Auction ${auction.id} ended successfully.`);    
        }
    }
}

// ⏳ Run this function every minute
setInterval(checkAuctions, 60 * 1000);


console.log("🚀 Auction worker started, checking every minute...");
