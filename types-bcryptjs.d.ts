declare module 'bcryptjs' {
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;
  export function hashSync(data: string | Buffer, salt: string | number): string;
  export function compareSync(data: string | Buffer, encrypted: string): boolean;

  const bcrypt: {
    hash: typeof hash;
    compare: typeof compare;
    genSalt: typeof genSalt;
    genSaltSync: typeof genSaltSync;
    hashSync: typeof hashSync;
    compareSync: typeof compareSync;
  };

  export default bcrypt;
}
