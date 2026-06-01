let problems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'easy',
    topic: 'arrays',
    type: 'algorithm',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    testCases: [
      { label: 'Example 1', stdin: '4\n2 7 11 15\n9', expected: '0 1' },
      { label: 'Example 2', stdin: '3\n3 2 4\n6', expected: '1 2' },
      { label: 'Duplicate values', stdin: '2\n3 3\n6', expected: '0 1' }
    ],
    starterCode: {
      python: `import sys

def twoSum(nums, target):
    # Write your solution here
    pass

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:n+1]))
target = int(data[n+1])
print(*twoSum(nums, target))
`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const n = parseInt(lines[0]);
const nums = lines[1].split(' ').map(Number);
const target = parseInt(lines[2]);

function twoSum(nums, target) {
  // Write your solution here
}

console.log(twoSum(nums, target).join(' '));
`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}
`
    },
    evalPrompt: 'Reward hash map O(n) approach. Penalize brute force O(n^2). Check that the candidate explains why a hash map works here.',
    isPublic: false,
    createdBy: 2,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 2,
    title: 'Group Anagrams',
    difficulty: 'medium',
    topic: 'strings',
    type: 'algorithm',
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    constraints: '1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' }
    ],
    testCases: [
      { label: 'Example 1', stdin: '3\neat\ntea\nate', expected: 'ate eat tea' },
      { label: 'Mixed groups', stdin: '4\neat\ntea\ntan\nnat', expected: 'ate eat tea\nant nat tan' },
      { label: 'Single word', stdin: '1\nhello', expected: 'hello' }
    ],
    starterCode: {
      python: `import sys
from collections import defaultdict

def groupAnagrams(strs):
    # Write your solution here
    pass

data = sys.stdin.read().strip().split('\\n')
n = int(data[0])
strs = data[1:n+1]
result = groupAnagrams(strs)
result = [sorted(g) for g in result]
result.sort(key=lambda g: g[0] if g else '')
for group in result:
    print(' '.join(group))
`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const n = parseInt(lines[0]);
const strs = lines.slice(1, n + 1);

function groupAnagrams(strs) {
  // Write your solution here
}

const result = groupAnagrams(strs);
result.forEach(g => g.sort());
result.sort((a, b) => a[0].localeCompare(b[0]));
result.forEach(g => console.log(g.join(' ')));
`,
      java: `import java.util.*;

public class Main {
    public static List<List<String>> groupAnagrams(String[] strs) {
        // Write your solution here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        String[] strs = new String[n];
        for (int i = 0; i < n; i++) strs[i] = sc.nextLine().trim();
        List<List<String>> result = groupAnagrams(strs);
        result.forEach(g -> { Collections.sort(g); });
        result.sort(Comparator.comparing(g -> g.get(0)));
        result.forEach(g -> System.out.println(String.join(" ", g)));
    }
}
`
    },
    evalPrompt: 'Reward sorted-key or character-count grouping. Check for edge cases like empty strings. Penalize nested loop solutions.',
    isPublic: false,
    createdBy: 2,
    createdAt: '2024-01-11T00:00:00Z'
  },
  {
    id: 3,
    title: 'Valid Parentheses',
    difficulty: 'easy',
    topic: 'strings',
    type: 'algorithm',
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: open brackets are closed by the same type, open brackets are closed in the correct order, and every close bracket has a corresponding open bracket.",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    testCases: [
      { label: 'Simple pair', stdin: '()', expected: 'true' },
      { label: 'Mixed valid', stdin: '()[]{}', expected: 'true' },
      { label: 'Mismatched', stdin: '(]', expected: 'false' },
      { label: 'Nested', stdin: '{[()]}', expected: 'true' },
      { label: 'Unclosed', stdin: '([)', expected: 'false' }
    ],
    starterCode: {
      python: `import sys

def isValid(s):
    # Write your solution here
    pass

s = sys.stdin.read().strip()
print(str(isValid(s)).lower())
`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

function isValid(s) {
  // Write your solution here
}

console.log(isValid(s).toString());
`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        System.out.println(isValid(s));
    }
}
`
    },
    evalPrompt: 'Reward stack-based solution. Check that all three bracket types are handled correctly.',
    isPublic: true,
    createdBy: 1,
    createdAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 4,
    title: 'Binary Search',
    difficulty: 'easy',
    topic: 'arrays',
    type: 'algorithm',
    description: 'Given a sorted array of integers nums and an integer target, return the index of target. If target is not found, return -1. You must write an algorithm with O(log n) runtime complexity.',
    constraints: '1 <= nums.length <= 10^4\nAll integers in nums are unique.\nnums is sorted in ascending order.\n-10^4 <= nums[i], target <= 10^4',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }
    ],
    testCases: [
      { label: 'Found middle', stdin: '6\n-1 0 3 5 9 12\n9', expected: '4' },
      { label: 'Not found', stdin: '6\n-1 0 3 5 9 12\n2', expected: '-1' },
      { label: 'First element', stdin: '4\n1 3 5 7\n1', expected: '0' },
      { label: 'Last element', stdin: '4\n1 3 5 7\n7', expected: '3' }
    ],
    starterCode: {
      python: `import sys

