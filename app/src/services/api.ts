import axios from 'axios';

const API_URL = 'https://softwareapu-backend.onrender.com/api/v1/calculations';

export interface FCASRequest {
    vacation_days_base: number;
    holidays_count: number;
    bonus_days_base: number;
    avg_sickness_days: number;
    ivss_pct: number;
    faov_pct: number;
    inces_pct: number;
    pension_apply_to_fcas: boolean;
    pension_law_pct: number;
}

export interface FCASResult {
    fcas_factor: number;
    fcas_percent: number;
}

export const calculateFCAS = async (config: FCASRequest): Promise<FCASResult> => {
    // Note: The backend expects snake_case keys as aligned with this interface
    const response = await axios.post<FCASResult>(`${API_URL}/fcas`, config);
    return response.data;
};
