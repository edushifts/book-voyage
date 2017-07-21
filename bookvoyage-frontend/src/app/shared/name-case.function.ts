/**
 * @function
 * @description
 * Auxiliary function that parses names and capitalises them
 * Not perfect at the moment.
 * Adjusted from here: https://gist.github.com/jeffjohnson9046/9789876
 */
export function nameCase(input) {
  let smallWords = /^(de|van|der|den|te|ter|ten|a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  input = input.toLowerCase();

  // takes whole words divided by whitespace
  return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {

    // deal with words that should be lowercase
    if (index + match.length !== title.length && // index > 0 &&
      match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (match.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
}
