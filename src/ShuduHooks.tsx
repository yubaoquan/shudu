import React, { useState, useEffect } from 'react';
import './ShuduMap.scss';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import uniq from 'lodash/uniq';
import { Item, ShuduLevel, ICheckResult } from './interfaces';
import { setInitialValueFns } from './set-initial-value-fns';

interface IState {
  shudu: Item[][];
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

type IArrayAndSetter = [number[][], any];
/**
 * 术语说明:
 * N元值: 一行/列/九宫格中, N个小格都含有且是同样的N个值, 例如当前行中两个小格的值都为 [1, 2], 则[1, 2]为二元值, 其他小格中不能有1或2; 再如 当前列中有三个小格都含有[3, 6, 9], 则[3, 6, 9]是当前列的三元值, 当前列的其他小格中不应该含有3/6/9;
 *
 * 九宫格: 数独的整个面板被分成九个3x3的区域, 每个区域叫做一个九宫格;
 */

export function ShuduMap() {
  let [shudu, setShudu]: [Item[][], any] = useState(getClearMap());
  const [records, setResords]: [any, any] = useState([]);
  const [existNumbersInColumn, setExistNumbersInColumn]: IArrayAndSetter = useState(getEmptyNumberArr());
  const [existNumbersInRow, setExistNumbersInRow]: IArrayAndSetter = useState(getEmptyNumberArr());
  const [existTwoNumbersInRow, setExistTwoNumbersInRow]: IArrayAndSetter = useState(getEmptyNumberArr());
  const [existTwoNumbersInCol, setExistTwoNumbersInCol]: IArrayAndSetter = useState(getEmptyNumberArr());
  const [existTwoNumbersInGroup, setExistTwoNumbersInGroup]: IArrayAndSetter = useState(getEmptyNumberArr());
  const [existNumbersInGroup, setExistNumbersInGroup]: IArrayAndSetter = useState(getEmptyNumberArr());
  const [selectedLevel, setSelectedLevel]: [ShuduLevel, any] = useState(2 as ShuduLevel);

  function getEmptyNumberArr() {
    return new Array(9).fill(null).map(() => []);
  }

  function resetGame() {
    shudu = getClearMap();
    setShudu(shudu);
    setExistNumbersInColumn([]);
    setExistNumbersInColumn(new Array(9).fill(null).map(() => []));
    setExistNumbersInRow(new Array(9).fill(null).map(() => []));
    setExistTwoNumbersInRow(new Array(9).fill(null).map(() => []));
    setExistTwoNumbersInCol(new Array(9).fill(null).map(() => []));
    setExistTwoNumbersInGroup(new Array(9).fill(null).map(() => []));
    setExistNumbersInGroup(new Array(9).fill(null).map(() => []));
  }

  function getClearMap() {
    const shudu = new Array(9).fill(null).map(item => new Array(9).fill(null));
    shudu.forEach((arr, i) => {
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
    return shudu;
  }

  function setAsInitialState() {
    shudu.forEach((arr, i) => {
      arr.forEach((item, j) => {
        item.values = item.values || [];
        item.editable = item.values.length !== 1;
      });
    });
    setShudu([...shudu]);
  }

  function setInitialValueOfLevel(level: ShuduLevel) {
    (setInitialValueFns as any)[level](shudu);
    setAsInitialState();
  }

  function fillNumbers() {
    shudu.forEach((row) => {
      row.forEach((item) => {
        if (item.editable) {
          item.values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
      });
    });
    setShudu([...shudu]);
  }

  /**
   * 当前数组中是否含有两个或以上相同的元素
   */
  function hasSameItem(item: Item, index: number, arr: Item[]): boolean {
    return (index < arr.length - 1) && isEqual(item, arr[index + 1]);
  }

  /**
   * 获取第 i 行
   * @param i
   */
  function getRow(i: number): Item[] {
    return shudu[i];
  }

  /**
   * 获取第 i 列
   * @param i
   */
  function getCol(i: number): Item[] {
    const result: Item[] = [];
    shudu.forEach((row) => {
      result.push(row[i]);
    });
    return result;
  }

  /**
   * 获取第i格九宫格
   * @param i
   */
  function getGroup(i: number): Item[] {
    const rowStart: number = Math.floor(i / 3) * 3;
    const colStart: number = i % 3 * 3;
    return [
      shudu[rowStart][colStart], shudu[rowStart][colStart + 1], shudu[rowStart][colStart + 2],
      shudu[rowStart + 1][colStart], shudu[rowStart + 1][colStart + 1], shudu[rowStart + 1][colStart + 2],
      shudu[rowStart + 2][colStart], shudu[rowStart + 2][colStart + 1], shudu[rowStart + 2][colStart + 2],
    ];
  }

  function onSetInitialValueClick() {
    setInitialValue();
  }


  function setInitialValue() {
    resetGame();
    setInitialValueOfLevel(selectedLevel);
  }

  /**
   * 快速初始化数独面板, 填入预设的数字及所有可能的答案
   */
  function quickInit() {
    setInitialValue();
    fillNumbers();
  }

  /**
   * 将数独面板重置到上一步的状态
   */
  function goBack() {
    records.shift();
    if (!records.length) {
      alert('no records');
      return;
    }
    applyRecord(records[0]);
  }

  /**
   * 记录当前所有填写的值
   * 如果当前填写的值和上一次一样, 则不进行记录
   * return: 是否和上一步是相同记录
  */
  function recordCurrentMap(): boolean {
    const record = cloneDeep(shudu);
    if (records.length && isEqual(record, records[0])) {
      console.info('Same record');
      return true;
    }
    records.unshift(record);
    setResords([...records]);
    return false;
  }

  /**
   * 重置到某个状态
   */
  function applyRecord(recordMap: Item[][]) {
    shudu.forEach((row, rowIndex) => {
      row.forEach((item, colIndex) => {
        const record = recordMap[rowIndex][colIndex];
        item.values = record.values;
      });
    });
    setShudu([...shudu]);
  }

  /**
   * 计算下一步应该消掉那些格子的数字, 并检查处理结果
   * wrong: 消掉数字导致结果出错
   * same: 本轮没有发现可以消掉的数字
   */
  function check(): ICheckResult {
    const checkResult: ICheckResult = {};
    findRowColExistNumbers();
    findGroupExistNumbers();

    let wrong = false;
    for (let i = 0; i < 9; i++) {
      if ([
        uniq(existNumbersInRow[i]).length !== existNumbersInRow[i].length,
        uniq(existNumbersInColumn[i]).length !== existNumbersInColumn[i].length,
        uniq(existNumbersInGroup[i]).length !== existNumbersInGroup[i].length,
      ].some(v => v)) {
        wrong = true;
      }
    }

    shudu.forEach((row, rowIndex) => {
      row.forEach((item: Item, colIndex) => {
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

          const rowUniqValue = getUniqValueOfCollection(getRow(rowIndex), item);
          const colUniqValue = getUniqValueOfCollection(getCol(colIndex), item);
          const groupUniqValue = getUniqValueOfCollection(getGroup(item.group), item);
          const uniqOne = [rowUniqValue, colUniqValue, groupUniqValue].find(val => val !== undefined);

          // 如果小格中有一个其他格都没有的数, 那么小格的结果就应该是这个数
          if (uniqOne !== undefined) {
            values = [uniqOne];
          }
          if (values.length > 2) {
            values = values.filter(value => {
              return !twoNumbersForbid.includes(value);
            });
          } else if (lengthIs2(values)) {
            values = getNotIncludeOne(values, twoNumbersInRow);
            if (lengthIs2(values)) {
              values = getNotIncludeOne(values, twoNumbersInCol);
            }
            if (lengthIs2(values)) {
              values = getNotIncludeOne(values, twoNumbersInRow);
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
      setShudu([...shudu]);
      checkResult.same = recordCurrentMap();
    }
    return checkResult;
  }

  /**
   * 获取当前小格含有且行/列/九宫格中其他小格都不含有的数值(结果只可能是一个或没有)
   * @param collection 当前行/列/九宫格
   * @param item 当前小格
   */
  function getUniqValueOfCollection(collection: Item[], item: Item) {
    const collectionWithoutItem = collection.filter( it => it !== item);
    return item.values.find(value => {
      return collectionWithoutItem.every((collItem: Item) => {
        return !collItem.values.includes(value);
      });
    });
  }

  function lengthIs2(values: number[]): values is [number, number] {
    return values.length === 2;
  }

  /**
   * 当前小格中有两个值, 切其中一个值在属于二元值, 那么当前小格的最终值为另一个值
   * @param values 当前小格中的值
   * @param numbers 当前行/列/九宫格中收集到的二元值
   */
  function getNotIncludeOne(values: [number, number], numbers: number[]): number[] {
    const [a, b] = values;
    if (numbers.includes(a) && !numbers.includes(b)) {
      return [b];
    }
    if (numbers.includes(b) && !numbers.includes(a)) {
      return [a];
    }
    return values;
  }

  function onCheckClick() {
    let checkResult = check();
    while(!checkResult.wrong && !checkResult.same) {
      checkResult = check();
    }
  }


  /**
   * 查询每行/每列中作为已知条件的数字
   */
  function findRowColExistNumbers() {
    existNumbersInColumn.forEach((col, index, arr) => arr[index] = []);
    existTwoNumbersInCol.forEach((col, index, arr) => arr[index] = []);

    for (let i = 0; i < 9; i++) {
      const row = getRow(i);
      const col = getCol(i);

      existNumbersInRow[i] = nItemsHasNValues(row, 1);
      existTwoNumbersInRow[i] = nItemsHasNValues(row, 2);

      existNumbersInColumn[i] = nItemsHasNValues(col, 1);
      existTwoNumbersInCol[i] = nItemsHasNValues(col, 2);
    }

    setShudu([...shudu]);
    setExistNumbersInRow(existNumbersInRow);
    setExistNumbersInColumn(existNumbersInColumn);
    setExistTwoNumbersInRow(existTwoNumbersInRow);
    setExistTwoNumbersInCol(existTwoNumbersInCol);
  }

  /**
   * 查询每个九宫格中作为已知条件的数字
   */
  function findGroupExistNumbers() {
    existNumbersInGroup.forEach(group => group.length = 0);

    shudu.forEach((row) => {
      row.forEach((item) => {
        if (item.values.length === 1) {
          existNumbersInGroup[item.group].push(item.values[0]);
        }
      });
    });
    for (let i = 0; i < 9; i++) {
      const group = getGroup(i);
      existTwoNumbersInGroup[i] = nItemsHasNValues(group, 2);
    }
    setShudu([...shudu]);
    setExistNumbersInGroup(existNumbersInGroup);
  }

    /**
   * 找出当前行/列/九宫格中的N元值
   */
  function nItemsHasNValues(collection: Item[], n: number): number[] {
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
        .filter(hasSameItem);
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
  function removeValue(i: number, j: number, value: number) {
    const item = shudu[i][j];
    item.values = item.values.filter(v => v !== value);
    setShudu([...shudu]);
  }


  function renderTable() {
    return (
      <table className="shudu-map">
        <tbody>
          {shudu.map((arr, i) => (
            <tr key={i}>
              {arr.map((item, j) => (
                <td key={j}>
                  <span className="group-index">{item.group}</span>
                  {renderTdBtns(item, i, j)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderTdBtns(item: Item, i: number, j: number) {
    return item.editable ? (
      <span className="btns">
        {item.values.map((value, index) => (
          <button
            key={index}
            className="number-btn"
            onClick={ () => removeValue(i, j, value) }
          >{value}</button>
        ))}
      </span>
    ) : (
      <span className="is-set">{item.values[0]}</span>
    );
  }

  function selectLevel(e: any) {
    setSelectedLevel(e.target.value);
  }

  function renderOperations() {
    const options: { name: string; value: ShuduLevel; disabled: boolean; }[] = [
      { name: '入门级', value: 0, disabled: true },
      { name: '初级', value: 1, disabled: true },
      { name: '中级', value: 2, disabled: false },
      { name: '高级', value: 3, disabled: true },
      { name: '骨灰级', value: 4, disabled: false },
    ];

    return (
      <div className="operations">
        <select value={ selectedLevel } onChange={ selectLevel }>
          {options.map((option) => (
            <option
              key={ option.value }
              value={ option.value }
              disabled={ option.disabled }
            >{ option.name }</option>
          ))}
        </select>
        <button className="btn" onClick={ onSetInitialValueClick }>Set Initial State</button>
        <button className="btn" onClick={ fillNumbers }>Fill Numbers</button>
        <button className="btn" onClick={ quickInit }>Quick Init</button>
        <button className="btn" onClick={ onCheckClick }>Check</button>
        <button className="btn" onClick={ goBack }>Back</button>
      </div>
    );
  }

  return (
    <>
      {renderTable()}
      {renderOperations()}
    </>
  );

}


