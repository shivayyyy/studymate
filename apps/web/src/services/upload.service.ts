import { api } from '../lib/axios';

export interface UploadResponse {
    url: string;
    publicId: string;
    format: string;
    originalName: string;
}

export const UploadService = {
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post<{ success: boolean; data: UploadResponse }>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },
};
