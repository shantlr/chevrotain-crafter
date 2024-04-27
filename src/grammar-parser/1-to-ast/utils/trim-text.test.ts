import { trimTextLines } from './trim-text';

describe('trimTextLines', () => {
  it('should trim spaces', () => {
    expect(trimTextLines('    ').text).toBe('');
  });
  it('should trim basic line', () => {
    expect(trimTextLines('    hello    ').text).toBe('hello');
  });
  it('should trim trailing spaces with line break', () => {
    expect(trimTextLines('    hello    \n').text).toBe('hello');
  });
  it('should trim multiple line breaks', () => {
    expect(trimTextLines('    hello    \n\n\n').text).toBe('hello');
  });
  it('should trim multiple line break in the midle', () => {
    expect(trimTextLines('    hello    \n\n\nworld').text).toBe('hello\nworld');
  });

  describe('offset', () => {
    it('should give correct offset for head space', () => {
      expect(trimTextLines(' hello').getOriginalOffset(0)).toBe(1);
    });
    it('should give correct offset for multiple spaces', () => {
      expect(trimTextLines('   hello').getOriginalOffset(0)).toBe(3);
    });
    it('should give correct offset for multiple new lines', () => {
      expect(trimTextLines('\n\nhello').getOriginalOffset(0)).toBe(2);
    });
  });
});