def search(nums, target):
    # Write your solution here
    pass

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:n+1]))
target = int(data[n+1])
print(search(nums, target))
`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const n = parseInt(lines[0]);
const nums = lines[1].split(' ').map(Number);
const target = parseInt(lines[2]);

function search(nums, target) {
  // Write your solution here
}

console.log(search(nums, target));
`,
      java: `import java.util.*;

public class Main {
    public static int search(int[] nums, int target) {
        // Write your solution here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        System.out.println(search(nums, target));
    }
}
`
    },
    evalPrompt: 'Reward correct binary search with O(log n). Check for off-by-one errors. Penalize linear search.',
    isPublic: true,
    createdBy: 1,
    createdAt: '2024-01-13T00:00:00Z'
  },
  {
    id: 5,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    topic: 'strings',
    type: 'algorithm',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc"' },
      { input: 's = "bbbbb"', output: '1' }
    ],
    testCases: [
      { label: 'Example 1', stdin: 'abcabcbb', expected: '3' },
      { label: 'All same', stdin: 'bbbbb', expected: '1' },
      { label: 'No repeats', stdin: 'abcdef', expected: '6' },
      { label: 'Empty string', stdin: '', expected: '0' }
    ],
    starterCode: {
      python: `import sys

def lengthOfLongestSubstring(s):
    # Write your solution here
    pass

s = sys.stdin.read().strip()
print(lengthOfLongestSubstring(s))
`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

function lengthOfLongestSubstring(s) {
  // Write your solution here
}

console.log(lengthOfLongestSubstring(s));
`,
      java: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine().trim() : "";
        System.out.println(lengthOfLongestSubstring(s));
    }
}
`
    },
    evalPrompt: 'Reward sliding window approach with a set or map. Penalize O(n^2) brute force.',
    isPublic: false,
    createdBy: 2,
    createdAt: '2024-01-14T00:00:00Z'
  }
];
let nextId = 6;

const findAll = (filters = {}) => {
  let result = problems;
  if (filters.difficulty) result = result.filter(p => p.difficulty === filters.difficulty);
  if (filters.topic) result = result.filter(p => p.topic === filters.topic);
  if (filters.type) result = result.filter(p => p.type === filters.type);
  return result;
};

const findById = (id) => problems.find(p => p.id === id);

const create = (data) => {
  const problem = { id: nextId++, ...data, createdAt: new Date().toISOString() };
  problems.push(problem);
  return problem;
};

const update = (id, data) => {
  const idx = problems.findIndex(p => p.id === id);
  if (idx === -1) return null;
  problems[idx] = { ...problems[idx], ...data };
  return problems[idx];
};

const remove = (id) => {
  const idx = problems.findIndex(p => p.id === id);
  if (idx === -1) return false;
  problems.splice(idx, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
