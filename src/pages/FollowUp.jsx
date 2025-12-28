
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import FollowUpCards from "../components/cards/FollowUpCards";
import { useUserProfile } from "../hooks/useUserProfile";

export default function FollowUp() {
  const { user, loading } = useUserProfile();

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    enabled: !!user,
    queryKey: ["followup", user?.FullName],
    queryFn: async () => {
      const res = await axios.get(
        `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote`,
        {
          params: {
            SalesPersonUid: user.FullName,
            SalesStatus: "Cold",
          },
        }
      );
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Loading state
  if (loading || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
 
      {/* Refresh Button */}
      <div className="w-full px-4 pt-6">
        <div className="flex justify-end">
          <button
            onClick={refetch}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="w-full px-4 py-6 grid grid-cols-1 gap-6">
        {data.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No follow-ups found.
          </p>
        )}

        {data.map((item, index) => (
          <FollowUpCards
            key={item.TripId?.toString() || `lead-${index}`}
            data={item}
          />
        ))}
      </div>
    </div>
  );
}
