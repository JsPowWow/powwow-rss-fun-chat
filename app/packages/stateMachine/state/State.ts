export interface IState<Data, State extends string = string> {
  readonly state: State;
  readonly data: Data;
  toString: () => string;
}

export const ANY_STATES = ['*', 'any'];
export type AnyState = (typeof ANY_STATES)[number];

export class State<Data, Name extends string> implements IState<Data, Name> {
  public readonly state: Name;

  public readonly data: Data;

  constructor(name: Name, data: Data) {
    if (!name || !name.trim()) {
      throw Error('Expect to have non-empty state name.');
    }
    this.state = name;
    this.data = data;
  }

  public toString = (): string => {
    return this.state;
  };
}
