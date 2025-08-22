export class IdGenerator {
  static generate(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static generateWithPrefix(prefix: string): string {
    return `${prefix}_${this.generate()}`;
  }

  static generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}
