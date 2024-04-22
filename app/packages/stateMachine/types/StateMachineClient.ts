import type { IEventEmitter } from '@powwow-js/emitter';

import type { StateMachineEvent, StateMachineEventListener } from './StateMachine.ts';
import type { AnyState, IState } from '../state/State.ts';

export const enum StateMachineClientEvents {
  stateEnter = 'stateEnter',
  stateLeave = 'stateLeave',
  stateTransition = 'stateTransition',
  stateChange = 'stateChange',
}

export type StateMachineClientEventsMap<State, Action> = {
  [Type in keyof typeof StateMachineClientEvents]: StateMachineEvent<Type, State, Action>;
};

export type Unsubscribe = () => void;

export type TransitionState<Data, State> = (State extends IState<Data> ? State['state'] : State) | AnyState;

export interface IStateMachineClient<State, Action = State>
  extends IEventEmitter<StateMachineClientEventsMap<State, Action>> {
  readonly state: State;
  onStateEnter<Data>(
    state: TransitionState<Data, State>,
    callBack: StateMachineEventListener<'stateEnter', State, Action>,
  ): Unsubscribe;
  onStateLeave<Data>(
    state: State extends IState<Data> ? State['state'] : State,
    callBack: StateMachineEventListener<'stateLeave', State, Action>,
  ): Unsubscribe;
  onStateTransition<Data>(
    from: TransitionState<Data, State>,
    to: TransitionState<Data, State>,
    callBack: StateMachineEventListener<'stateTransition', State, Action>,
  ): Unsubscribe;
  onStateChange(callBack: StateMachineEventListener<'stateChange', State, Action>): Unsubscribe;
}
