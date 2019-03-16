export interface Item {
  values: number[];
  editable?: boolean; // 是否固定, 不可修改
  group: number; // 所属九宫格
}

export interface ICheckResult {
  wrong?: boolean;
  same?: boolean;
}

// 数独难度等级 入门/初级/中级/高级/骨灰
export type ShuduLevel = 0 | 1 | 2 | 3 | 4;
