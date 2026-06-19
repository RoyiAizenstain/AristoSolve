'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('problems', [
      {
        title: 'Two Sum', difficulty: 'easy', topic: 'arrays', type: 'algorithm',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
        examples: JSON.stringify([{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }]),
        testCases: JSON.stringify([
          { label: 'Example 1', stdin: '4\n2 7 11 15\n9', expected: '0 1' },
          { label: 'Example 2', stdin: '3\n3 2 4\n6',     expected: '1 2' },
        ]),
        starterCode: JSON.stringify({
          python: 'import sys\n\ndef twoSum(nums, target):\n    pass\n\ndata = sys.stdin.read().split()\nn = int(data[0])\nnums = list(map(int, data[1:n+1]))\ntarget = int(data[n+1])\nprint(*twoSum(nums, target))\n',
          javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst n = parseInt(lines[0]);\nconst nums = lines[1].split(' ').map(Number);\nconst target = parseInt(lines[2]);\nfunction twoSum(nums, target) {}\nconsole.log(twoSum(nums, target).join(' '));\n",
          java: 'import java.util.*;\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) { return new int[]{}; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(); int[] nums = new int[n];\n        for (int i=0;i<n;i++) nums[i]=sc.nextInt();\n        int target=sc.nextInt();\n        int[] r=twoSum(nums,target);\n        System.out.println(r[0]+" "+r[1]);\n    }\n}\n',
        }),
        evalPrompt: 'Reward hash map O(n) approach. Penalize brute force O(n^2).',
        isPublic: false, createdBy: 2, createdAt: new Date(),
      },
      {
        title: 'Valid Parentheses', difficulty: 'easy', topic: 'strings', type: 'algorithm',
        description: "Given a string s containing just '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
        examples: JSON.stringify([{ input: 's = "()"', output: 'true' }, { input: 's = "(]"', output: 'false' }]),
        testCases: JSON.stringify([
          { label: 'Simple pair',  stdin: '()',     expected: 'true'  },
          { label: 'Mixed valid',  stdin: '()[]{}', expected: 'true'  },
          { label: 'Mismatched',   stdin: '(]',     expected: 'false' },
          { label: 'Nested',       stdin: '{[()]}', expected: 'true'  },
        ]),
        starterCode: JSON.stringify({
          python: 'import sys\n\ndef isValid(s):\n    pass\n\ns = sys.stdin.read().strip()\nprint(str(isValid(s)).lower())\n',
          javascript: "const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nfunction isValid(s) {}\nconsole.log(isValid(s).toString());\n",
          java: 'import java.util.*;\npublic class Main {\n    public static boolean isValid(String s) { return false; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println(isValid(sc.nextLine().trim()));\n    }\n}\n',
        }),
        evalPrompt: 'Reward stack-based solution. Check all three bracket types are handled.',
        isPublic: true, createdBy: 1, createdAt: new Date(),
      },
      {
        title: 'Binary Search', difficulty: 'easy', topic: 'arrays', type: 'algorithm',
        description: 'Given a sorted array of integers nums and an integer target, return the index of target. If not found, return -1.',
        constraints: '1 <= nums.length <= 10^4\nAll integers are unique.\nnums is sorted ascending.',
        examples: JSON.stringify([{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }]),
        testCases: JSON.stringify([
          { label: 'Found',      stdin: '6\n-1 0 3 5 9 12\n9', expected: '4'  },
          { label: 'Not found',  stdin: '6\n-1 0 3 5 9 12\n2', expected: '-1' },
          { label: 'First',      stdin: '4\n1 3 5 7\n1',        expected: '0'  },
        ]),
        starterCode: JSON.stringify({
          python: 'import sys\n\ndef search(nums, target):\n    pass\n\ndata = sys.stdin.read().split()\nn = int(data[0])\nnums = list(map(int, data[1:n+1]))\ntarget = int(data[n+1])\nprint(search(nums, target))\n',
          javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst n = parseInt(lines[0]);\nconst nums = lines[1].split(' ').map(Number);\nconst target = parseInt(lines[2]);\nfunction search(nums, target) {}\nconsole.log(search(nums, target));\n",
          java: 'import java.util.*;\npublic class Main {\n    public static int search(int[] nums, int target) { return -1; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n=sc.nextInt(); int[] nums=new int[n];\n        for(int i=0;i<n;i++) nums[i]=sc.nextInt();\n        System.out.println(search(nums,sc.nextInt()));\n    }\n}\n',
        }),
        evalPrompt: 'Reward O(log n) binary search. Penalize linear search.',
        isPublic: true, createdBy: 1, createdAt: new Date(),
      },
      {
        title: 'Group Anagrams', difficulty: 'medium', topic: 'strings', type: 'algorithm',
        description: 'Given an array of strings strs, group the anagrams together.',
        constraints: '1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100',
        examples: JSON.stringify([{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }]),
        testCases: JSON.stringify([
          { label: 'Example 1', stdin: '3\neat\ntea\nate',             expected: 'ate eat tea' },
          { label: 'Single',    stdin: '1\nhello',                     expected: 'hello'       },
        ]),
        starterCode: JSON.stringify({
          python: 'import sys\nfrom collections import defaultdict\n\ndef groupAnagrams(strs):\n    pass\n\ndata = sys.stdin.read().strip().split(\'\\n\')\nn = int(data[0])\nstrs = data[1:n+1]\nresult = groupAnagrams(strs)\nresult = [sorted(g) for g in result]\nresult.sort(key=lambda g: g[0] if g else \'\')\nfor group in result:\n    print(\' \'.join(group))\n',
          javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst n = parseInt(lines[0]);\nconst strs = lines.slice(1, n+1);\nfunction groupAnagrams(strs) {}\nconst r = groupAnagrams(strs);\nr.forEach(g=>g.sort()); r.sort((a,b)=>a[0].localeCompare(b[0]));\nr.forEach(g=>console.log(g.join(' ')));\n",
          java: 'import java.util.*;\npublic class Main {\n    public static List<List<String>> groupAnagrams(String[] s) { return new ArrayList<>(); }\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in);\n        int n=Integer.parseInt(sc.nextLine().trim());\n        String[] s=new String[n];\n        for(int i=0;i<n;i++) s[i]=sc.nextLine().trim();\n        List<List<String>> r=groupAnagrams(s);\n        r.forEach(g->{Collections.sort(g);});\n        r.sort(Comparator.comparing(g->g.get(0)));\n        r.forEach(g->System.out.println(String.join(" ",g)));\n    }\n}\n',
        }),
        evalPrompt: 'Reward sorted-key grouping. Penalize nested loops.',
        isPublic: false, createdBy: 2, createdAt: new Date(),
      },
      {
        title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', topic: 'strings', type: 'algorithm',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        constraints: '0 <= s.length <= 5 * 10^4',
        examples: JSON.stringify([{ input: 's = "abcabcbb"', output: '3' }]),
        testCases: JSON.stringify([
          { label: 'Example 1', stdin: 'abcabcbb', expected: '3' },
          { label: 'All same',  stdin: 'bbbbb',    expected: '1' },
          { label: 'No repeat', stdin: 'abcdef',   expected: '6' },
        ]),
        starterCode: JSON.stringify({
          python: 'import sys\n\ndef lengthOfLongestSubstring(s):\n    pass\n\ns = sys.stdin.read().strip()\nprint(lengthOfLongestSubstring(s))\n',
          javascript: "const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nfunction lengthOfLongestSubstring(s) {}\nconsole.log(lengthOfLongestSubstring(s));\n",
          java: 'import java.util.*;\npublic class Main {\n    public static int lengthOfLongestSubstring(String s) { return 0; }\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in);\n        String s=sc.hasNextLine()?sc.nextLine().trim():"";\n        System.out.println(lengthOfLongestSubstring(s));\n    }\n}\n',
        }),
        evalPrompt: 'Reward sliding window. Penalize O(n^2) brute force.',
        isPublic: false, createdBy: 2, createdAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('problems', null, {});
  },
};
