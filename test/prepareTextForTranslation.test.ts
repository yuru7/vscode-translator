import { describe, expect, it } from 'vitest';
import { prepareTextForTranslation } from '../src/translate/prepareTextForTranslation';

describe('prepareTextForTranslation', () => {
  it('splits camelCase into words', () => {
    expect(prepareTextForTranslation('getUserName')).toBe('get User Name');
  });

  it('splits PascalCase into words', () => {
    expect(prepareTextForTranslation('GetUserName')).toBe('Get User Name');
  });

  it('splits kebab-case into words', () => {
    expect(prepareTextForTranslation('get-user-name')).toBe('get user name');
  });

  it('splits snake_case into words', () => {
    expect(prepareTextForTranslation('get_user_name')).toBe('get user name');
  });

  it('splits SCREAMING_SNAKE_CASE into words', () => {
    expect(prepareTextForTranslation('GET_USER_NAME')).toBe('GET USER NAME');
  });

  it('splits acronym boundaries in PascalCase', () => {
    expect(prepareTextForTranslation('XMLHttpRequest')).toBe(
      'XML Http Request'
    );
    expect(prepareTextForTranslation('parseHTMLString')).toBe(
      'parse HTML String'
    );
  });

  it('trims surrounding whitespace before splitting identifiers', () => {
    expect(prepareTextForTranslation('  getUserName  ')).toBe('get User Name');
  });

  it('leaves plain words unchanged', () => {
    expect(prepareTextForTranslation('hello')).toBe('hello');
    expect(prepareTextForTranslation('Hello')).toBe('Hello');
    expect(prepareTextForTranslation('CONSTANT')).toBe('CONSTANT');
  });

  it('leaves dotted member access unchanged', () => {
    expect(prepareTextForTranslation('foo.bar.getUserName')).toBe(
      'foo.bar.getUserName'
    );
    expect(prepareTextForTranslation('obj.getUserName')).toBe(
      'obj.getUserName'
    );
  });

  it('leaves function-call style text unchanged', () => {
    expect(prepareTextForTranslation('getUserName()')).toBe('getUserName()');
    expect(prepareTextForTranslation('foo.bar()')).toBe('foo.bar()');
  });

  it('leaves sentences with identifiers unchanged', () => {
    expect(
      prepareTextForTranslation('Please call getUserName before continue')
    ).toBe('Please call getUserName before continue');
  });

  it('leaves other code-like symbols unchanged', () => {
    expect(prepareTextForTranslation('foo::bar')).toBe('foo::bar');
    expect(prepareTextForTranslation('user[name]')).toBe('user[name]');
    expect(prepareTextForTranslation('getUserName;')).toBe('getUserName;');
    expect(prepareTextForTranslation('/path/to/file')).toBe('/path/to/file');
  });
});
