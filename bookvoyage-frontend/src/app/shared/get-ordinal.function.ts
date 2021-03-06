/**
 * This function generates ordinal strings from integers.
 * Taken from https://stackoverflow.com/questions/12487422/take-a-value-1-31-and-convert-it-to-ordinal-date-w-javascript
 */
export function getOrdinal(n) {
  if((parseFloat(n) == parseInt(n)) && !isNaN(n)){
    let s=["th","st","nd","rd"],
      v=n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
  }
  return n;
}

export function getOrdinalNL(n) {
  if((parseFloat(n) == parseInt(n)) && !isNaN(n)){
    return n+("e");
  }
  return n;
}

export function getOrdinalPT(n) {
  if((parseFloat(n) == parseInt(n)) && !isNaN(n)){
    return n+("°");
  }
  return n;
}

export function getOrdinalES(n) {
  if((parseFloat(n) == parseInt(n)) && !isNaN(n)){
    return n+(".°");
  }
  return n;
}
