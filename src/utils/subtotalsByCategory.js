export function subtotalsByCategory({ dataObj, keyLookup, valueLookup }) {
  return dataObj.reduce((acc, curr) => {
    const key = curr[keyLookup];
    const value = Number(curr[valueLookup]);

    if (acc[key]) {
      acc[key] += value;
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});
}
