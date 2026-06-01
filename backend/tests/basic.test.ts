describe('基础测试', () => {
  test('Jest应该能运行', () => {
    expect(1 + 1).toBe(2);
  });

  test('异步测试应该能工作', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
