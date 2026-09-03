export function getArgumentValue(args: string[], argumentName: string): string | undefined {
  const argumentIndex = args.indexOf(argumentName);
  return argumentIndex === -1 ? undefined : args[argumentIndex + 1];
}