import { useEffect, useState } from "react";
import { Inter } from "next/font/google";

type Restaurant = {
  name: string;
  cuisine: string;
  borough: string;
  address: {
    building: string;
    street: string;
    zipcode: string;
  };
  average_rating: number; // Updated to reflect the average rating
  restaurant_id: string;
};

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [sortBy, setSortBy] = useState("average_rating");
  const [order, setOrder] = useState("desc");
  const [limit, setLimit] = useState(15); // State for number of restaurants to display
  const [cuisines, setCuisines] = useState<string[]>([]); // State for unique cuisines
  const [boroughs, setBoroughs] = useState<string[]>([]); // State for unique boroughs
  const [filterCuisine, setFilterCuisine] = useState(""); // State for selected cuisine filter
  const [filterBorough, setFilterBorough] = useState(""); // State for selected borough filter
  const [loading, setLoading] = useState(false); // State for loading indicator

  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "average_rating", label: "Rating (High to Low)" },
  ];

  const limitOptions = [5, 10, 15, 20, 25]; // Options for number of restaurants to display

  const fetchCuisines = async () => {
    try {
      setLoading(true); // Start loading
      const response = await fetch(`http://localhost:8000/api/cuisines`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCuisines(data); // Set the unique cuisines if data is an array
      } else {
        console.error("Failed to fetch cuisines: expected an array");
        setCuisines([]); // Reset to an empty array in case of error
      }
    } catch (error) {
      console.error("Error fetching cuisines:", error);
      setCuisines([]); // Reset to an empty array in case of error
    } finally {
      setLoading(false); // End loading
    }
  };

  const fetchBoroughs = async () => {
    try {
      setLoading(true); // Start loading
      const response = await fetch(`http://localhost:8000/api/boroughs`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setBoroughs(data); // Set the unique boroughs if data is an array
      } else {
        console.error("Failed to fetch boroughs: expected an array");
        setBoroughs([]); // Reset to an empty array in case of error
      }
    } catch (error) {
      console.error("Error fetching boroughs:", error);
      setBoroughs([]); // Reset to an empty array in case of error
    } finally {
      setLoading(false); // End loading
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true); // Start loading
      const response = await fetch(
        `http://localhost:8000/api/restaurants?sort_by=${sortBy}&order=${order}&limit=${limit}&filter_cuisine=${filterCuisine}&filter_borough=${filterBorough}`
      );
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchCuisines();
    fetchBoroughs();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchRestaurants(); // Fetch restaurants whenever the filter or sorting options change
  }, [sortBy, order, limit, filterCuisine, filterBorough]);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
      style={{
        backgroundImage: 'url(/vultures.jpeg)', // Set the background image
        backgroundSize: 'cover', // Cover the entire background
        backgroundPosition: 'center', // Center the image
        backgroundAttachment: 'fixed', // Keep the background fixed
        color: 'white', // Change text color for better contrast
      }}
    >
      <div className="flex flex-col place-items-center gap-12 bg-black bg-opacity-50 p-6 rounded-lg"> {/* Optional: Add a background to the content for better readability */}
        <h1 className={`mb-3 text-2xl font-semibold`}>Rotem food storage!</h1>

        {/* Sort and Limit Dropdowns */}
        <div className="flex gap-4">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="bg-white text-black border border-gray-300 rounded p-2"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select 
            value={order} 
            onChange={(e) => setOrder(e.target.value)} 
            className="bg-white text-black border border-gray-300 rounded p-2"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))} 
            className="bg-white text-black border border-gray-300 rounded p-2"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option} Restaurants
              </option>
            ))}
          </select>
        </div>

        {/* Filter Options */}
        <div className="flex gap-4">
          <select 
            value={filterCuisine} 
            onChange={(e) => setFilterCuisine(e.target.value)} 
            className="bg-white text-black border border-gray-300 rounded p-2"
          >
            <option value="">Select Cuisine</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
          <select 
            value={filterBorough} 
            onChange={(e) => setFilterBorough(e.target.value)} 
            className="bg-white text-black border border-gray-300 rounded p-2"
          >
            <option value="">Select Borough</option>
            {boroughs.map((borough) => (
              <option key={borough} value={borough}>
                {borough}
              </option>
            ))}
          </select>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="loader"></div> {/* Custom spinner */}
          </div>
        ) : (
          // Display Restaurants in a Table
          <table className="table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Cuisine</th>
                <th className="border border-gray-300 px-4 py-2">Borough</th>
                <th className="border border-gray-300 px-4 py-2">Address</th>
                <th className="border border-gray-300 px-4 py-2">Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{restaurant.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{restaurant.cuisine}</td>
                  <td className="border border-gray-300 px-4 py-2">{restaurant.borough}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {`${restaurant.address.building} ${restaurant.address.street}, ${restaurant.address.zipcode}`}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{restaurant.average_rating.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add CSS for the loader */}
      <style jsx>{`
        .loader {
          border: 8px solid rgba(255, 255, 255, 0.3); /* Light background */
          border-left: 8px solid white; /* White left border */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
