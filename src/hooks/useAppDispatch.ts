// src/hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store'; // Adjust the import path as necessary

export const useAppDispatch = () => useDispatch<AppDispatch>();