import { Item } from './interfaces';

export const setInitialValueFns =  {
  2: (map: Item[][]) => {
    map[0][0].values = [3];
    map[0][3].values = [6];
    map[0][6].values = [5];
    map[0][8].values = [4];

    map[1][1].values = [4];
    map[1][3].values = [7];
    map[1][4].values = [1];
    map[1][7].values = [6];

    map[2][0].values = [5];

    map[3][4].values = [5];
    map[3][7].values = [8];
    map[3][8].values = [9];

    map[4][1].values = [8];
    map[4][3].values = [1];
    map[4][4].values = [3];
    map[4][5].values = [6];
    map[4][7].values = [4];

    map[5][0].values = [6];
    map[5][1].values = [2];
    map[5][4].values = [7];

    map[6][8].values = [5];

    map[7][1].values = [5];
    map[7][4].values = [6];
    map[7][5].values = [9];
    map[7][7].values = [7];

    map[8][0].values = [4];
    map[8][2].values = [8];
    map[8][5].values = [1];
    map[8][8].values = [6];
  },
  // 骨灰
  4: (map: Item[][]) => {
    map[0][4].values = [2];
    map[0][6].values = [9];

    map[1][1].values = [3];
    map[1][5].values = [4];
    map[1][7].values = [7];

    map[2][0].values = [2];
    map[2][3].values = [1];
    map[2][4].values = [8];

    map[3][1].values = [9];
    map[3][6].values = [1];

    map[4][0].values = [5];
    map[4][2].values = [1];
    map[4][6].values = [2];
    map[4][8].values = [4];

    map[5][2].values = [4];
    map[5][7].values = [8];

    map[6][4].values = [1];
    map[6][5].values = [9];
    map[6][8].values = [7];

    map[7][2].values = [8];
    map[7][3].values = [5];
    map[7][7].values = [4];

    map[8][2].values = [7];
    map[8][4].values = [4];
  },
};
