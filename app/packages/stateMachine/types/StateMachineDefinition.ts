import type { Nullable } from '@/utils';

export type IStateMachineDefinition<State, Action = State> = {
  initialState: State;
  getNextState: (currentState: State, next: Action) => Nullable<State>;
};
