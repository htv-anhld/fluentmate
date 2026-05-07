import { useQuery } from '@tanstack/react-query';
import { scenarioService } from '@/services/scenarioService';
import { queryKeys } from './queryKeys';
import type { CEFRLevel, ScenarioCategory } from '@/types';

export function useScenarios(filter?: {
  category?: ScenarioCategory;
  level?: CEFRLevel;
}) {
  return useQuery({
    queryKey: queryKeys.scenarios.list(filter),
    queryFn: () => scenarioService.list(filter),
    select: (res) => res.data,
  });
}

export function useScenario(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scenarios.byId(id ?? ''),
    queryFn: () => scenarioService.getById(id!),
    enabled: !!id,
  });
}

export function useRecommendedScenario(level?: CEFRLevel) {
  return useQuery({
    queryKey: queryKeys.scenarios.recommended(level),
    queryFn: () => scenarioService.recommended(level),
  });
}
