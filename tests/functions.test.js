let {sum, isPalindrome, isStrongPassword, wordsCounter, longestCommonPrefix, lengthOfLastWord, climbStairs} = require('../src/functions');

describe('sum function', () => {
    test ("sum two numbers", () => {
        expect(sum(2,2)).toBe(4);
    });


    test ("work with null", ()=>{
        expect (sum(0,0)).toBe(0)
    })
})

describe ("check if a string is palindrome", ()=>{
    let strArray =['anna', 'civic', 'level', 'radar', 'mam']
    strArray.forEach(elem => {
        test(`should return true for ${elem}`, () => {
            expect(isPalindrome(elem)).toBe(true)
        })
    })
})


describe ("is password is strong", ()=>{
    let passArray = ['StrongPassw0rd!@#$', 'An0ther$trongP@ssw0rd!!', 'RavIlASSBeST11231OFALL!']
    passArray.forEach(elem => {
        test(`should return true for ${elem}`, () => {
            expect(isStrongPassword(elem)).toBe(true)
        })
    })
})

describe ("is password is not strong", ()=>{
    let passArray = ['weakpassword', 'Short1!', 'NoSpecialChar1234', 'NoNumber!@#$%^&*()']
    passArray.forEach(elem => {
        test(`should return false for ${elem}`, () => {
            expect(isStrongPassword(elem)).toBe(false)
        })
    })
})

describe("is strong password", () => {
  const weakPassArray = ["12345", "password", "qwerty"];

  weakPassArray.forEach(elem => {
    test(`"${elem}" is not a strong password`, () => {
      expect(isStrongPassword(elem)).toBe(false);
    });
  });
});

describe("count words in a string", () => {
  const strArray = [
    ["Hello world, this is a test string.", 7],
    ["One two three", 3],
    ["  Leading and trailing spaces  ", 4]
  ];

  strArray.forEach(([input, expected]) => {
    test(`"${input}" has ${expected} words`, () => {
      expect(wordsCounter(input)).toBe(expected);
    });
  });
});

describe("longest common prefix", () => {
  const testCases = [
    [["flower","flow","flight"], "fl"],
    [["dog","racecar","car"], ""],
    [["interspecies","interstellar","interstate"], "inters"],
    [["throne","throne"], "throne"],
    [["a"], "a"],
    [[], ""]
  ];

  testCases.forEach(([input, expected]) => {
    test(`[${input.join(", ")}] -> "${expected}"`, () => {
      expect(longestCommonPrefix(input)).toBe(expected);
    });
  });
});


describe("length of last word", () => {
  const cases = [
    ["Hello World", 5],
    ["   fly me   to   the moon  ", 4],
    ["luffy is still joyboy", 6],
    ["a", 1],
    ["a ", 1],
    ["  abc  ", 3],
    ["word   ", 4],
    ["multiple   spaces   here", 4],
  ];

  cases.forEach(([input, expected]) => {
    test(`"${input}" -> ${expected}`, () => {
      expect(lengthOfLastWord(input)).toBe(expected);
    });
  });
});


describe("climb stairs", () => {
  const cases = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 5],
    [5, 8],
    [10, 89],
    [45, 1836311903], // max по условию
  ];

  cases.forEach(([input, expected]) => {
    test(`n = ${input} -> ${expected}`, () => {
      expect(climbStairs(input)).toBe(expected);
    });
  });
});
