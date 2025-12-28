
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
