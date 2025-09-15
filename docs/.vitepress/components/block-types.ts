// block-types.ts
export const Category = {
  red: "bg-rose-800",
  green: "bg-emerald-800",
  blue: "bg-blue-800",
  yellow: "bg-yellow-800",
  purple: "bg-purple-800",
  gray: "bg-gray-800",
  orange: "bg-orange-800",
};
export type Category = keyof typeof Category;

export type ByteSection = {
  name: string;
  category: Category;
  byteSize: number;
  optional?: boolean;
};