import { Vector2 } from '../types'

// blank function
export function noop() {}

export function chainFns(...fns: Function[]) {
  return function (this: any) {
    for (let fn of fns) fn.apply(this, arguments)
  }
}


export const def = {
  array: <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value, value]),
  withDefault: <T>(value: T | undefined, defaultIfUndefined: T): T => (value !== void 0 ? value : defaultIfUndefined),
}

export function matchKeysFromObject<T extends object, K extends object>(obj: T, matchingObject: K): Partial<T> {
  const o: Partial<T> = {}
  Object.entries(obj).forEach(
    ([key, value]) => (value !== void 0 || key in matchingObject) && (o[key as keyof T] = value)
  )
  return o
}

export function valueFn(v: Vector2 | (() => Vector2)) {
  return typeof v === 'function' ? v() : v
}
