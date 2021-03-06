/**
 * Diff two arrays of objects by key.
 * @function
 *
 * @param   {array}  arr1 first array to compare
 * @param   {array}  arr2 second array to comprare
 * @param   {string} key  objecy key (in arrays) to compare against
 *
 * @returns {array}  diff between two arrays
 */
export const arrayDiff = <Arr>(arr1: Arr[], arr2: Arr[], key: string): Arr[] =>
  arr1.filter(item1 => !arr2.some(item2 => item1[key] === item2[key]));
