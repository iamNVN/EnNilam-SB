
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Filter,  X, LoaderCircle, ArrowRight } from "lucide-react";
import { mockListings } from "@/data/mockListings";
import { format } from "date-fns";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const Marketplace = () => {
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000000000000000000000000]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  const [isLoading, setLoading] = useState(true);
  const [isLoggedin, setLoggedin] = useState(false);

  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const session = localStorage.getItem("wallet");
  const isAuction = location.search === "?tab=auction";

  const filteredListings = listings.filter((listing) => {
    const matchesType = listing.type === (isAuction ? "auction" : "sale");
    const matchesPrice = listing.rate_per_cent * listing.landDetails.area_cent >= priceRange[0] && listing.rate_per_cent * listing.landDetails.area_cent <= priceRange[1];
    const matchesState = !selectedState || listing.landDetails.state === selectedState;
    const matchesCity = !selectedCity || listing.landDetails.city === selectedCity;
    return matchesType && matchesPrice && matchesState && matchesCity;
  });

  useEffect(() => {
    const fetchListings = async () => {
      if (!session) {
        navigate(`/login?redirect=/marketplace`);
        return;
      }
      setLoggedin(true);
      try {
        const response = await fetch("http://localhost:5000/getlistings", {
          method: "POST", // Change to GET
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: session }),
          credentials: "include", // Send cookies if needed
        });

        const data = await response.json();
        console.log(data);
      
        if (!response.ok || !data.success) throw new Error(data.error);


        setListings(data.data); // Update state with listings
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [session, navigate]);


  const clearFilter = (type: 'state' | 'city' | 'price') => {
    switch (type) {
      case 'state':
        setSelectedState("");
        break;
      case 'city':
        setSelectedCity("");
        break;
      case 'price':
        setPriceRange([0, 1000000]);
        break;
    }
  };

  return (
    !isLoggedin ? (
      <div><LoaderCircle className="animate-spin mx-auto" size={50} /></div>
    ) : <div className="min-h-screen bg-dark-200">
      <Sidebar />
      <Header />

      <main className=" pl-64">
        {/* Header */}
        <div className="pt-3 px-4 border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white">
              {isAuction ? "View Auctions" : "View Listings"}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-8 py-6">
          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedState && (
              <span className="bg-dark-100 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                State: {selectedState}
                <X className="w-4 h-4 cursor-pointer" onClick={() => clearFilter('state')} />
              </span>
            )}
            {selectedCity && (
              <span className="bg-dark-100 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                City: {selectedCity}
                <X className="w-4 h-4 cursor-pointer" onClick={() => clearFilter('city')} />
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 100000000000000000000000000000) && (
              <span className="bg-dark-100 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Price: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                <X className="w-4 h-4 cursor-pointer" onClick={() => clearFilter('price')} />
              </span>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg hover:text-white transition-colors ${showFilters
              ? 'bg-neon-purple text-white'
              : 'text-gray-400 bg-dark-100'
              }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-dark-100 rounded-lg p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price Range</label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-4 py-2 bg-dark-200 rounded-lg text-white"
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-4 py-2 bg-dark-200 rounded-lg text-white"
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">State</label>
                  <select
                    className="w-full px-4 py-2 bg-dark-200 rounded-lg text-white"
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    <option value="">All States</option>
                    {Array.from(new Set(mockListings.map(l => l.state))).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">City</label>
                  <select
                    className="w-full px-4 py-2 bg-dark-200 rounded-lg text-white"
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">All Cities</option>
                    {Array.from(new Set(mockListings.map(l => l.city))).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Listings Grid */}
          {isLoading ? (
            <div><LoaderCircle className="animate-spin mx-auto" size={50} /></div>
          ) : <div>
            {filteredListings.length === 0 ?                                 <p>No Listings found.</p>
            :(
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate(`/marketplace/land/${listing.id}`)}
                  className="bg-dark-100 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-800"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-medium px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full">
                        {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">Listed on:&nbsp;
                        {format(new Date(listing.listed_on), "MMM d, yyyy")}
                      </span>
                    </div>

                    {listing.type === "auction" ? <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 ">
                            {listing.landDetails.city}
                          </h3>
                          <p className="text-sm text-gray-400">{listing.landDetails.state}</p>
                        </div>
                        <div className="text-right">
                        <div className="text-xs text-gray-500">
                            Starting Bid
                          </div>
                          <p className="text-2xl font-bold text-neon-purple">
                            ₹{(listing.starting_bid).toLocaleString()}
                          </p>
                         
                        </div>
                      </div>
                    </div> : 
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100">
                            {listing.landDetails.city}
                          </h3>
                          <p className="text-sm text-gray-400">{listing.landDetails.state}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-neon-purple">
                            ₹{(listing.landDetails.area_cent * listing.rate_per_cent).toLocaleString()}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            @ ₹{listing.rate_per_cent.toLocaleString()}/cent
                          </div>
                        </div>
                      </div>
                    </div>}

                    <div className="border-t border-gray-800 pt-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Area:</span>
                        <span className="text-sm font-medium text-gray-200">
                          {listing.landDetails.area_cent} cents ({listing.landDetails.area_sqft} sq.ft)
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end text-neon-purple font-medium text-sm group">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>


              ))}
            </div>
          )}
          </div>}
        </div>
      </main >
    </div >
  );
};

export default Marketplace;
