export interface IAction<Data, Action extends string = string> {
  readonly action: Action;
  readonly payload: Data;
  toString: () => string;
}

export class Action<Data, Action extends string> implements IAction<Data, Action> {
  public readonly action: Action;

  public readonly payload: Data;

  constructor(name: Action, payload: Data) {
    if (!name || !name.trim()) {
      throw Error('Expect to have non-empty action name.');
    }
    this.action = name;
    this.payload = payload;
  }

  public toString = (): string => {
    return this.action;
  };
}
