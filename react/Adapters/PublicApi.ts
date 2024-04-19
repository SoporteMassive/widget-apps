import axios, { Method } from "axios";

class PublicApi {
  private API: string;

  constructor() {
    this.API = 'https://massivespace.pro/api/';
  }

  private async callIntegration(path: string, method: Method, data: any = {}, params?: any): Promise<{ success: boolean; message: string; data: any | null }> {
    try {
      const response = await axios({
        method: method,
        url: `${this.API}${path}`,
        data: method === 'GET' ? undefined : data,
        params: method === 'GET' ? data : params,
        timeout: 3 * 60 * 1000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: response.data.message || 'Success',
        data: response.data.data
      };
    } catch (error) {
      let message = 'An unexpected error occurred';
      if (axios.isAxiosError(error) && error.response) {
        message = error.response.data.error.message || message;
      }
      return {
        success: false,
        message: message,
        data: null
      };
    }
  }

  public callGet = async (path: string, params?: any) => this.callIntegration(path, 'GET', params);

  public callPost = async (path: string, data: any) => this.callIntegration(path, 'POST', data);

  public callPut = async (path: string, data: any) => this.callIntegration(path, 'PUT', data);
}

export default PublicApi;
