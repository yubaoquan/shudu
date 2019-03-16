import React, { Component } from 'react';
import './ShuduMap.scss';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

interface Item {
  value: any;
  values: number[];
  editable?: boolean; // 是否固定, 不可修改
  group: number; // 所属九宫格
}

interface ICheckResult {
  wrong?: boolean;
  same?: boolean;
}

interface IState {
  map: Item[][];
  records: Item[][][];
  existNumbersInRow: number[][]; // 每行中的固定数字
  existNumbersInColumn: number[][]; // 每列中的固定数字
  existNumbersInGroup: number[][]; // 每个九宫格中的固定数字
  existTwoNumbersInRow: number[][];
  existTwoNumbersInCol: number[][];
  existTwoNumbersInGroup: number[][];
}

interface IProps {

}

export class ShuduMap extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    const map = new Array(9).fill(null).map(item => new Array(9).fill(null));
    map.forEach((arr, i) => {
      arr.forEach((item, j) => {
        let groupIndex;
        if (i <=2) {
          if (j <=2) {
            groupIndex = 0;
          } else if (j <= 5) {
            groupIndex = 1;
          } else {
            groupIndex = 2;
          }
        } else if (i <= 5) {
          if (j <=2) {
            groupIndex = 3;
          } else if (j <= 5) {
            groupIndex = 4;
          } else {
            groupIndex = 5;
          }
        } else {
          if (j <=2) {
            groupIndex = 6;
          } else if (j <= 5) {
            groupIndex = 7;
          } else {
            groupIndex = 8;
          }
        }

        arr[j] = {
          value: '',
          editable: true,
          group: groupIndex,
          values: [],
        };
      });
    });
    const existNumbersInGroup = [];
    for (let i = 0; i < 9; i++) {
      existNumbersInGroup[i] = [];
    }
    this.state = {
      map,
      records: [],
      existNumbersInColumn: new Array(9).fill(null).map(() => []),
      existNumbersInRow: new Array(9).fill(null).map(() => []),
      existTwoNumbersInRow: new Array(9).fill(null).map(() => []),
      existTwoNumbersInCol: new Array(9).fill(null).map(() => []),
      existTwoNumbersInGroup: new Array(9).fill(null).map(() => []),
      existNumbersInGroup,
    };
  }

  onNumberChange = (i: number, j: number, e: any) => {
    const map = this.state.map;
    const item = map[i][j];
    item.value = e.target.value;
    item.values = item.value.split(',').map((n: string) => +n);
    this.setState({ map });
    this.recordCurrentMap();
  }

  setAsInitialState = () => {
    const map = this.state.map;
    map.forEach((arr, i) => {
      arr.forEach((item, j) => {
        item.values = item.values || [];
        item.editable = item.values.length !== 1;
      });
    });
    this.setState({ map });
  }

  setInitialValue = () => {
    const { map } = this.state;
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
    this.setAsInitialState();
  }

  fillNumbers = () => {
    const { map } = this.state;
    map.forEach((row) => {
      row.forEach((item) => {
        if (item.editable) {
          item.values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          item.value = item.values.join(',');
        }
      });
    });
    this.setState({ map });
  }

  /**
   * 该元素含有n个值, 且数组中含有n个和该元素相同的元素
   */
  nItemsHasNValues = (group: Item[], n: number): number[] => {
    let items = group.filter(item => item.values.length === n);
    if (items.length >= n) {
      items = items
        .sort((a: Item, b: Item) => {
          return a.values.join('') > b.values.join('') ? 1 : -1;
        })
        .filter(this.hasSameItem);
      items = uniqWith(items, isEqual);
      return items.reduce((result: number[], item: Item) => {
        return [...result, ...item.values];
      }, []);
    }
    return [];
  }

  hasSameItem = (item: Item, index: number, arr: Item[]): boolean => {
    return (index < arr.length - 1) && isEqual(item, arr[index + 1]);
  }

  getRow(i: number): Item[] {
    const { map } = this.state;
    return map[i];
  }

  getCol(i: number): Item[] {
    const { map } = this.state;
    const result: Item[] = [];
    map.forEach((row) => {
      result.push(row[i]);
    });
    return result;
  }

  getGroup(i: number): Item[] {
    const { map } = this.state;
    const rowStart: number = Math.floor(i / 3) * 3;
    const colStart: number = i % 3 * 3;
    return [
      map[rowStart][colStart], map[rowStart][colStart + 1], map[rowStart][colStart + 2],
      map[rowStart + 1][colStart], map[rowStart + 1][colStart + 1], map[rowStart + 1][colStart + 2],
      map[rowStart + 2][colStart], map[rowStart + 2][colStart + 1], map[rowStart + 2][colStart + 2],
    ];

  }

  quickInit = () => {
    this.setInitialValue();
    this.fillNumbers();
  }

  goBack = () => {
    const { records } = this.state;
    records.shift();
    if (!records.length) {
      alert('no records');
      return;
    }
    this.applyRecord(records[0]);
  }

  /**
   * 记录当前所有填写的值
   * 如果当前填写的值和上一次一样, 则不进行记录
   * return: 是否是相同记录
  */
  recordCurrentMap = (): boolean => {
    const { map, records } = this.state;
    const record = cloneDeep(map);
    if (records.length && isEqual(record, records[0])) {
      console.info('Same record');
      return true;
    }
    records.unshift(record);
    this.setState({ records });
    return false;
  }

  /**
   * 重置到某个状态
   */
  applyRecord = (recordMap: Item[][]) => {
    const { map } = this.state;
    map.forEach((row, rowIndex) => {
      row.forEach((item, colIndex) => {
        const record = recordMap[rowIndex][colIndex];
        item.value = record.value;
        item.values = record.values;
      });
    });
    this.setState({ map });
  }

  /**
   * 计算下一步应该消掉那些格子的数字, 并检查处理结果
   * wrong: 消掉数字导致结果出错
   * same: 本轮没有发现可以消掉的数字
   */
  check = (): ICheckResult => {
    const checkResult: ICheckResult = {};
    this.findRowColExistNumbers();
    this.findGroupExistNumbers();
    const {
      map,
      existNumbersInRow,
      existNumbersInColumn,
      existNumbersInGroup,
      existTwoNumbersInRow,
      existTwoNumbersInCol,
      existTwoNumbersInGroup,
    } = this.state;

    let wrong = false;
    map.forEach((row, rowIndex) => {
      row.forEach((item, colIndex) => {
        if (item.editable && item.values.length > 1) {
          // 先排除掉每行/每列/每九宫格中已经存在的数字
          const rowNumbers = existNumbersInRow[rowIndex];
          const colNumbers = existNumbersInColumn[colIndex];
          const groupNumbers = existNumbersInGroup[item.group];
          let values = item.values.filter((value) => {
            return [
              !rowNumbers.includes(value),
              !colNumbers.includes(value),
              !groupNumbers.includes(value),
            ].every(v => v);
          });

          // 找出每行/每列/每九宫格中, 两个位置中含有两对相同的值, 如某行内有两个位置分别为 [1, 2], [1, 2] 则该行中其他位置的值不可能是1或2
          const twoNumbersInRow = existTwoNumbersInRow[rowIndex];
          const twoNumbersInCol = existTwoNumbersInCol[colIndex];
          const twoNumbersInGroup = existTwoNumbersInGroup[item.group];
          // 不允许元素中出现这种数字
          const twoNumbersForbid = [...twoNumbersInRow, ...twoNumbersInCol, ...twoNumbersInGroup];

          if (values.length > 2) {
            values = values.filter(value => {
              return !twoNumbersForbid.includes(value);
            });
          }
          if (values.length === 0) {
            wrong = true;
          }
          item.values = values;
          item.value = values.join(',');
        }
      });
    });
    if (wrong) {
      alert('wrong');
      checkResult.wrong = true;
    } else {
      this.setState({ map });
      checkResult.same = this.recordCurrentMap();
    }
    return checkResult;
  }

  onCheckClick = () => {
    let checkResult = this.check();
    while(!checkResult.wrong && !checkResult.same) {
      checkResult = this.check();
    }
  }

  /**
   * 查询每行/每列中作为已知条件的数字
   */
  findRowColExistNumbers = () => {
    const {
      map,
      existNumbersInRow,
      existNumbersInColumn,
      existTwoNumbersInRow,
      existTwoNumbersInCol,
    } = this.state;
    existNumbersInColumn.forEach((col, index, arr) => arr[index] = []);
    existTwoNumbersInCol.forEach((col, index, arr) => arr[index] = []);

    for (let i = 0; i < 9; i++) {
      const row = this.getRow(i);
      const col = this.getCol(i);

      const numbersRow = row
        .filter((item: Item) => item.values.length === 1)
        .map((item: Item) => item.values[0]);
      existNumbersInRow[i] = numbersRow;
      existTwoNumbersInRow[i] = this.nItemsHasNValues(row, 2);

      const numbersCol = col
        .filter((item: Item) => item.values.length === 1)
        .map((item: Item) => item.values[0]);
      existNumbersInColumn[i] = numbersCol;
      existTwoNumbersInCol[i] = this.nItemsHasNValues(col, 2);
    }

    this.setState({
      map,
      existNumbersInRow,
      existNumbersInColumn,
      existTwoNumbersInRow,
      existTwoNumbersInCol,
    });
  }

    /**
   * 查询每个九宫格中作为已知条件的数字
   */
  findGroupExistNumbers = () => {
    const { map, existNumbersInGroup, existTwoNumbersInGroup } = this.state;
    existNumbersInGroup.forEach(group => group.length = 0);

    map.forEach((row) => {
      row.forEach((item) => {
        if (item.values.length === 1) {
          existNumbersInGroup[item.group].push(item.values[0]);
        }
      });
    });
    for (let i = 0; i < 9; i++) {
      const group = this.getGroup(i);
      existTwoNumbersInGroup[i] = this.nItemsHasNValues(group, 2);
    }
    this.setState({ map, existNumbersInGroup });
  }

  removeValue = (i: number, j: number, value: number) => {
    const { map } = this.state;
    const item = map[i][j];
    item.values = item.values.filter(v => v !== value);
    this.setState({ map });
  }

  renderTable() {
    const map = this.state.map;
    return (
      <table className="shudu-map">
        <tbody>
          {map.map((arr, i) => {
            return (
              <tr key={i}>
                {arr.map((item, j) => {
                  let ele: any;
                  if (!item.editable) {
                    ele = (<span className="is-set">{item.values[0]}</span>)
                  } else {
                    ele = (
                      <span className="btns">
                        {item.values.map((value, index) => {
                          return (
                            <button
                              key={index}
                              className="number-btn"
                              onClick={ () => this.removeValue(i, j, value) }
                            >{value}</button>
                          )
                        })}
                      </span>
                    );
                  }
                  return (
                    <td key={j}>
                      <span className="group-index">{item.group}</span>
                      {ele}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  render() {
    const table = this.renderTable();
    return (
      <>
        {table}
        <div className="operations">
          <button onClick={ this.setInitialValue }>Set Initial State</button>
          <button onClick={ this.fillNumbers }>Fill Numbers</button>
          <button onClick={ this.quickInit }>Quick Init</button>
          <button onClick={ this.onCheckClick }>Check</button>
          <button onClick={ this.goBack }>Back</button>
        </div>
      </>
    );
  }
}
