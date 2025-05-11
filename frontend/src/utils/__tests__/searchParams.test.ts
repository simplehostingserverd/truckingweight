import {
  toSearchParamString,
  toSearchParamNumber,
  toSearchParamBoolean,
  parseSearchParams,
  createSearchParams,
} from '../searchParams';

describe('searchParams utilities', () => {
  describe('toSearchParamString', () => {
    it('should handle string values', () => {
      expect(toSearchParamString('test')).toBe('test');
    });

    it('should handle undefined values', () => {
      expect(toSearchParamString(undefined)).toBe('');
      expect(toSearchParamString(undefined, 'default')).toBe('default');
    });

    it('should handle string array values', () => {
      expect(toSearchParamString(['a', 'b', 'c'])).toBe('a,b,c');
    });

    it('should handle empty array values', () => {
      expect(toSearchParamString([])).toBe('');
    });
  });

  describe('toSearchParamNumber', () => {
    it('should convert string to number', () => {
      expect(toSearchParamNumber('42')).toBe(42);
    });

    it('should handle undefined values', () => {
      expect(toSearchParamNumber(undefined)).toBe(0);
      expect(toSearchParamNumber(undefined, 10)).toBe(10);
    });

    it('should handle string array values', () => {
      expect(toSearchParamNumber(['42', '43'])).toBe(42);
    });

    it('should handle invalid number strings', () => {
      expect(toSearchParamNumber('not-a-number')).toBe(0);
      expect(toSearchParamNumber('not-a-number', 99)).toBe(99);
    });
  });

  describe('toSearchParamBoolean', () => {
    it('should convert truthy strings to true', () => {
      expect(toSearchParamBoolean('true')).toBe(true);
      expect(toSearchParamBoolean('1')).toBe(true);
      expect(toSearchParamBoolean('yes')).toBe(true);
      expect(toSearchParamBoolean('y')).toBe(true);
    });

    it('should convert other strings to false', () => {
      expect(toSearchParamBoolean('false')).toBe(false);
      expect(toSearchParamBoolean('0')).toBe(false);
      expect(toSearchParamBoolean('no')).toBe(false);
      expect(toSearchParamBoolean('anything-else')).toBe(false);
    });

    it('should handle undefined values', () => {
      expect(toSearchParamBoolean(undefined)).toBe(false);
      expect(toSearchParamBoolean(undefined, true)).toBe(true);
    });

    it('should handle string array values', () => {
      expect(toSearchParamBoolean(['true', 'false'])).toBe(true);
      expect(toSearchParamBoolean(['false', 'no'])).toBe(false);
    });
  });

  describe('parseSearchParams', () => {
    it('should convert all values to strings', () => {
      const params = {
        a: 'string',
        b: ['array', 'of', 'strings'],
        c: undefined,
      };

      const result = parseSearchParams(params);

      expect(result).toEqual({
        a: 'string',
        b: 'array,of,strings',
        c: '',
      });
    });
  });

  describe('createSearchParams', () => {
    it('should create URLSearchParams from object', () => {
      const params = {
        query: 'test',
        page: 2,
        active: true,
        empty: undefined,
      };

      const searchParams = createSearchParams(params);

      expect(searchParams.toString()).toBe('query=test&page=2&active=true');
      expect(searchParams.has('empty')).toBe(false);
    });
  });
});
