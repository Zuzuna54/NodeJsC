// axios.js
import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000', // 
    timeout: 5000, // Set a timeout (optional)
    headers: {
        'Content-Type': 'application/json',
        // You can add other headers if needed
    },
});

//Login call to backend
export const login = async (body) => {
    try {
        const response = await instance.post('/awesome/auth/login', body);
        return response;
    } catch (error) {
        console.log(error);
    }
};

//Register call to backend
export const register = async (body) => {

    try {
        const response = await instance.post('/awesome/applicant', body);
        return response;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error so the caller can handle it
    }
};

//Refresh token call to backend
export const refreshToken = async (body) => {
    try {
        const response = await instance.post('/awesome/auth/refresh', body);
        return response;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error so the caller can handle it
    }
}

//Upload file call to backend
export const uploadFile = async (formData, token) => {
    try {
        const response = await instance.post('/awesome/uploads', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}` // Include the bearer token in the Authorization header
            },
        });
        return response;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error so the caller can handle it
    }
}

//Search word call to backend
export const searchWord = async (body, token) => {
    try {
        const response = await instance.post('/awesome/uploads/search', body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the bearer token in the Authorization header
            },
        });
        return response;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error so the caller can handle it
    }
}

//Get uploads history 
export const getUploadedFilesHistory = async (token) => {
    try {
        const response = await instance.get('/awesome/uploads/history', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the bearer token in the Authorization header
            },
        });
        return response;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error so the caller can handle it
    }
}

//Get file names for the user 
export const getFileNames = async (token) => {
    try {
        const response = await instance.get('/awesome/uploads/fileNames', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the bearer token in the Authorization header
            },
        });
        return response;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error so the caller can handle it
    }
}