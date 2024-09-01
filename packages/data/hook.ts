// react hook for data

import { DraftData } from './store';
import { Draft } from './type';
import shallowEqual from 'shallowequal'; // 导入 shallowequal 包

export function useDraftState<T=Draft>(
  data: DraftData, 
  selector: (state: Draft) => T = (s) => s as T, 
  equalityFn: (a: T, b: T) => boolean = shallowEqual // 使用 shallowEqual 作为默认比较函数
): T {
  return data.store(
    selector,
    equalityFn
  );
}
