export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export interface ScaleRatio {
  scaleX: number;
  scaleY: number;
}
