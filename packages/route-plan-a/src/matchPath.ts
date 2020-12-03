export function ruleToPathname(rule: string, data: {[key: string]: any}): {pathname: string; params: {[key: string]: any}} {
  if (/:\w/.test(rule)) {
    return {pathname: rule, params: data};
  }
  return {pathname: rule, params: data};
}
