import instance from "./axiosInstance";


export const getData = async (url: string, params: any) => {
  console.log(url);
  return await instance.get(url, { params });
};


export const postData = async (url: string, params: any, data: any) => {

  return await instance.post(url, data, { params });
};

export const putData = async (url: string, params: any, data: any) => {
  return await instance.put(url, data, { params });
}

export const patchData = async (url: string, params: any, data: any) => {
  return await instance.patch(url, data, { params });
};


export const deleteData = async (url: string, params: any) => {
  return await instance.delete(url, { params });
};


export const postMultipart = async (
  url: string,
  params: any,
  formData: FormData
) => {
  const customHeaders = {
    "Content-Type": "multipart/form-data",
  };

  try {
    const response = await instance.post(url, formData, {
      params,
      headers: customHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending multipart request:", error);
    throw error;
  }
};

export const putMultipart = async (
  url: string,
  params: any,
  formData: FormData
) => {
  const customHeaders = {
    "Content-Type": "multipart/form-data",
  };

  try {
    const response = await instance.put(url, formData, {
      params,
     // headers: customHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending multipart request:", error);
    throw error;
  }
};
