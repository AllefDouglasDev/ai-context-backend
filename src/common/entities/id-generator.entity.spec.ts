import { IdGenerator } from './id-generator.entity';

describe('IdGenerator Entity', () => {
  describe('generate', () => {
    it('should generate a unique ID', () => {
      const id1 = IdGenerator.generate();
      const id2 = IdGenerator.generate();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs with consistent format', () => {
      const id = IdGenerator.generate();

      expect(id.length).toBeGreaterThan(10);
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('generateWithPrefix', () => {
    it('should generate ID with given prefix', () => {
      const prefix = 'user';
      const id = IdGenerator.generateWithPrefix(prefix);

      expect(id.startsWith(`${prefix}_`)).toBe(true);
      expect(id.length).toBeGreaterThan(prefix.length + 1);
    });

    it('should generate unique IDs with same prefix', () => {
      const prefix = 'test';
      const id1 = IdGenerator.generateWithPrefix(prefix);
      const id2 = IdGenerator.generateWithPrefix(prefix);

      expect(id1.startsWith(`${prefix}_`)).toBe(true);
      expect(id2.startsWith(`${prefix}_`)).toBe(true);
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateUuid', () => {
    it('should generate a valid UUID format', () => {
      const uuid = IdGenerator.generateUuid();

      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = IdGenerator.generateUuid();
      const uuid2 = IdGenerator.generateUuid();

      expect(uuid1).not.toBe(uuid2);
      expect(uuid1.length).toBe(36);
      expect(uuid2.length).toBe(36);
    });

    it('should always have version 4 UUID format', () => {
      for (let i = 0; i < 10; i++) {
        const uuid = IdGenerator.generateUuid();
        expect(uuid.charAt(14)).toBe('4'); // Version 4 UUID
        expect(['8', '9', 'a', 'b']).toContain(uuid.charAt(19).toLowerCase()); // Variant bits
      }
    });
  });
});
