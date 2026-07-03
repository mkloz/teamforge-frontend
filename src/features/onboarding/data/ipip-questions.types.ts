export type Dimension = "O" | "C" | "E" | "A" | "N";

export interface IpipQuestion {
  id: number;
  text: string;
  dimension: Dimension;
  /** true = higher response -> higher dimension score; false = reversed */
  keyed: "+" | "-";
}
