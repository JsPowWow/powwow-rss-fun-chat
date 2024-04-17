import ansi from 'ansi-escape-sequences';

export const getPathLine = (): string => `${ansi.styles('blue')}~$`;
