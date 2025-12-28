import apiClient from '../ApiClient'

// Function to Fetch all Quoations By single Trip id
export const FetchQuoteByTripID=async(tripId)=>{
 const res=await apiClient.get(`/salesapp/lead-managment/quotations?TripId=${tripId}`);
 return res;
}