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
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
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
    description: 'Given a sorted array of integers nums and an integer target, return the index of target. If not found, return -1.',
    constraints: '1 <= nums.length <= 10^4\nAll integers in nums are unique.\nnums is sorted in ascending order.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }
    ],
    evalPrompt: 'Reward correct binary search. Check for off-by-one errors. Penalize linear search.',
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
