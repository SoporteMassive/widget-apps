import axios from "axios";

type UserAuthenticatedResponse = {
  userId: string;
  user: string;
  userType: string;
};

const getUserLogged = async (): Promise<UserAuthenticatedResponse> => {
  const response = await axios.get<UserAuthenticatedResponse>('/api/vtexid/pub/authenticated/user');
  return response.data;
};

const getTokenId = async (): Promise<string | null> => {
  const userIdStorageKey = 'userId';
  const expirationStorageKey = 'userIdExpiration';

  const storedUserId = localStorage.getItem(userIdStorageKey);
  const storedExpiration = localStorage.getItem(expirationStorageKey);

  if (storedUserId && storedExpiration) {
    const now = new Date();
    const expirationDate = new Date(parseInt(storedExpiration, 10));

    if (now < expirationDate) {
      return storedUserId;
    }
  }

  const user = await getUserLogged();
  const newUserId:string = user.userId;

  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const expirationDate = new Date(new Date().getTime() + expirationTime);

  localStorage.setItem(userIdStorageKey, newUserId);
  localStorage.setItem(expirationStorageKey, expirationDate.getTime().toString());

  return newUserId;
};

export {
  getTokenId
};
