import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  conversationService,
  type StartConversationResponse,
  type TurnResponse,
} from '@/services/conversationService';
import { queryKeys } from './queryKeys';
import type { ConversationSettings, SessionReport } from '@/types';

export function useStartConversation() {
  return useMutation<
    StartConversationResponse,
    Error,
    { scenarioId: string; settings?: Partial<ConversationSettings> }
  >({
    mutationFn: ({ scenarioId, settings }) =>
      conversationService.start(scenarioId, settings),
  });
}

export function useSendTurn() {
  return useMutation<
    TurnResponse,
    Error,
    { sessionId: string; userText: string; userAudioUrl?: string }
  >({
    mutationFn: ({ sessionId, userText, userAudioUrl }) =>
      conversationService.turn(sessionId, userText, userAudioUrl),
  });
}

export function useEndConversation() {
  const qc = useQueryClient();
  return useMutation<SessionReport, Error, { sessionId: string }>({
    mutationFn: ({ sessionId }) => conversationService.end(sessionId),
    onSuccess: () => {
      // Streak + daily report likely changed.
      qc.invalidateQueries({ queryKey: queryKeys.reports.streak() });
      qc.invalidateQueries({ queryKey: queryKeys.reports.daily() });
      qc.invalidateQueries({ queryKey: queryKeys.conversations.history() });
    },
  });
}
