import useRecognizers from './useRecognizers'
import ScrollRecognizer from '../recognizers/ScrollRecognizer'
import { Handler, UseScrollConfig } from '../types'
import { buildScrollConfig } from './buildConfig'

/**
 * Scroll hook.
 *
 * @param handler - the function fired every time the scroll gesture updates
 * @param [config={}] - the config object including generic options and scroll options
 */
export function useScroll(handler: Handler<'scroll'>, config: UseScrollConfig | {} = {}) {
  return useRecognizers<UseScrollConfig>({ scroll: handler }, [ScrollRecognizer], buildScrollConfig(config))
}
