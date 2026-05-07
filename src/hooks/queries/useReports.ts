import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { queryKeys } from './queryKeys';

export function useStreak() {
  return useQuery({
    queryKey: queryKeys.reports.streak(),
    queryFn: () => reportService.streak(),
  });
}

export function useDailyReport(date?: string) {
  return useQuery({
    queryKey: queryKeys.reports.daily(date),
    queryFn: () => reportService.daily(date),
  });
}

export function useWeeklyReport(week?: string) {
  return useQuery({
    queryKey: queryKeys.reports.weekly(week),
    queryFn: () => reportService.weekly(week),
  });
}

export function useContinueList() {
  return useQuery({
    queryKey: queryKeys.today.continueList(),
    queryFn: () => reportService.continueList(),
  });
}
