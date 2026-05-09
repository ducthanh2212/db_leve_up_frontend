import api from './axios';

export const getOccupations = async (lang = 'vi') => {
  const res = await api.get(`/lookups/occupations?lang=${encodeURIComponent(lang)}`);
  return res.data;
};
