import React, { Component } from 'react';
import './ShuduMap.scss';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import uniq from 'lodash/uniq';
import { Item, ShuduLevel, ICheckResult } from './interfaces';
import { setInitialValueFns } from './set-initial-value-fns';

interface IState {
  map: Item[][];
  records: Item[][][];
  existNumbersInRow: number[][]; // 每行中的固定数字
  existNumbersInColumn: number[][]; // 每列中的固定数字
  existNumbersInGroup: number[][]; // 每个九宫格中的固定数字
  existTwoNumbersInRow: number[][];
  existTwoNumbersInCol: number[][];
  existTwoNumbersInGroup: number[][];
  selectedLevel: ShuduLevel; // 数独难度等级
}

interface IProps {

}

/**
 * 术语说明:
 * N元值: 一行/列/九宫格中, N个小格都含有且是同样的N个值, 例如当前行中两个小格的值都为 [1, 2], 则[1, 2]为二元值, 其他小格中不能有1或2; 再如 当前列中有三个小格都含有[3, 6, 9], 则[3, 6, 9]是当前列的三元值, 当前列的其他小格中不应该含有3/6/9;
 *
 * 九宫格: 数独的整个面板被分成九个3x3的区域, 每个区域叫做一个九宫格;
 */
export class ShuduMap extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      map: this.getClearMap(),
      records: [],
      existNumbersInColumn: new Array(9).fill(null).map(() => []),
      existNumbersInRow: new Array(9).fill(null).map(() => []),
      existTwoNumbersInRow: new Array(9).fill(null).map(() => []),
      existTwoNumbersInCol: new Array(9).fill(null).map(() => []),
      existTwoNumbersInGroup: new Array(9).fill(null).map(() => []),
      existNumbersInGroup: new Array(9).fill(null).map(() => []),
      selectedLevel: 2,
    };
  }

  getClearMap() {
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
          editable: true,
          group: groupIndex,
          values: [],
        };
      });
    });
    return map;
  }

  resetGame(cb: () => any) {
    this.setState({
      map: this.getClearMap(),
      records: [],
      existNumbersInColumn: new Array(9).fill(null).map(() => []),
      existNumbersInRow: new Array(9).fill(null).map(() => []),
      existTwoNumbersInRow: new Array(9).fill(null).map(() => []),
      existTwoNumbersInCol: new Array(9).fill(null).map(() => []),
      existTwoNumbersInGroup: new Array(9).fill(null).map(() => []),
      existNumbersInGroup: new Array(9).fill(null).map(() => []),
    }, cb);
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

  setInitialValueOfLevel = (level: ShuduLevel) => {
    const { map } = this.state;
    (setInitialValueFns as any)[level](map);
    this.setAsInitialState();
  }

  fillNumbers = () => {
    const { map } = this.state;
    map.forEach((row) => {
      row.forEach((item) => {
        if (item.editable) {
          item.values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
      });
    });
    this.setState({ map });
  }

  /**
   * 当前数组中是否含有两个或以上相同的元素
   */
  hasSameItem = (item: Item, index: number, arr: Item[]): boolean => {
    return (index < arr.length - 1) && isEqual(item, arr[index + 1]);
  }

  /**
   * 获取第 i 行
   * @param i
   */
  getRow(i: number): Item[] {
    const { map } = this.state;
    return map[i];
  }

  /**
   * 获取第 i 列
   * @param i
   */
  getCol(i: number): Item[] {
    const { map } = this.state;
    const result: Item[] = [];
    map.forEach((row) => {
      result.push(row[i]);
    });
    return result;
  }

  /**
   * 获取第i格九宫格
   * @param i
   */
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

  setInitialValue = () => {
    this.resetGame(() => {
      this.setInitialValueOfLevel(this.state.selectedLevel);
    });
  }

  /**
   * 快速初始化数独面板, 填入预设的数字及所有可能的答案
   */
  quickInit = () => {
    this.setInitialValue();
    this.fillNumbers();
  }

  /**
   * 将数独面板重置到上一步的状态
   */
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
   * return: 是否和上一步是相同记录
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

    let wrong = false;
    const {
      map,
      existNumbersInRow,
      existNumbersInColumn,
      existNumbersInGroup,
      existTwoNumbersInRow,
      existTwoNumbersInCol,
      existTwoNumbersInGroup,
    } = this.state;
    for (let i = 0; i < 9; i++) {
      if ([
        uniq(existNumbersInRow[i]).length !== existNumbersInRow[i].length,
        uniq(existNumbersInColumn[i]).length !== existNumbersInColumn[i].length,
        uniq(existNumbersInGroup[i]).length !== existNumbersInGroup[i].length,
      ].some(v => v)) {
        wrong = true;
      }
    }

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

          // 找出每行/每列/每九宫格中的二元值
          const twoNumbersInRow = existTwoNumbersInRow[rowIndex];
          const twoNumbersInCol = existTwoNumbersInCol[colIndex];
          const twoNumbersInGroup = existTwoNumbersInGroup[item.group];
          // 不允许小格中出现二元值
          const twoNumbersForbid = [...twoNumbersInRow, ...twoNumbersInCol, ...twoNumbersInGroup];

          const rowUniqValue = this.getUniqValueOfCollection(this.getRow(rowIndex), item);
          const colUniqValue = this.getUniqValueOfCollection(this.getCol(colIndex), item);
          const groupUniqValue = this.getUniqValueOfCollection(this.getGroup(item.group), item);
          const uniqOne = [rowUniqValue, colUniqValue, groupUniqValue].find(val => val !== undefined);

          // 如果小格中有一个其他格都没有的数, 那么小格的结果就应该是这个数
          if (uniqOne !== undefined) {
            values = [uniqOne];
          }
          if (values.length > 2) {
            values = values.filter(value => {
              return !twoNumbersForbid.includes(value);
            });
          } else if (this.lengthIs2(values)) {
            values = this.getNotIncludeOne(values, twoNumbersInRow);
            if (this.lengthIs2(values)) {
              values = this.getNotIncludeOne(values, twoNumbersInCol);
            }
            if (this.lengthIs2(values)) {
              values = this.getNotIncludeOne(values, twoNumbersInRow);
            }
          }
          if (values.length === 0) {
            wrong = true;
          }
          item.values = values;
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

  /**
   * 获取当前小格含有且行/列/九宫格中其他小格都不含有的数值(结果只可能是一个或没有)
   * @param collection 当前行/列/九宫格
   * @param item 当前小格
   */
  getUniqValueOfCollection(collection: Item[], item: Item) {
    const collectionWithoutItem = collection.filter( it => it !== item);
    return item.values.find(value => {
      return collectionWithoutItem.every((collItem: Item) => {
        return !collItem.values.includes(value);
      });
    });
  }

  lengthIs2 = (values: number[]): values is [number, number] => {
    return values.length === 2;
  }

  /**
   * 当前小格中有两个值, 切其中一个值在属于二元值, 那么当前小格的最终值为另一个值
   * @param values 当前小格中的值
   * @param numbers 当前行/列/九宫格中收集到的二元值
   */
  getNotIncludeOne(values: [number, number], numbers: number[]): number[] {
    const [a, b] = values;
    if (numbers.includes(a) && !numbers.includes(b)) {
      return [b];
    }
    if (numbers.includes(b) && !numbers.includes(a)) {
      return [a];
    }
    return values;
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

      existNumbersInRow[i] = this.nItemsHasNValues(row, 1);
      existTwoNumbersInRow[i] = this.nItemsHasNValues(row, 2);

      existNumbersInColumn[i] = this.nItemsHasNValues(col, 1);
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

    /**
   * 找出当前行/列/九宫格中的N元值
   */
  nItemsHasNValues = (collection: Item[], n: number): number[] => {
    if (n === 1) {
      return collection
        .filter(item => item.values.length === 1)
        .map(item => item.values[0]);
    }
    let items = collection.filter(item => item.values.length === n);
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

  /**
   * 删除map[i][j]中值为value的数字
   */
  removeValue = (i: number, j: number, value: number) => {
    const { map } = this.state;
    const item = map[i][j];
    item.values = item.values.filter(v => v !== value);
    this.setState({ map });
  }

  renderTable() {
    return (
      <table className="shudu-map">
        <tbody>
          {this.state.map.map((arr, i) => (
            <tr key={i}>
              {arr.map((item, j) => (
                <td key={j}>
                  <span className="group-index">{item.group}</span>
                  {this.renderTdBtns(item, i, j)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  renderTdBtns(item: Item, i: number, j: number) {
    return item.editable ? (
      <span className="btns">
        {item.values.map((value, index) => (
          <button
            key={index}
            className="number-btn"
            onClick={ () => this.removeValue(i, j, value) }
          >{value}</button>
        ))}
      </span>
    ) : (
      <span className="is-set">{item.values[0]}</span>
    );
  }

  selectLevel = (e: any) => {
    this.setState({ selectedLevel: e.target.value });
  }

  renderOperations() {
    const options: { name: string; value: ShuduLevel; disabled: boolean; }[] = [
      { name: '入门级', value: 0, disabled: true },
      { name: '初级', value: 1, disabled: true },
      { name: '中级', value: 2, disabled: false },
      { name: '高级', value: 3, disabled: true },
      { name: '骨灰级', value: 4, disabled: false },
    ];

    const { selectedLevel } = this.state;
    return (
      <div className="operations">
        <select value={ selectedLevel } onChange={ this.selectLevel }>
          {options.map((option) => (
            <option
              key={ option.value }
              value={ option.value }
              disabled={ option.disabled }
            >{ option.name }</option>
          ))}
        </select>
        <button className="btn" onClick={ this.setInitialValue }>Set Initial State</button>
        <button className="btn" onClick={ this.fillNumbers }>Fill Numbers</button>
        <button className="btn" onClick={ this.quickInit }>Quick Init</button>
        <button className="btn" onClick={ this.onCheckClick }>Check</button>
        <button className="btn" onClick={ this.goBack }>Back</button>
      </div>
    );
  }

  render() {
    return (
      <>
        {this.renderTable()}
        {this.renderOperations()}
      </>
    );
  }
}
