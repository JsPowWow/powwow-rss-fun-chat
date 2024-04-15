export class UnknownDataFormatError extends Error {
  public static create =
    (message: string) =>
    (data: unknown): UnknownDataFormatError =>
      new UnknownDataFormatError(message, data);

  public data: unknown;

  constructor(message: string, data: unknown) {
    super(message);
    this.data = data;
  }
}
