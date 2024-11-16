import axiosInstance from ".";

// Generic GET Request
export const fetcher = async <T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> => {
  const response = await axiosInstance.get<T>(url, { params });
  return response.data;
};
export const poster = async <T, U>(url: string, data: U): Promise<T> => {
  console.log("POST Request URL:", url);
  console.log("POST Data:", data);

  const response = await axiosInstance.post<T>(url, data);
  console.log("Response Data:", response.data);
  return response.data;
};

// Other methods (PUT, DELETE, etc.) can be added similarly
