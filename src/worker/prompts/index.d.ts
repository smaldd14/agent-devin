// TypeScript declaration to import .txt files as strings
declare module '*.txt' {
  const content: string;
  export default content;
}