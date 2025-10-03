function sum (a, b) {
  return a + b;
}

function isPalindrome(str){
  let normalized = str.toLowerCase();
  let reverseStr = str.split("").reverse().join("");
  if (normalized === reverseStr){
    return true
  }
  return false
}

function isStrongPassword(password){
  let hasLetter = /[A-Za-z]/.test(password);
  let hasNumber = /[0-9]/.test(password);
  let hasSpecialChar = /[!@#$]/.test(password);

return password.length >= 16 && hasLetter && hasNumber && hasSpecialChar

}

function wordsCounter(str){
return str.trim().split(" ").length;

}

function longestCommonPrefix(strs) {
    if (!strs.length) return "";

    let prefix = strs[0]; // предполагаем, что первый элемент — это общий префикс

    for (let i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, -1); // обрезаем последний символ
            if (prefix === "") return "";
        }
    }

    return prefix;
}

function lengthOfLastWord(s) {
  // убираем пробелы по краям, делим по любым пробельным последовательностям
  // берём последний элемент и возвращаем его длину
  const trimmed = s.trim();
  if (trimmed === "") return 0;        // на всякий случай
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1].length;
}

function climbStairs(n) {
  if (n <= 2) return n;

  let a = 1, b = 2; // ways(1)=1, ways(2)=2
  for (let i = 3; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

module.exports = { sum, isPalindrome, isStrongPassword, wordsCounter, longestCommonPrefix, lengthOfLastWord, climbStairs }; 