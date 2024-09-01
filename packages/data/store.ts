// use zustand as a store, create a pure data class with date methods
import { create, Mutate, StoreApi, UseBoundStore } from "zustand";
import { Draft, DraftElement } from "./type";
import { Immer } from "immer";

const immer = new Immer({
  autoFreeze: false,
});

export class DraftData {
  store: UseBoundStore<Mutate<StoreApi<Draft>, []>>;

  constructor(data?: Draft) {
    this.store = create<Draft>(
      () =>
        data ?? {
          elements: {},
          timeline: [],
        }
    );
  }

  update(fn: (state: Draft) => Draft | void) {
    return this.store.setState((s) => immer.produce(s, fn));
  }

  addElement(element: DraftElement) {
    return this.update((s) => {
      s.elements[element.id] = element;
      s.timeline.push(element.id);
    });
  }

  removeElement(id: string) {
    return this.update((s) => {
      delete s.elements[id];
      s.timeline = s.timeline.filter((id) => id !== id);
    });
  }

  updateElement(id: string, data: Partial<DraftElement>) {
    return this.update((s) => {
      s.elements[id] = {
        ...s.elements[id],
        ...data,
        id,
      } as DraftElement;
    });
  }
}
