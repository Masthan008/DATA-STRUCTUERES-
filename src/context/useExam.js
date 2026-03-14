import { useContext } from 'react';
import { ExamContext } from './ExamContext';

export const useExam = () => useContext(ExamContext);
