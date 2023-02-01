import { bool, toFluent } from 'to-fluent'

export class MutationObserverSettings implements MutationObserverInit {
  attributeFilter?: string[]
  attributeOldValue = bool
  attributes = bool
  characterData = bool
  characterDataOldValue = bool
  childList = bool
  subtree = bool
  /** Fire the observer callback initially with no mutations. */
  initial = bool
}

export class ResizeObserverSettings implements ResizeObserverOptions {
  box?: ResizeObserverBoxOptions
  /** Fire the observer callback initially with no mutations. */
  initial = bool
}

export class IntersectionObserverSettings {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  observer?: IntersectionObserver
}

export const observe = {
  resize: toFluent(ResizeObserverSettings, settings =>
    (el: Element, fn: ResizeObserverCallback) => {
      const observer = new ResizeObserver(fn)
      observer.observe(el, settings)
      if (settings.initial) fn([], observer)
      return () => observer.disconnect()
    }),
  intersection: toFluent(IntersectionObserverSettings, settings =>
    (el: Element, fn: IntersectionObserverCallback) => {
      const observer = settings.observer ?? new IntersectionObserver(fn, settings)
      observer.observe(el)
      return Object.assign(() => {
        if (settings.observer) observer.unobserve(el)
        else observer.disconnect()
      }, { observer })
    }),
  mutation: toFluent(MutationObserverSettings, settings =>
    (el: Element | ShadowRoot, fn: MutationCallback) => {
      const observer = new MutationObserver(fn)
      observer.observe(el, settings)
      if (settings.initial) fn([], observer)
      return () => observer.disconnect()
    }),
  gc: <T>(item: object, value: T, fn: (heldValue: T) => void) => {
    const reg = new FinalizationRegistry(fn)
    reg.register(item, value)
    return reg
  },
}
